/**
 * Service Worker：讓頁面在跑單訊號不穩或斷線時仍能開啟。
 * - 頁面本身（HTML）：網路優先，斷線才用快取 → 永遠拿到最新的 index.html
 * - 帶 ?v= 的檔案（css/js/vendor）：依完整網址快取。版本號一變就是新網址，
 *   新頁面只會配到同版本的 js，不會再出現「新頁面配舊 app.js」而載入失敗
 * - 其他本站檔案（圖示、manifest）：先給快取、背景更新
 * - Google Fonts：快取優先（字型檔不會變）
 * 改動 APP_SHELL 清單或想強制全部重抓時，把 CACHE_VERSION 加一。
 */
const CACHE_VERSION = 'dsc-v13';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  // cache: 'reload' 繞過瀏覽器與 CDN 的 HTTP 快取，避免剛部署時抓到半新半舊
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(`${CACHE_VERSION}-fonts`).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  const isPage = request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  const isVersioned = url.searchParams.has('v');

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // 1. 頁面：網路優先
      if (isPage) {
        try {
          const res = await fetch(request, { cache: 'no-cache' });
          if (res.ok) cache.put('./index.html', res.clone());
          return res;
        } catch (e) {
          return (await cache.match('./index.html')) || Response.error();
        }
      }
      // 2. 帶版本號的檔案：完整網址比對，不忽略 ?v=
      if (isVersioned) {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch (e) {
          return Response.error();
        }
      }
      // 3. 其他：先給快取、背景更新
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => null);
      if (cached) { event.waitUntil(network); return cached; }
      return (await network) || Response.error();
    })
  );
});
