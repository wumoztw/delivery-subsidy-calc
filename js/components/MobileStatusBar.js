/* 自動由 index.html 拆出：MobileStatusBar。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['mobile-status-bar'] = {
    name: 'MobileStatusBar',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 手機端底部常駐狀態列 -->
<aside class="mstatus sm:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md px-4 pt-2 pb-safe grid grid-cols-3 gap-2 items-end" aria-label="本期概況">
  <div class="min-w-0">
    <span class="text-[11px] text-ink-700 flex items-center gap-1"><ico name="scale"/>預估補貼</span>
    <div class="text-base font-black font-mono truncate" :class="subsidy > 0 ? 'text-ochre-500' : 'text-jade-700'">
      \${{ Math.round(subsidy).toLocaleString() }}
    </div>
  </div>
  <div class="min-w-0 text-center">
    <span class="text-[11px] text-ink-700 flex items-center justify-center gap-1"><ico name="gauge"/>實質時薪</span>
    <div class="text-base font-black font-mono text-teal-300 truncate">
      \${{ netHourlyRate.toFixed(0) }}
    </div>
  </div>
  <div class="min-w-0 text-right">
    <span class="text-[11px] text-ink-700 flex items-center justify-end gap-1"><ico name="wallet"/>總收入</span>
    <div class="text-base font-black font-mono text-ink-950 truncate">
      \${{ Math.round(totalIncome).toLocaleString() }}
    </div>
  </div>
</aside>
`
  };
})(window);
