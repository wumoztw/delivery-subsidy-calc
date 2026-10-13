/* 自動由 index.html 拆出：MobileStatusBar。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['mobile-status-bar'] = {
    name: 'MobileStatusBar',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 手機端底部常駐狀態列 -->
<aside class="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink-900 px-4 py-2.5 shadow-sm pb-safe flex items-center justify-between">
  <div>
    <span class="text-[10px] text-ink-700 block">兩週預估補發差額</span>
    <div class="text-base font-bold font-mono text-blue-900">
      NT$ {{ Math.round(subsidy).toLocaleString() }}
    </div>
  </div>
  <div class="text-right">
    <span class="text-[10px] text-ink-700 block">最終總收入 (含小費/獎勵)</span>
    <div class="text-base font-bold font-mono text-ink-950">
      NT$ {{ Math.round(totalIncome).toLocaleString() }}
    </div>
  </div>
</aside>
`
  };
})(window);
