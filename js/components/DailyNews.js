/* 每日外送焦點情報（Uber & Foodpanda）：讀取 data/daily_news.json（由 GitHub Actions 每日更新）。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['daily-news'] = {
    name: 'DailyNews',
    setup() {
      const { ref, onMounted, inject } = root.Vue;
      const dsc = inject('dsc');
      const items = ref([]);
      const updatedAt = ref('');
      const status = ref('loading'); // loading | ok | error
      const load = async () => {
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
        }
      };
      onMounted(load);
      return { activeTab: dsc.activeTab, items, updatedAt, status, load };
    },
    template: `
<section v-show="activeTab === 'news'" class="bg-white/80 ring-1 ring-ink-200/60 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
  <div class="flex items-center justify-between mb-2.5">
    <h2 class="font-display font-bold text-ink-900 text-sm inline-flex items-center gap-1.5"><ico name="newspaper"/>每日外送焦點情報（Uber &amp; Foodpanda）</h2>
    <span v-if="updatedAt" class="text-[10px] font-mono text-ink-600">{{ updatedAt }}</span>
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
