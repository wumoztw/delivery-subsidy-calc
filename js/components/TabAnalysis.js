/* 自動由 index.html 拆出：TabAnalysis。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['tab-analysis'] = {
    name: 'TabAnalysis',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 分頁 4: 時段與戰力分析 -->
<div v-show="activeTab === 'analysis'" class="space-y-4 sm:space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    <!-- 戰力階級分佈 -->
    <div class="bg-ink-0 p-4 sm:p-5 rounded-2xl border border-ink-200 space-y-3">
      <h3 class="text-sm font-bold text-ink-900 flex items-center gap-1.5">
        <ico name="sparkle"/> 訂單戰力階級統計
      </h3>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between items-center bg-ink-50 p-2.5 rounded-lg">
          <span class="text-ochre-500 font-bold"><ico name="sparkle"/>{{ toned('SSR 頂級黃金疊單 (高單價/短距)') }}</span>
          <span class="font-mono text-ink-900">{{ tierStats.ssr }} 筆</span>
        </div>
        <div class="flex justify-between items-center bg-ink-50 p-2.5 rounded-lg">
          <span class="text-jade-500 font-bold"><ico name="target"/>{{ toned('SR 優質黃金單') }} (&le;2.5km, &le;20分)</span>
          <span class="font-mono text-ink-900">{{ tierStats.sr }} 筆</span>
        </div>
        <div class="flex justify-between items-center bg-ink-50 p-2.5 rounded-lg">
          <span class="text-ink-800"><ico name="zap"/>標準一般單</span>
          <span class="font-mono text-ink-900">{{ tierStats.normal }} 筆</span>
        </div>
        <div class="flex justify-between items-center bg-ink-50 p-2.5 rounded-lg">
          <span class="text-crimson-500"><ico name="alert-triangle"/>{{ toned('遠距 / 紅線單') }} (&gt;3.0km)</span>
          <span class="font-mono text-ink-900">{{ tierStats.warning }} 筆</span>
        </div>
      </div>
    </div>

    <!-- 小費增幅與後發小費統計 -->
    <div class="bg-ink-0 p-4 sm:p-5 rounded-2xl border border-ink-200 space-y-3">
      <h3 class="text-sm font-bold text-ink-900 flex items-center gap-1.5">
        <ico name="heart-handshake"/> 小費效益與期望值
      </h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-ink-50 p-3 rounded-lg text-center">
          <span class="text-ink-600 text-[10px] flex items-center justify-center gap-1"><ico name="heart-handshake"/>後發小費率</span>
          <div class="text-xl font-bold font-mono text-jade-500 mt-1">{{ tipHitRate.toFixed(1) }}%</div>
          <span class="text-[10px] text-ink-600">有小費訂單佔比</span>
        </div>
        <div class="bg-ink-50 p-3 rounded-lg text-center">
          <span class="text-ink-600 text-[10px] flex items-center justify-center gap-1"><ico name="coins"/>平均小費金額</span>
          <div class="text-xl font-bold font-mono text-ochre-500 mt-1">NT$ {{ avgTipAmount.toFixed(1) }}</div>
          <span class="text-[10px] text-ink-600">每趟小費期望值</span>
        </div>
      </div>
      <p class="text-[11px] text-ink-700 leading-relaxed">
        小費屬於完全不計入法定 $R_{\\text{base}}$ 的免扣抵項目，疊單與高單價訂單的小費能直接疊加為純淨利！
      </p>
    </div>

  </div>
</div>
`
  };
})(window);
