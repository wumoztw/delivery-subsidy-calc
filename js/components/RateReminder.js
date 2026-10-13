/* 費率表年度提醒：11、12 月提醒等公告後加明年費率；跨年後還沒有今年費率則持續警告。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['rate-reminder'] = {
    name: 'RateReminder',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<div v-if="rateReminder" role="status"
  :class="rateReminder.level === 'missing' ? 'bg-crimson-200/20 border-crimson-500/40 text-crimson-500' : 'bg-ochre-0 border-ochre-200 text-amber-800'"
  class="flex items-start gap-2 text-xs p-3 rounded-xl border">
  <span aria-hidden="true">{{ rateReminder.level === 'missing' ? '⚠️' : '🗓️' }}</span>
  <div class="flex-1 leading-relaxed">
    <template v-if="rateReminder.level === 'missing'">
      費率表還沒有 {{ rateReminder.year }} 年的最低工資，{{ rateReminder.year }} 年的訂單目前沿用 {{ rateReminder.lastYear }} 年時薪 {{ rateReminder.lastHourly }} 元計算，保底可能算少。請在官方公告後更新 <code class="font-mono">js/config.js</code> 的 MIN_WAGE_SCHEDULE。
    </template>
    <template v-else>
      {{ rateReminder.year }} 年最低工資還沒加進費率表。等勞動部正式公告（行政院核定）後，記得在 <code class="font-mono">js/config.js</code> 的 MIN_WAGE_SCHEDULE 加一列，跨年那期才算得對。
    </template>
  </div>
  <button v-if="rateReminder.level !== 'missing'" type="button" @click="dismissRateReminder" class="shrink-0 px-2 py-0.5 rounded border border-ink-300 bg-white text-[11px]">知道了</button>
</div>
`
  };
})(window);
