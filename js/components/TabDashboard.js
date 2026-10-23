/* 自動由 index.html 拆出：TabDashboard。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['tab-dashboard'] = {
    name: 'TabDashboard',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 分頁 1: 週期結算儀表板 -->
<div v-show="activeTab === 'dashboard'" class="space-y-4 sm:space-y-6">

  <!-- 全域外送載具模式切換列 -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl ring-1 ring-ink-200/60 shadow-sm">
    <div class="flex items-center gap-2.5">
      <span class="text-2xl">{{ currentVehicleConfig.icon }}</span>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm font-bold text-ink-900">外送載具分析模式：{{ currentVehicleConfig.name }}</span>
          <span class="text-[10px] px-2 py-0.2 rounded bg-ink-200 text-ink-800 font-mono">{{ currentVehicleConfig.speed }}</span>
        </div>
        <p class="text-[11px] text-ink-700 mt-0.5">{{ currentVehicleConfig.desc }}</p>
      </div>
    </div>
    <div class="seg self-stretch sm:self-auto" role="group" aria-label="載具模式">
      <button type="button" @click="setGlobalVehicleMode('walk')" :class="vehicleMode === 'walk' ? 'seg-on' : ''" :aria-pressed="vehicleMode === 'walk'" class="seg-btn"><span>🚶</span><span>步行</span></button>
      <button type="button" @click="setGlobalVehicleMode('bike')" :class="vehicleMode === 'bike' ? 'seg-on' : ''" :aria-pressed="vehicleMode === 'bike'" class="seg-btn"><span>🚲</span><span>腳踏車</span></button>
      <button type="button" @click="setGlobalVehicleMode('motorcycle')" :class="vehicleMode === 'motorcycle' ? 'seg-on' : ''" :aria-pressed="vehicleMode === 'motorcycle'" class="seg-btn"><span>🛵</span><span>機車</span></button>
    </div>
  </div>

  <!-- 本期旅程：基本車資朝法定保底前進的路線 -->
  <div class="bg-white/80 ring-1 ring-ink-200/60 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
    <div class="flex items-center justify-between text-[11px] sm:text-xs text-ink-700 mb-2">
      <span class="font-display font-bold text-ink-900 text-sm">本期旅程</span>
      <span class="font-mono">{{ totalDistance.toFixed(1) }} km · {{ visibleTrips.length }} 單</span>
    </div>
    <div class="route" role="progressbar" :aria-valuenow="Math.round(routeProgress)" aria-valuemin="0" aria-valuemax="100" aria-label="基本車資達成法定保底的比例">
      <span class="route-pin route-start" aria-hidden="true"></span>
      <span class="route-done" :style="{ width: routeProgress + '%' }"></span>
      <span class="route-rider" :style="{ left: routeProgress + '%' }" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l2-6h-3M14 17l-2-5H7"/><rect x="4" y="6" width="5" height="5" rx=".5"/></svg>
      </span>
      <span class="route-goal" :class="routeProgress >= 100 ? 'reached' : ''" aria-hidden="true"></span>
      <span class="route-flag" aria-hidden="true">⛰</span>
    </div>
    <div class="flex justify-between text-[10px] sm:text-[11px] text-ink-600 mt-1.5">
      <span>出發</span>
      <span>車資 {{ Math.round(routeProgress) }}% 抵達保底</span>
      <span>保底 \${{ Math.round(totalLegal).toLocaleString() }}</span>
    </div>
  </div>

  <!-- 核心指標四宮格 -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
    
    <!-- 1. 法定申報累計總工時 (含疊單獨立累加) -->
    <div class="kpi-card flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] sm:text-xs text-ink-700">法定申報總工時</span>
        <span class="text-[9px] sm:text-[10px] bg-mist-500/10 text-mist-400 px-1.5 py-0.5 rounded font-mono">疊單放大</span>
      </div>
      <div class="kpi-num text-mist-300 my-1 sm:my-2">
        {{ totalStatutoryHours.toFixed(2) }} <span class="text-xs font-normal text-ink-700">hr</span>
      </div>
      <div class="text-[10px] sm:text-xs text-ink-600 flex justify-between">
        <span>物理 {{ totalPhysicalHours.toFixed(1) }}h ({{ totalPhysicalMins.toFixed(0) }}分)</span>
        <span>共 {{ totalOrdersCount }} 單</span>
      </div>
    </div>

    <!-- 2. 法定最低保底 -->
    <div class="kpi-card flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] sm:text-xs text-ink-700">法定最低保底</span>
        <span class="text-[9px] sm:text-[10px] bg-ink-200 text-ink-700 px-1.5 py-0.5 rounded font-mono">@\${{ displayRateText }}</span>
      </div>
      <div class="kpi-num text-ink-950 my-1 sm:my-2">
        \${{ Math.round(totalLegal).toLocaleString() }}
      </div>
      <div class="text-[10px] sm:text-xs text-ink-600 truncate">
        {{ totalStatutoryHours.toFixed(2) }}h × NT\${{ displayRateText }}
      </div>
    </div>

    <!-- 3. 實領基本車資 -->
    <div class="kpi-card flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] sm:text-xs text-ink-700">實領基本車資</span>
        <span :class="subsidy > 0 ? 'bg-ochre-200/10 text-ochre-500' : 'bg-jade-500/10 text-jade-500'" class="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono">
          {{ subsidy > 0 ? '需補發' : '已超標' }}
        </span>
      </div>
      <div class="kpi-num text-ink-950 my-1 sm:my-2">
        \${{ Math.round(totalBasePay).toLocaleString() }}
      </div>
      <div class="text-[10px] sm:text-xs text-ink-600 flex justify-between">
        <span>均單 \${{ avgBasePay.toFixed(0) }}</span>
        <span v-if="totalDistance > 0">\${{ (totalBasePay / totalDistance).toFixed(1) }}/km</span>
      </div>
    </div>

    <!-- 4. 預估差額補貼款 -->
    <div class="kpi-card flex flex-col justify-between" :class="subsidy > 0 ? 'kpi-due' : 'kpi-ok'">
      <div class="flex items-center justify-between">
        <span class="text-[11px] sm:text-xs text-ink-800 font-bold">預估差額補貼</span>
        <span :class="subsidy > 0 ? 'bg-ochre-200/20 text-ochre-500' : 'bg-jade-500/10 text-jade-700'" class="text-[10px] px-1.5 py-0.5 rounded font-bold">{{ subsidy > 0 ? '補發款' : '已達標' }}</span>
      </div>
      <div class="kpi-num my-1 sm:my-2" :class="subsidy > 0 ? 'text-ochre-500' : 'text-jade-700'">
        \${{ Math.round(subsidy).toLocaleString() }}
      </div>
      <div class="text-[10px] sm:text-xs text-ink-700 font-medium truncate">
        {{ subsidy > 0 ? '兩週結算後全額補發' : '基本車資已達法定保底' }}
      </div>
    </div>

  </div>

  <!-- 進階作戰指標面板 -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 bg-ink-100/50 p-3.5 rounded-2xl text-xs">
    <div class="space-y-1">
      <span class="text-[10px] text-ink-700">🚴 累計總里程</span>
      <div class="text-base sm:text-lg font-bold font-mono text-ink-900">
        {{ totalDistance.toFixed(2) }} <span class="text-[10px] font-normal text-ink-700">km</span>
      </div>
      <div class="text-[10px] text-ink-600">均趟 {{ avgDistance.toFixed(2) }} km</div>
    </div>

    <div class="space-y-1">
      <span class="text-[10px] text-ink-700">📈 每公里實質產值</span>
      <div class="text-base sm:text-lg font-bold font-mono text-teal-300">
        NT$ {{ perKmIncome.toFixed(1) }} <span class="text-[10px] font-normal text-ink-700">/ km</span>
      </div>
      <div class="text-[10px] text-ink-600">基本 NT$ {{ perKmBase.toFixed(1) }}/km</div>
    </div>

    <div class="space-y-1">
      <span class="text-[10px] text-ink-700">🚀 平台加成總額</span>
      <div class="text-base sm:text-lg font-bold font-mono text-ochre-500">
        NT$ {{ Math.round(totalBoostFare) }}
      </div>
      <div class="text-[10px] text-ink-600">加成率 {{ avgBoostRate.toFixed(1) }}%</div>
    </div>

    <div class="space-y-1">
      <span class="text-[10px] text-ink-700">⭐ Uber Pro 點數</span>
      <div class="text-base sm:text-lg font-bold font-mono text-jade-500">
        {{ totalPoints }} <span class="text-[10px] font-normal text-ink-700">點</span>
      </div>
      <div class="text-[10px] text-ink-600">小費總計 NT\${{ Math.round(totalTips) }} ({{ tipPercentage.toFixed(0) }}%)</div>
    </div>
  </div>

  <!-- 總收入與實質落袋淨利 Banner (含載具成本扣除) -->
  <div class="ticket relative p-4 sm:p-6 space-y-3.5 sm:space-y-4">
    <div v-if="visibleTrips.length > 0" class="hanko" :class="subsidy > 0 ? 'hanko-pending' : ''" aria-hidden="true">{{ subsidy > 0 ? '補貼' : '達標' }}</div>
    <div class="!mt-0 flex items-center justify-between text-[10px] sm:text-[11px] text-ink-600 font-mono tracking-widest">
      <span>外送乘車券 · RIDER PASS</span>
      <span>{{ cycleFilterLabel }}</span>
    </div>
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 ticket-tear">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] sm:text-xs text-ink-700 uppercase tracking-wider font-semibold">實質落袋淨利 (扣除{{ currentVehicleConfig.name }}成本)</span>
          <span v-if="totalVehicleCost > 0" class="text-[10px] px-1.5 py-0.2 rounded bg-crimson-200/20 text-crimson-500 font-mono">成本 -\${{ Math.round(totalVehicleCost) }}</span>
        </div>
        <div class="text-3xl sm:text-5xl font-black font-mono text-jade-700 mt-0.5">
          NT$ {{ Math.round(netTotalIncome).toLocaleString() }}
        </div>
        <p class="text-[11px] sm:text-xs text-ink-700 mt-1">
          毛額 \${{ Math.round(totalIncome) }} (基本\${{ Math.round(totalBasePay) }} + 補貼\${{ Math.round(subsidy) }} + 小費\${{ Math.round(totalTips) }})
        </p>
      </div>

      <!-- 實質落袋純時薪指標 -->
      <div class="bg-ink-100/50 p-3 sm:p-4 rounded-xl">
        <div class="flex items-center justify-between text-[11px] sm:text-xs text-ink-700 mb-1">
          <span>實質落袋純時薪</span>
          <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded font-mono" :class="stackingMultiplier >= 1.5 ? 'bg-jade-500/20 text-jade-500' : 'bg-ink-200 text-ink-800'">
            {{ stackingMultiplier.toFixed(2) }}x 疊單倍數
          </span>
        </div>
        <div class="text-2xl sm:text-3xl font-black font-mono text-teal-300">
          NT$ {{ netHourlyRate.toFixed(1) }} <span class="text-xs font-normal text-ink-700">/ 物理時</span>
        </div>
        <div class="mt-1 flex items-center gap-2 text-[10px] sm:text-xs text-ink-600">
          <span>毛時薪 NT\${{ realHourlyRate.toFixed(1) }} · {{ totalPhysicalHours.toFixed(2) }}h</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作按鈕 (整合完整戰報複製與下載) -->
    <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-1">
      <select v-model="reportCopyMode" aria-label="戰報複製格式" class="px-2 py-2.5 min-h-[40px] bg-ink-200 text-ink-900 text-xs rounded-xl border border-ink-300">
        <option value="short">短貼</option>
        <option value="full">完整社團戰報</option>
      </select>
      <button @click="copyReport" class="px-3.5 py-2.5 min-h-[40px] bg-ink-200 active:bg-ink-300 hover:bg-ink-300 text-ink-900 text-xs rounded-xl border border-ink-300 flex items-center justify-center gap-1.5 transition">
        <span>📋</span> <span class="truncate font-mono">{{ copyBtnText }}</span>
      </button>
      <button @click="downloadReport" class="px-3.5 py-2.5 min-h-[40px] bg-jade-700 hover:bg-jade-500 active:bg-jade-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5">
        <span>📥</span> <span>下載完整戰報 (.md)</span>
      </button>
      <button @click="openStatement" class="px-3.5 py-2.5 min-h-[40px] bg-jade-700 hover:bg-jade-500 active:bg-jade-800 text-ink-50 font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5">
        <span>🧾</span> <span>雙週對帳單</span>
      </button>
      <button @click="exportCSV" class="px-3.5 py-2.5 min-h-[40px] bg-ink-200 active:bg-ink-300 hover:bg-ink-300 text-ink-900 text-xs rounded-xl border border-ink-300 flex items-center justify-center gap-1.5 transition">
        <span>💾</span> <span>匯出明細 CSV</span>
      </button>
    </div>
  </div>

  <!-- 收入組成圓餅圖報表 -->
  <template v-if="totalIncome > 0">
    <div class="bg-white/80 p-4 sm:p-6 rounded-2xl ring-1 ring-ink-200/60 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-base">🥧</span>
        <h3 class="text-sm font-bold text-ink-900">收入組成分析報表</h3>
        <span class="text-[10px] px-2 py-0.5 rounded bg-ink-200 text-ink-700 font-mono ml-auto">本週期</span>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">

        <!-- SVG 甜甜圈圖 -->
        <div class="flex-shrink-0 relative" style="width:180px;height:180px">
          <svg viewBox="0 0 200 200" width="180" height="180"
               style="transform:rotate(-90deg);display:block;overflow:visible">
            <template v-for="(slice, idx) in pieSlices" :key="idx">
              <circle cx="100" cy="100" r="70" fill="none"
                :stroke="slice.color"
                stroke-width="38"
                :stroke-dasharray="slice.dash + ' ' + slice.gap"
                :stroke-dashoffset="slice.offset" />
            </template>
            <circle cx="100" cy="100" r="50" fill="#fffdf8" />
          </svg>
          <!-- 中心文字（absolute 疊上，不受 SVG rotate 影響） -->
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none">
            <span style="color:#6f685b;font-size:10px;font-family:monospace;letter-spacing:0.05em">總收入</span>
            <span style="color:#2a2723;font-size:13px;font-weight:900;font-family:monospace;margin-top:2px">
              NT\${{ Math.round(totalIncome).toLocaleString() }}
            </span>
          </div>
        </div>

        <!-- 右側圖例 -->
        <div class="flex-1 w-full space-y-3">
          <template v-for="(slice, idx) in pieSlices" :key="'leg-'+idx">
            <div>
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-2">
                  <span class="inline-block w-2.5 h-2.5 rounded-full" :style="{ background: slice.color }"></span>
                  <span class="text-xs text-ink-900">{{ slice.label }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-ink-700 font-mono">NT\${{ Math.round(slice.value).toLocaleString() }}</span>
                  <span class="text-xs font-black font-mono w-12 text-right" :style="{ color: slice.color }">{{ slice.pct.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="h-1.5 bg-ink-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: slice.pct + '%', background: slice.color }"></div>
              </div>
            </div>
          </template>
        </div>

      </div>

      <!-- 底部摘要格 -->
      <div class="mt-5 pt-4 border-t border-ink-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <template v-for="(slice, idx) in pieSlices" :key="'sum-'+idx">
          <div class="bg-ink-50/70 rounded-xl p-2.5 text-center">
            <div class="text-[10px] text-ink-700 mb-1">{{ slice.label }}</div>
            <div class="text-sm font-black font-mono" :style="{ color: slice.color }">{{ slice.pct.toFixed(1) }}%</div>
            <div class="text-[10px] text-ink-600 font-mono mt-0.5">NT\${{ Math.round(slice.value).toLocaleString() }}</div>
          </div>
        </template>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="bg-ink-0/60 p-5 rounded-2xl border border-ink-200 text-center text-ink-600 text-xs">
      🥧 新增訂單資料後，此處將自動顯示收入組成圓餅圖
    </div>
  </template>


  <!-- ── 智慧診斷建議區塊 ── -->
  <div v-if="visibleTrips.length > 0" class="space-y-4">

    <!-- 診斷區頂部標頭與操作列 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-white/80 p-3.5 sm:p-4 rounded-2xl ring-1 ring-ink-200/60 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-lg">🎯</span>
        <div>
          <h3 class="text-sm font-bold text-ink-900">外送專法戰略診斷中心</h3>
          <p class="text-[11px] text-ink-700">依據第一原理推算之週期改善方針與每單產值逐筆評級</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="copyReport" class="flex-1 sm:flex-none px-3 py-1.5 bg-ink-200 hover:bg-ink-300 active:bg-ink-500 text-ink-900 text-xs rounded-xl border border-ink-300 flex items-center justify-center gap-1.5 transition">
          <span>📋</span> <span class="font-mono">{{ copyBtnText }}</span>
        </button>
        <button @click="downloadReport" class="flex-1 sm:flex-none px-3 py-1.5 bg-jade-700 hover:bg-jade-500 active:bg-jade-800 text-ink-50 font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5">
          <span>📥</span> <span>下載診斷報告 (.md)</span>
        </button>
      </div>
    </div>

    <!-- 整體戰略建議 -->
    <div v-if="globalInsights.length > 0" class="bg-white/80 p-4 sm:p-5 rounded-2xl ring-1 ring-ink-200/60 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base">🧠</span>
        <h3 class="text-sm font-bold text-ink-900">週期戰略診斷建議</h3>
        <span class="text-[10px] px-2 py-0.5 rounded bg-ink-200 text-ink-700 font-mono ml-auto">{{ visibleTrips.length }} 張訂單</span>
      </div>
      <div class="space-y-2.5">
        <template v-for="(item, idx) in globalInsights" :key="idx">
          <div class="flex gap-3 p-3 rounded-xl border"
            :class="{
              'bg-crimson-0/40 border-crimson-200/30': item.level === 'danger',
              'bg-ochre-0/40 border-ochre-200/30': item.level === 'warning',
              'bg-jade-0/40 border-jade-500/30': item.level === 'success',
              'bg-mist-0/40 border-mist-500/30': item.level === 'info',
            }">
            <span class="text-lg flex-shrink-0 mt-0.5">{{ item.icon }}</span>
            <div class="min-w-0">
              <div class="text-xs font-bold mb-0.5"
                :class="{
                  'text-crimson-500': item.level === 'danger',
                  'text-ochre-500': item.level === 'warning',
                  'text-jade-200': item.level === 'success',
                  'text-mist-300': item.level === 'info',
                }">{{ item.title }}</div>
              <div class="text-[11px] text-ink-700 leading-relaxed">{{ item.desc }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 每單逐筆診斷 -->
    <div class="bg-white/80 p-4 sm:p-5 rounded-2xl ring-1 ring-ink-200/60 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base">🔍</span>
        <h3 class="text-sm font-bold text-ink-900">每單逐筆診斷報告</h3>
      </div>
      <div class="space-y-3">
        <template v-for="ins in tripInsights" :key="ins.t.id">
          <div class="bg-ink-50/70 rounded-xl border border-ink-200 overflow-hidden">
            <!-- 訂單標頭列 -->
            <div class="flex items-center justify-between px-3 py-2 border-b border-ink-200/60">
              <div class="flex items-center gap-2 text-xs">
                <span class="font-bold font-mono text-ink-800">單 #{{ ins.idx + 1 }}</span>
                <span class="text-ink-600">{{ ins.t.merchant || '未填商家' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-ink-700">{{ ins.stacks }}疊 · {{ ins.dist.toFixed(1) }}km · {{ ins.dur }}分</span>
                <span class="text-[11px] font-black font-mono px-2 py-0.5 rounded" :class="ins.gradeColor"
                  :style="{ background: ins.grade==='SSR' ? 'rgba(234,179,8,0.1)' : ins.grade==='A' ? 'rgba(52,211,153,0.1)' : ins.grade==='B' ? 'rgba(56,189,248,0.1)' : 'rgba(244,63,94,0.1)' }">
                  {{ toned(ins.grade) }}
                </span>
              </div>
            </div>
            <!-- 指標列 -->
            <div class="grid grid-cols-3 divide-x divide-ink-200/60 text-center text-[10px] border-b border-ink-200/60">
              <div class="py-1.5">
                <div class="text-ink-600">法定保底</div>
                <div class="font-mono font-bold text-ink-900">NT\${{ Math.round(ins.legal) }}</div>
              </div>
              <div class="py-1.5">
                <div class="text-ink-600">工時倍率</div>
                <div class="font-mono font-bold" :class="ins.efficiency >= 2.0 ? 'text-jade-500' : ins.efficiency >= 1.5 ? 'text-mist-400' : 'text-crimson-500'">{{ ins.efficiency.toFixed(2) }}x</div>
              </div>
              <div class="py-1.5">
                <div class="text-ink-600">差額補貼</div>
                <div class="font-mono font-bold text-ochre-500">+NT\${{ Math.round(ins.subsidy) }}</div>
              </div>
            </div>
            <!-- 診斷訊息 -->
            <div class="px-3 py-2 space-y-1" v-if="ins.tips.length > 0 || ins.warnings.length > 0">
              <div v-for="w in ins.warnings" :key="w.type" class="flex gap-1.5 text-[11px] text-ochre-500/90">
                <span class="flex-shrink-0">{{ w.icon }}</span>
                <span>{{ w.text }}</span>
              </div>
              <div v-for="tip in ins.tips" :key="tip.type" class="flex gap-1.5 text-[11px] text-jade-500/90">
                <span class="flex-shrink-0">{{ tip.icon }}</span>
                <span>{{ tip.text }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

  </div>
  <!-- 無資料時不顯示 -->

</div>
`
  };
})(window);
