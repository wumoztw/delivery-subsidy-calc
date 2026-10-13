/* 自動由 index.html 拆出：SimPanel。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['sim-panel'] = {
    name: 'SimPanel',
    setup() { return root.Vue.inject('dsc'); },
    template: `
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- 1. 即時跑單模擬器（3 大載具模式動態切換） -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <div class="bg-ink-0 p-4 sm:p-6 rounded-2xl border border-ink-200 shadow-xl space-y-4 sm:space-y-5">
    
    <!-- 標頭與模式選擇器 -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-ink-200 pb-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-jade-500 flex items-center gap-2">
          <span>⚡</span> 跑單實質時薪產值模擬推算器
        </h2>
        <p class="text-[11px] sm:text-xs text-ink-700 mt-1">
          依據載具物理特性（時速、舒適半徑、營運成本）進行第一原理工時並聯試算
        </p>
      </div>

      <!-- 3 大載具模式切換鈕 -->
      <div class="flex items-center gap-1.5 p-1 bg-ink-50 rounded-xl border border-ink-200 self-start lg:self-auto flex-wrap">
        <button type="button" @click="setVehicleMode('walk')"
          :class="simVehicleMode === 'walk' ? 'bg-ochre-200/20 text-ochre-500 border-ochre-200/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-3 py-1.5 rounded-lg text-xs transition border flex items-center gap-1.5">
          <span>🚶</span> <span>1. 步行 (4-5 km/h)</span>
        </button>
        <button type="button" @click="setVehicleMode('bike')"
          :class="simVehicleMode === 'bike' ? 'bg-jade-500/20 text-jade-200 border-jade-500/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-3 py-1.5 rounded-lg text-xs transition border flex items-center gap-1.5">
          <span>🚲</span> <span>2. 腳踏車 (12-18 km/h)</span>
        </button>
        <button type="button" @click="setVehicleMode('motorcycle')"
          :class="simVehicleMode === 'motorcycle' ? 'bg-mist-500/20 text-mist-300 border-mist-500/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-3 py-1.5 rounded-lg text-xs transition border flex items-center gap-1.5">
          <span>🛵</span> <span>3. 機車 (40-50 km/h)</span>
        </button>
      </div>
    </div>

    <!-- 載具動態作戰建議 Banner -->
    <div class="p-3.5 sm:p-4 rounded-xl border text-xs leading-relaxed"
      :class="{
        'bg-ochre-0/30 border-ochre-200/30 text-ochre-700': simVehicleMode === 'walk',
        'bg-jade-0/30 border-jade-500/30 text-jade-400': simVehicleMode === 'bike',
        'bg-mist-0/30 border-mist-500/30 text-mist-100': simVehicleMode === 'motorcycle'
      }">
      
      <!-- 步行專屬建議 -->
      <div v-if="simVehicleMode === 'walk'" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <strong class="text-ochre-500 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🚶</span> 步行模式作戰指南（極致短距、零成本純淨利）
          </strong>
          <span class="px-2 py-0.5 rounded bg-ochre-200/20 text-ochre-500 text-[10px] font-mono font-bold border border-ochre-200/30">作戰半徑 ≤ 800m</span>
        </div>
        <p class="text-ink-800 text-[11px] leading-relaxed">
          • <strong>最佳戰場</strong>：夜市、百貨美食街、超高密度住商大樓群。<br>
          • <strong>核心戰術</strong>：嚴格限制只接 800 公尺以內短單，優先雙疊。每單服務約 18 分鐘、雙疊整批約 28 分鐘、空檔 8 分鐘。<strong>零油錢零車損；以預設情境試算淨時薪約 NT\${{ Math.round(simGuidePreview.walk.perHour.net) }}（放大 {{ simGuidePreview.walk.leverageOverall.toFixed(2) }}x）。</strong>
        </p>
      </div>

      <!-- 腳踏車專屬建議 -->
      <div v-else-if="simVehicleMode === 'bike'" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <strong class="text-jade-200 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🚲</span> 腳踏車模式作戰指南（慢騎拉工時、黃金雙疊）
          </strong>
          <span class="px-2 py-0.5 rounded bg-jade-500/20 text-jade-200 text-[10px] font-mono font-bold border border-jade-500/30">作戰半徑 1.0 ～ 2.5km</span>
        </div>
        <p class="text-ink-800 text-[11px] leading-relaxed">
          • <strong>最佳戰場</strong>：市中心密集商圈、校園周邊、捷運站沿線 2.5 公里生活圈。<br>
          • <strong>核心戰術</strong>：鎖定 2.5km 內雙疊單，以 15~18km/h 悠閒平穩騎乘，搭配輕齒比高踏頻避免體力過度耗竭，每單服務約 24 分鐘、雙疊整批約 30 分鐘、空檔 8 分鐘。<strong>以預設情境試算淨時薪約 NT\${{ Math.round(simGuidePreview.bike.perHour.net) }}（放大 {{ simGuidePreview.bike.leverageOverall.toFixed(2) }}x），體力負擔最低。</strong>
        </p>
      </div>

      <!-- 機車專屬建議 -->
      <div v-else class="space-y-1.5">
        <div class="flex items-center justify-between">
          <strong class="text-mist-300 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🛵</span> 機車模式作戰指南（高速三疊吞吐、無縫銜接）
          </strong>
          <span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 text-[10px] font-mono font-bold border border-mist-500/30">作戰半徑 3.5 ～ 5.0km</span>
        </div>
        <p class="text-ink-800 text-[11px] leading-relaxed">
          • <strong>最佳戰場</strong>：跨商圈主幹道、大型熱門連鎖餐飲群、多疊單熱區。<br>
          • <strong>核心戰術</strong>：果斷拒接單發長距單，專注 4~5km 內三疊單（2.5x 工時並聯）！每單服務約 18 分鐘、三疊整批約 25 分鐘、空檔 10 分鐘、整批 7km。<strong>以預設情境試算，扣除油損後淨時薪約 NT\${{ Math.round(simGuidePreview.motorcycle.perHour.net) }}（放大 {{ simGuidePreview.motorcycle.leverageOverall.toFixed(2) }}x）。</strong>
        </p>
      </div>

    </div>

    <!-- 模擬參數：一批 = 一次出發到全部送達 -->
    <div class="bg-ink-50 p-3.5 sm:p-4 rounded-xl border border-ink-200 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold text-ink-900">🎛️ 情境參數（以「一批」為單位）</span>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" @click="loadSimFromRecords" class="text-[11px] px-2.5 py-1 rounded-md border border-jade-500/40 bg-jade-0 text-jade-700 font-semibold">📥 用我的紀錄帶入</button>
          <button type="button" @click="setVehicleMode(simVehicleMode)" class="text-[11px] px-2.5 py-1 rounded-md border border-ink-300 bg-white text-ink-700">↺ 載具預設值</button>
        </div>
      </div>
      <p v-if="simNotice" class="text-[11px] text-jade-700 bg-jade-0 border border-jade-500/30 rounded-md px-2.5 py-1.5">{{ simNotice }}</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div class="flex justify-between text-xs mb-1.5"><span class="text-ink-700">疊單數（每批）</span><span class="text-jade-500 font-bold font-mono">{{ sim.stacks }} 單</span></div>
          <input type="range" min="1" max="10" step="1" v-model.number="sim.stacks" class="w-full accent-jade-500 h-2">
          <div class="text-[10px] text-ink-600 font-mono mt-1">倍率 {{ simResult.multiplier.toFixed(2) }}x（{{ statutoryMode === 'independent' ? '獨立累加' : '經驗倍率表' }}）</div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1.5"><span class="text-ink-700">每單平均服務時間</span><span class="text-mist-400 font-bold font-mono">{{ sim.avgServiceMins }} 分</span></div>
          <input type="range" min="5" max="60" step="1" v-model.number="sim.avgServiceMins" class="w-full accent-mist-500 h-2">
          <div class="text-[10px] text-ink-600 mt-1">接單到送達，不能超過整批耗時</div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1.5"><span class="text-ink-700">整批實際耗時</span><span class="text-ink-900 font-bold font-mono">{{ sim.physicalMins }} 分</span></div>
          <input type="range" min="5" max="90" step="1" v-model.number="sim.physicalMins" class="w-full accent-jade-500 h-2">
          <div class="text-[10px] text-ink-600 mt-1">出發取餐到最後一單送達</div>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1.5"><span class="text-ink-700">批與批之間空檔</span><span class="text-ochre-500 font-bold font-mono">{{ sim.idleMins }} 分</span></div>
          <input type="range" min="0" max="40" step="1" v-model.number="sim.idleMins" class="w-full accent-ochre-500 h-2">
          <div class="text-[10px] text-ink-600 mt-1">等派單、空車回商圈（沒有收入）</div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <label class="block"><span class="text-ink-700 block mb-1">每批總里程 (km)</span>
          <input type="number" min="0" step="0.1" inputmode="decimal" v-model.number="sim.distanceKm" class="w-full bg-white border border-ink-300 rounded-md px-2 py-1 font-mono text-right focus:outline-none focus:border-jade-500"></label>
        <label class="block"><span class="text-ink-700 block mb-1">每單平台車資 (NT$)</span>
          <input type="number" min="0" step="1" inputmode="numeric" v-model.number="sim.basePayPerOrder" class="w-full bg-white border border-ink-300 rounded-md px-2 py-1 font-mono text-right focus:outline-none focus:border-jade-500"></label>
        <label class="block"><span class="text-ink-700 block mb-1">每單小費＋獎勵 (NT$)</span>
          <input type="number" min="0" step="1" inputmode="numeric" v-model.number="sim.tipsPerOrder" class="w-full bg-white border border-ink-300 rounded-md px-2 py-1 font-mono text-right focus:outline-none focus:border-jade-500"></label>
        <label class="block"><span class="text-ink-700 block mb-1">每天跑幾小時</span>
          <input type="number" min="0" max="24" step="0.5" inputmode="decimal" v-model.number="sim.hoursPerDay" class="w-full bg-white border border-ink-300 rounded-md px-2 py-1 font-mono text-right focus:outline-none focus:border-jade-500"></label>
        <label class="block"><span class="text-ink-700 block mb-1">本期跑幾天 (≤14)</span>
          <input type="number" min="0" max="14" step="1" inputmode="numeric" v-model.number="sim.daysPerCycle" class="w-full bg-white border border-ink-300 rounded-md px-2 py-1 font-mono text-right focus:outline-none focus:border-jade-500"></label>
        <div class="block"><span class="text-ink-700 block mb-1">適用保障時薪</span>
          <div class="px-2 py-1 font-mono text-right text-jade-700 bg-white border border-ink-200 rounded-md">NT$ {{ Number(simResult.rate.toFixed(2)) }}</div></div>
      </div>

      <div v-for="w in simResult.warnings" :key="w" class="text-[11px] text-crimson-500 bg-crimson-0 border border-crimson-200/40 rounded-md px-2.5 py-1.5">⚠️ {{ w }}</div>
    </div>

    <!-- 模擬結果：每小時 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <div class="bg-ink-50 p-3 sm:p-3.5 rounded-xl border border-ink-200">
        <span class="text-[10px] sm:text-[11px] text-ink-700 block">每批法定工時</span>
        <div class="text-lg sm:text-2xl font-black font-mono text-mist-300 mt-1">{{ simResult.statMinsPerBatch.toFixed(1) }} <span class="text-[10px] font-normal text-ink-700">分</span></div>
        <span class="text-[9px] text-ink-600 block truncate">{{ simResult.avgServiceMins }}分 × {{ simResult.multiplier.toFixed(2) }}x｜每小時 {{ simResult.batchesPerHour.toFixed(2) }} 批</span>
      </div>
      <div class="bg-ink-50 p-3 sm:p-3.5 rounded-xl border border-ink-200">
        <span class="text-[10px] sm:text-[11px] text-ink-700 block">工時放大倍數</span>
        <div class="text-lg sm:text-2xl font-black font-mono text-ochre-500 mt-1">{{ simResult.leverageOverall.toFixed(2) }} <span class="text-[10px] font-normal text-ink-700">倍</span></div>
        <span class="text-[9px] text-ink-600 block truncate">含空檔｜路上 {{ simResult.leverageOnRoad.toFixed(2) }} 倍</span>
      </div>
      <div class="bg-ink-50 p-3 sm:p-3.5 rounded-xl border border-ink-200">
        <span class="text-[10px] sm:text-[11px] text-ink-700 block">每小時保底 / 平台車資</span>
        <div class="text-lg sm:text-2xl font-black font-mono text-ink-900 mt-1">NT$ {{ Math.round(simResult.perHour.legal).toLocaleString() }}</div>
        <span class="text-[9px] text-ink-600 block truncate">車資 NT\${{ Math.round(simResult.perHour.basePay) }}｜需補 NT\${{ Math.round(simResult.perHour.subsidy) }}</span>
      </div>
      <div class="bg-jade-0/60 p-3 sm:p-3.5 rounded-xl border border-jade-500/40 shadow">
        <div class="flex items-center justify-between">
          <span class="text-[10px] sm:text-[11px] text-jade-500 font-bold block">實拿淨時薪</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded bg-ink-0 text-ink-700 font-mono">成本-\${{ Math.round(simResult.perHour.cost) }}/時</span>
        </div>
        <div class="text-lg sm:text-2xl font-black font-mono text-jade-200 mt-1">NT$ {{ Math.round(simResult.perHour.net).toLocaleString() }} <span class="text-[10px] font-normal text-ink-700">/ 時</span></div>
        <span class="text-[9px] text-jade-500/80 block truncate">max(車資, 保底) ＋ 小費 − 里程成本，已含空檔</span>
      </div>
    </div>

    <!-- 整期推估 -->
    <div class="bg-ink-50 p-3.5 sm:p-4 rounded-xl border border-ink-200">
      <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <span class="text-xs font-bold text-ink-900">🗓️ 整期推估（{{ sim.hoursPerDay }} 小時 × {{ sim.daysPerCycle }} 天 ＝ {{ simResult.perCycle.hours }} 小時）</span>
        <span class="text-[10px] text-ink-600">約 {{ Math.round(simResult.perCycle.batches) }} 批・{{ Math.round(simResult.perCycle.orders) }} 單</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
        <div class="bg-white rounded-lg border border-ink-200 p-2"><span class="block text-[10px] text-ink-600 font-sans">法定保底</span>NT$ {{ Math.round(simResult.perCycle.legal).toLocaleString() }}</div>
        <div class="bg-white rounded-lg border border-ink-200 p-2"><span class="block text-[10px] text-ink-600 font-sans">平台車資</span>NT$ {{ Math.round(simResult.perCycle.basePay).toLocaleString() }}</div>
        <div class="bg-white rounded-lg border border-ochre-200/40 p-2 text-ochre-500 font-bold"><span class="block text-[10px] text-ink-600 font-sans font-normal">預估補差額</span>NT$ {{ Math.round(simResult.perCycle.subsidy).toLocaleString() }}</div>
        <div class="bg-white rounded-lg border border-ink-200 p-2"><span class="block text-[10px] text-ink-600 font-sans">小費＋獎勵</span>NT$ {{ Math.round(simResult.perCycle.tips).toLocaleString() }}</div>
        <div class="bg-white rounded-lg border border-jade-500/40 p-2 text-jade-700 font-bold col-span-2 sm:col-span-1"><span class="block text-[10px] text-ink-600 font-sans font-normal">扣成本淨收入</span>NT$ {{ Math.round(simResult.perCycle.net).toLocaleString() }}</div>
      </div>
    </div>

    <!-- 目標時薪反推 -->
    <div class="bg-ink-50 p-3.5 sm:p-4 rounded-xl border border-ink-200 space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold text-ink-900">🎯 目標時薪反推</span>
        <label class="flex items-center gap-1.5 text-xs text-ink-700">
          想要每小時實拿
          <input type="number" inputmode="numeric" min="0" step="10" v-model.number="simTarget" onfocus="this.select()" class="w-20 bg-white border border-ink-300 rounded px-1.5 py-0.5 text-right font-mono text-ink-950 focus:outline-none focus:border-jade-500" aria-label="目標每小時實拿">
          元
        </label>
      </div>
      <p class="text-xs" :class="simTargetResult.minStacks ? 'text-jade-700' : 'text-crimson-500'">
        <template v-if="simTargetResult.minStacks">
          照目前的服務時間、空檔與車資，最少要 <b>{{ simTargetResult.minStacks }} {{ simTargetResult.minStacks === 1 ? '單' : '疊' }}</b> 才達標。
        </template>
        <template v-else>
          5 疊以內都達不到 NT\${{ simTargetResult.target }}／時，先試著縮短空檔或每批耗時。
        </template>
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-[11px] font-mono">
          <thead class="text-ink-600 font-sans">
            <tr><th class="text-left py-1">疊數</th><th class="text-right">每小時實拿</th><th class="text-right">與目標差</th><th class="text-right">一批里程上限</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in simTargetResult.rows" :key="'tgt-'+r.stacks" class="border-t border-ink-200" :class="r.reached ? 'text-jade-700' : 'text-ink-700'">
              <td class="py-1 font-sans">{{ r.stacks === 1 ? '1 單' : r.stacks + ' 疊' }}</td>
              <td class="text-right">NT$ {{ Math.round(r.netPerHour) }}</td>
              <td class="text-right">{{ r.gap <= 0 ? '+' + Math.round(-r.gap) : '−' + Math.round(r.gap) }}</td>
              <td class="text-right">
                <template v-if="r.maxKm === null">達不到</template>
                <template v-else-if="r.maxKm === Infinity">不限（無里程成本）</template>
                <template v-else>≤ {{ r.maxKm.toFixed(1) }} km</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-[10px] text-ink-600">假設多疊時每單服務時間、整批耗時與空檔不變，只換疊數；「里程上限」是在這個疊數下，一批總里程最多能跑多遠還維持目標（里程只影響載具成本）。實際多疊通常耗時更長，請搭配上方參數調整。</p>
    </div>

    <!-- 比較：三種載具 / 方案 A -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div class="bg-ink-50 p-3.5 rounded-xl border border-ink-200">
        <span class="text-xs font-bold text-ink-900 block mb-2">🚦 同一情境，三種載具比較</span>
        <table class="w-full text-[11px] font-mono">
          <thead class="text-ink-600 font-sans"><tr><th class="text-left py-1">載具</th><th class="text-right">成本/km</th><th class="text-right">成本/時</th><th class="text-right">淨時薪</th></tr></thead>
          <tbody>
            <tr v-for="v in simVehicleCompare" :key="v.mode" :class="v.mode === simVehicleMode ? 'font-bold text-jade-700' : 'text-ink-800'" class="border-t border-ink-200">
              <td class="py-1 font-sans">{{ v.icon }} {{ v.name }}</td>
              <td class="text-right">{{ v.costPerKm }}</td>
              <td class="text-right">{{ Math.round(v.r.perHour.cost) }}</td>
              <td class="text-right">NT$ {{ Math.round(v.r.perHour.net) }}</td>
            </tr>
          </tbody>
        </table>
        <p class="text-[10px] text-ink-600 mt-1.5">只差在里程成本；實際上步行、腳踏車跑不了同樣的距離和時間，請搭配調整參數看。</p>
      </div>
      <div class="bg-ink-50 p-3.5 rounded-xl border border-ink-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-ink-900">⚖️ 方案比較</span>
          <div class="flex gap-1.5">
            <button type="button" @click="saveSimScenarioA" class="text-[11px] px-2 py-0.5 rounded border border-ink-300 bg-white text-ink-700">把目前設為方案 A</button>
            <button v-if="simScenarioA" type="button" @click="clearSimScenarioA" class="text-[11px] px-2 py-0.5 rounded border border-ink-300 bg-white text-ink-600">清除</button>
          </div>
        </div>
        <p v-if="!simScenarioA" class="text-[11px] text-ink-600">先把一個情境設為方案 A，再調整參數，就能並排比較（例如 2 疊短距 vs 3 疊長距）。</p>
        <table v-else class="w-full text-[11px] font-mono">
          <thead class="text-ink-600 font-sans"><tr><th class="text-left py-1"></th><th class="text-right">方案 A<br><span class="font-normal">{{ simScenarioA.label }}</span></th><th class="text-right">目前</th><th class="text-right">差異</th></tr></thead>
          <tbody class="text-ink-800">
            <tr class="border-t border-ink-200"><td class="py-1 font-sans">放大倍數（含空檔）</td><td class="text-right">{{ simScenarioAResult.leverageOverall.toFixed(2) }}</td><td class="text-right">{{ simResult.leverageOverall.toFixed(2) }}</td><td class="text-right">{{ (simResult.leverageOverall - simScenarioAResult.leverageOverall).toFixed(2) }}</td></tr>
            <tr class="border-t border-ink-200"><td class="py-1 font-sans">每小時保底</td><td class="text-right">{{ Math.round(simScenarioAResult.perHour.legal) }}</td><td class="text-right">{{ Math.round(simResult.perHour.legal) }}</td><td class="text-right">{{ Math.round(simResult.perHour.legal - simScenarioAResult.perHour.legal) }}</td></tr>
            <tr class="border-t border-ink-200 font-bold"><td class="py-1 font-sans">淨時薪</td><td class="text-right">{{ Math.round(simScenarioAResult.perHour.net) }}</td><td class="text-right">{{ Math.round(simResult.perHour.net) }}</td><td class="text-right" :class="simResult.perHour.net >= simScenarioAResult.perHour.net ? 'text-jade-700' : 'text-crimson-500'">{{ simResult.perHour.net >= simScenarioAResult.perHour.net ? '+' : '' }}{{ Math.round(simResult.perHour.net - simScenarioAResult.perHour.net) }}</td></tr>
            <tr class="border-t border-ink-200"><td class="py-1 font-sans">整期淨收入</td><td class="text-right">{{ Math.round(simScenarioAResult.perCycle.net).toLocaleString() }}</td><td class="text-right">{{ Math.round(simResult.perCycle.net).toLocaleString() }}</td><td class="text-right">{{ Math.round(simResult.perCycle.net - simScenarioAResult.perCycle.net).toLocaleString() }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-[10px] text-ink-600 leading-relaxed">
      ※ 本模擬以「每單服務時間 × 疊單倍率」估算法定工時，與頂部的工時模式設定相同。疊單時間能否分別計入、等餐時間如何認定，請以專法條文與平台實際結算為準；若認定方式不同，補差額可能低於試算。
    </p>

  </div>
`
  };
})(window);
