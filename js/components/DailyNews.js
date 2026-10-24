/* 每日外送焦點情報（Uber & Foodpanda）：讀取 data/daily_news.json（由 GitHub Actions 每日更新）。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['daily-news'] = {
    name: 'DailyNews',
    setup() {
      const { ref, watch, onMounted, inject } = root.Vue;
      const dsc = inject('dsc');
      const items = ref([]);
      const updatedAt = ref('');
      const status = ref('loading'); // loading | ok | error
      let busy = false;
      const load = async () => {
        if (busy) return;
        busy = true;
        status.value = 'loading';
        try {
          const res = await fetch('data/daily_news.json', { cache: 'no-cache' });
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          items.value = Array.isArray(data.items) ? data.items : [];
          updatedAt.value = (data.updatedAt || '').slice(0, 10);
          status.value = items.value.length ? 'ok' : 'error';
        } catch (e) {
          status.value = 'error';
        } finally {
          busy = false;
        }
      };
      onMounted(load);
      watch(dsc.activeTab, (tab) => {
        if (tab === 'news' && items.value.length === 0) load();
      });
      return { items, updatedAt, status, load };
    },
    template: `
<section class="bg-white/80 ring-1 ring-ink-200/60 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 pb-2.5 border-b border-ink-200/60">
    <div class="flex items-center gap-2">
      <span class="w-7 h-7 rounded-lg bg-jade-0 text-jade-700 flex items-center justify-center shrink-0 border border-jade-500/20">
        <ico name="newspaper" class="w-4 h-4"/>
      </span>
      <div>
        <h2 class="font-display font-bold text-ink-950 text-sm sm:text-base leading-tight">每日外送焦點情報</h2>
        <p class="text-[10px] text-ink-600 leading-normal">Uber &amp; Foodpanda 全球動態與勞權轉譯</p>
      </div>
    </div>
    <div v-if="updatedAt" class="flex items-center gap-1.5 self-start sm:self-auto pl-9 sm:pl-0">
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-100 text-ink-700 text-[10px] font-mono shrink-0 whitespace-nowrap border border-ink-200">
        <ico name="calendar" class="w-3 h-3 text-ink-500"/> 更新於 {{ updatedAt }}
      </span>
    </div>
  </div>
  <p v-if="status === 'loading'" class="text-[11px] text-ink-700">載入今日情報中…</p>
  <div v-else-if="status === 'error'" class="flex items-center justify-between gap-2 text-[11px] text-ink-700">
    <span>今日情報暫時無法取得（離線或來源異常），稍後再試。</span>
    <button type="button" @click="load" class="seg-btn">重試</button>
  </div>
  <ul v-else class="space-y-3">
    <li v-for="(n, i) in items" :key="i" class="border-t border-ink-200/60 pt-3 first:border-0 first:pt-0">
      <div class="flex items-start gap-2">
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-ink-200 text-ink-800 flex-shrink-0">{{ n.tag }}</span>
        <h3 class="text-xs sm:text-sm font-bold text-ink-900">{{ n.title }}</h3>
      </div>
      <ul class="mt-1.5 ml-1 list-disc list-inside text-[11px] text-ink-700 space-y-0.5">
        <li v-for="(s, j) in n.summary" :key="j">{{ s }}</li>
      </ul>
      <a :href="n.url" target="_blank" rel="noopener noreferrer" class="mt-1.5 inline-flex items-center gap-1 text-[11px] text-mist-400 hover:underline">閱讀原文<ico name="external-link"/></a>
    </li>
  </ul>
</section>
`
  };
})(window);
