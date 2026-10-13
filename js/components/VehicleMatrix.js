/* 自動由 index.html 拆出：VehicleMatrix。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['vehicle-matrix'] = {
    name: 'VehicleMatrix',
    setup() { return root.Vue.inject('dsc'); },
    template: `
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- 2. 3 大載具模式第一原理實戰規格矩陣 -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <div class="bg-ink-0 p-4 sm:p-6 rounded-2xl border border-ink-200 shadow-xl space-y-3 sm:space-y-4">
    <div class="flex items-center justify-between border-b border-ink-200 pb-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">📊</span>
        <h3 class="text-sm sm:text-base font-bold text-ink-900">3 大載具第一原理作戰規格矩陣</h3>
      </div>
      <span class="text-[10px] text-ink-700 font-mono">點擊下方任一列可快速套用設定</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse font-sans">
        <thead>
          <tr class="bg-ink-50 text-ink-700 border-b border-ink-200 text-[11px]">
            <th class="p-2.5 font-bold">載具模式</th>
            <th class="p-2.5 font-bold">巡航速度</th>
            <th class="p-2.5 font-bold">最佳作戰半徑</th>
            <th class="p-2.5 font-bold">拒接紅線</th>
            <th class="p-2.5 font-bold text-right">每小時成本</th>
            <th class="p-2.5 font-bold text-right text-jade-500">預估實質淨時薪</th>
            <th class="p-2.5 font-bold">核心賺錢法門</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-200 text-xs">
          <tr :class="simVehicleMode === 'walk' ? 'bg-ochre-200/10' : 'hover:bg-ink-200/30'" class="transition cursor-pointer" @click="setVehicleMode('walk')">
            <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>🚶</span> 1. 步行</td>
            <td class="p-2.5 font-mono text-ink-800">4 ～ 5 km/h</td>
            <td class="p-2.5 font-mono text-ochre-500">≤ 800 公尺</td>
            <td class="p-2.5 font-mono text-crimson-500">&gt; 1.2 公里</td>
            <td class="p-2.5 text-right font-mono text-jade-500">NT$ 0 元</td>
            <td class="p-2.5 text-right font-mono text-ochre-500 font-bold">NT$ 315 ～ $380</td>
            <td class="p-2.5 text-ink-800">美食街高密度短雙疊、零油耗 100% 淨賺</td>
          </tr>
          <tr :class="simVehicleMode === 'bike' ? 'bg-jade-500/10' : 'hover:bg-ink-200/30'" class="transition cursor-pointer" @click="setVehicleMode('bike')">
            <td class="p-2.5 font-bold text-jade-200 flex items-center gap-1"><span>🚲</span> 2. 腳踏車</td>
            <td class="p-2.5 font-mono text-ink-800">12 ～ 18 km/h</td>
            <td class="p-2.5 font-mono text-jade-200">1.0 ～ 2.5 公里</td>
            <td class="p-2.5 font-mono text-crimson-500">&gt; 3.2 公里</td>
            <td class="p-2.5 text-right font-mono text-jade-500">約 NT$ 2 元</td>
            <td class="p-2.5 text-right font-mono text-jade-200 font-bold">NT$ 390 ～ $440</td>
            <td class="p-2.5 text-ink-800">專注 2.5km 內生活圈雙疊/三疊，輕齒比慢騎持久拉工時</td>
          </tr>
          <tr :class="simVehicleMode === 'motorcycle' ? 'bg-mist-500/10' : 'hover:bg-ink-200/30'" class="transition cursor-pointer" @click="setVehicleMode('motorcycle')">
            <td class="p-2.5 font-bold text-mist-300 flex items-center gap-1"><span>🛵</span> 3. 機車</td>
            <td class="p-2.5 font-mono text-ink-800">40 ～ 50 km/h</td>
            <td class="p-2.5 font-mono text-mist-300">3.5 ～ 5.0 公里</td>
            <td class="p-2.5 font-mono text-crimson-500">&gt; 6.0 km (單發&gt;3.5km)</td>
            <td class="p-2.5 text-right font-mono text-crimson-500">約 NT$ 22 元</td>
            <td class="p-2.5 text-right font-mono text-mist-300 font-black">NT$ 480 ～ $550+ 🚀</td>
            <td class="p-2.5 text-ink-800">拒接長距單發，鎖定大商圈 3 疊高速吞吐</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`
  };
})(window);
