/**
 * Service Worker：讓頁面在跑單訊號不穩或斷線時仍能開啟。
 * - 本站檔案：stale-while-revalidate（先給快取、背景更新，下次開啟即為新版）
 * - Google Fonts：快取優先（字型檔不會變）
 * 改動 APP_SHELL 清單或想強制全部重抓時，把 CACHE_VERSION 加一。
 */
const CACHE_VERSION = 'dsc-v5';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './vendor/vue.global.prod.js',
  './vendor/papaparse.min.js',
  './js/config.js',
  './js/calc.js',
  './js/cycle.js',
  './js/parser.js',
  './js/report.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
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

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      const res = await network;
      if (res) return res;
      // 離線且沒快取到的頁面導航 → 回首頁
      if (request.mode === 'navigate') return cache.match('./index.html');
      return Response.error();
    })
  );
});
