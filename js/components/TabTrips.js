/* 自動由 index.html 拆出：TabTrips。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['tab-trips'] = {
    name: 'TabTrips',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 分頁 2: 訂單明細與資料匯入 -->
<div v-show="activeTab === 'trips'" class="space-y-4 sm:space-y-6">
  
  <!-- 三大輸入管道區塊：1.快速手動輸入 ➔ 2.原況文字秒貼 ➔ 3.CSV匯入 -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
    
    <!-- 1. 快速手動輸入 (移至第一優先位置) -->
    <div class="bg-ink-0 p-4 rounded-2xl border border-sky-300 flex flex-col justify-between shadow-md shadow-sky-500/10">
      <div>
        <div class="mb-1">
          <h2 class="font-bold text-sky-700 text-xs sm:text-sm flex items-center gap-1.5">
            <ico name="edit"/> 快速手動輸入
          </h2>
        </div>
        <p class="text-[11px] text-ink-700 mb-2.5">精確自訂服務時間、行程費用、加成與疊單數</p>
      </div>
      <button @click="showManualModal = true" class="w-full block text-center py-2 px-2.5 rounded-xl bg-jade-700 active:bg-jade-500 hover:bg-jade-500 text-ink-50 font-bold text-xs transition shadow">
        開啟手動新增表單
      </button>
    </div>

    <!-- 2. 原況文字 / 剪貼簿一鍵秒貼 -->
    <div class="bg-ink-0 p-4 rounded-2xl border border-blue-300 flex flex-col justify-between shadow-md shadow-blue-500/10">
      <div>
        <div class="mb-1">
          <h2 class="font-bold text-blue-700 text-xs sm:text-sm flex items-center gap-1.5">
            <ico name="clipboard"/> 剪貼簿 / 原況文字秒貼
          </h2>
        </div>
        <p class="text-[11px] text-ink-700 mb-2.5">長按 iPhone / Android 截圖複製文字，貼上 0.01 秒瞬間精準解析</p>
      </div>
      <button @click="openPasteModal" class="w-full block text-center py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20">
        貼上文字一鍵解析
      </button>
    </div>

    <!-- 3. CSV 匯入 -->
    <div class="bg-ink-0 p-4 rounded-2xl border border-ink-200 flex flex-col justify-between shadow-lg">
      <div>
        <h2 class="font-bold text-ink-900 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
          <ico name="file-spreadsheet"/> 匯入 CSV 紀錄
        </h2>
        <p class="text-[11px] text-ink-700 mb-2.5">
          支援舊紀錄、試算表、Excel 批次匯入
        </p>
      </div>
      <label class="w-full block text-center py-2 px-2.5 rounded-xl bg-ink-200 text-ink-900 font-semibold text-xs cursor-pointer active:bg-ink-300 hover:bg-ink-300 border border-ink-300 transition">
        <span>選擇 CSV 檔案</span>
        <input type="file" accept=".csv" @change="handleFileUpload" class="hidden">
      </label>
    </div>

  </div>

  <!-- 訂單明細列表 (卡片視圖與表格視圖) -->
  <div class="bg-ink-0 rounded-2xl border border-ink-200 overflow-hidden shadow-xl">
    <div class="px-4 sm:px-5 py-3.5 border-b border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="text-base">{{ currentVehicleConfig.icon }}</span>
          <h3 class="text-xs sm:text-sm font-bold text-ink-900">訂單明細清單</h3>
          <span class="text-xs text-ink-700 font-mono">({{ visibleTrips.length }} 筆)</span>
        </div>
        <!-- 載具快選 -->
        <div class="flex items-center gap-1 p-0.5 bg-ink-50 rounded-lg border border-ink-200 text-[10px]">
          <button type="button" @click="setGlobalVehicleMode('walk')" :class="vehicleMode === 'walk' ? 'bg-ochre-200/20 text-ochre-500 font-bold' : 'text-ink-700'" class="px-2 py-0.5 rounded transition"><ico name="walking"/> 步行</button>
          <button type="button" @click="setGlobalVehicleMode('bike')" :class="vehicleMode === 'bike' ? 'bg-jade-500/20 text-jade-200 font-bold' : 'text-ink-700'" class="px-2 py-0.5 rounded transition"><ico name="bike"/> 腳踏車</button>
          <button type="button" @click="setGlobalVehicleMode('motorcycle')" :class="vehicleMode === 'motorcycle' ? 'bg-mist-500/20 text-mist-300 font-bold' : 'text-ink-700'" class="px-2 py-0.5 rounded transition"><ico name="motorcycle"/> 機車</button>
        </div>
      </div>
      <button v-if="visibleTrips.length > 0" @click="clearVisibleTrips()" class="text-xs text-crimson-500 hover:text-crimson-500 px-2.5 py-1 rounded bg-crimson-200/10 active:bg-crimson-200/20 transition self-end sm:self-auto">
        清空明細
      </button>
    </div>

    <!-- 模式 A：手機版進階卡片視圖 -->
    <div class="sm:hidden p-3 space-y-2.5 max-h-[540px] overflow-y-auto">
      <div v-for="(t, idx) in visibleTrips" :key="t.id" class="bg-ink-50 p-3 rounded-xl border border-ink-200/80 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="w-5 h-5 rounded-full bg-ink-200 text-ink-700 flex items-center justify-center font-mono text-[10px]">{{ idx + 1 }}</span>
            <!-- 戰力階級徽章 -->
            <span :class="getTierBadgeClass(t)" class="text-[9px] px-1.5 py-0.2 rounded font-bold">
              {{ getTierLabel(t) }}
            </span>
          </div>
          <input type="datetime-local" v-model="t.date" class="ml-auto mr-1 bg-ink-0 border border-ink-200 rounded px-1 py-0.5 text-[10px] font-mono text-ink-800 focus:outline-none focus:border-jade-500 w-[9.5rem]" aria-label="訂單日期時間">
          <button @click="removeTrip(t)" class="text-crimson-500 active:text-crimson-500 text-xs px-2 py-0.5 rounded bg-crimson-200/10">
            刪除
          </button>
        </div>
        <!-- 逐單起迄時間（有填才會在「獨立累加」模式逐單精算） -->
        <label class="flex items-center gap-1.5 text-[10px] text-ink-600">
          <span class="shrink-0">逐單時間</span>
          <input type="text" v-model.lazy="t.orderTimes" @change="syncStacksFromOrderTimes(t)" placeholder="14:05-14:32, 14:10-14:40" class="flex-1 min-w-0 bg-ink-0 border border-ink-200 rounded px-1.5 py-0.5 font-mono text-[10px] text-ink-800 focus:outline-none focus:border-jade-500" aria-label="逐單接單到送達時間">
          <span v-if="orderTimesInfo(t).state === 'ok'" class="shrink-0 text-jade-500">✓ {{ orderTimesInfo(t).count }} 單 {{ orderTimesInfo(t).sum }} 分</span>
          <span v-else-if="orderTimesInfo(t).state === 'invalid'" class="shrink-0 text-crimson-500">格式不符</span>
        </label>

        <!-- 🛵 疊單數量手動快速切換選擇器 (最多 10 疊) -->
        <div class="bg-ink-0/90 px-2.5 py-2 rounded-lg border border-ink-200 text-[11px]">
          <div class="text-ink-700 flex items-center gap-1 font-bold mb-1.5">
            <span class="text-jade-500"><ico name="layers"/></span> 疊單數量：<span class="text-jade-500 font-mono">{{ t.stacks || 1 }} 單</span>
          </div>
          <div class="grid grid-cols-5 gap-1 font-mono">
            <template v-for="n in 10" :key="n">
              <button type="button" @click="t.stacks = n"
                :class="(t.stacks === n || (!t.stacks && n === 1)) ? 'bg-jade-500/30 text-jade-200 border-jade-500 font-bold' : 'bg-ink-50 text-ink-700 border-ink-200 hover:border-ink-500'"
                class="py-1 rounded border text-[11px] transition text-center">{{ n }}</button>
            </template>
          </div>
        </div>
        
        <div class="grid grid-cols-4 gap-1.5 text-center text-xs">
          <div class="bg-ink-0/90 p-1.5 rounded border border-ink-200">
            <span class="text-[9px] text-ink-600 block">服務時間</span>
            <div class="flex items-center justify-center gap-0.5 mt-0.5">
              <input type="number" step="0.01" inputmode="decimal" onfocus="this.select()" v-model.number="t.duration" class="w-10 bg-transparent text-center font-mono text-mist-300 font-bold focus:outline-none">
              <span class="text-[9px] text-ink-600">分</span>
            </div>
          </div>

          <div class="bg-ink-0/90 p-1.5 rounded border border-ink-200">
            <span class="text-[9px] text-ink-600 block">距離</span>
            <div class="flex items-center justify-center gap-0.5 mt-0.5">
              <input type="number" step="0.01" inputmode="decimal" onfocus="this.select()" v-model.number="t.distance" class="w-10 bg-transparent text-center font-mono text-ink-900 font-bold focus:outline-none">
              <span class="text-[9px] text-ink-600">km</span>
            </div>
          </div>

          <div class="bg-ink-0/90 p-1.5 rounded border border-ink-200">
            <span class="text-[9px] text-ink-600 block">基本行程費</span>
            <div class="flex items-center justify-center gap-0.5 mt-0.5">
              <span class="text-[9px] text-ink-600">$</span>
              <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.baseFare" @input="syncTripBasePay(t)" placeholder="0" class="w-8 bg-transparent text-center font-mono text-ink-900 focus:outline-none">
            </div>
          </div>

          <div class="bg-ink-0/90 p-1.5 rounded border border-ink-200">
            <span class="text-[9px] text-ochre-500/90 block">基本加成</span>
            <div class="flex items-center justify-center gap-0.5 mt-0.5">
              <span class="text-[9px] text-ochre-500">+$</span>
              <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.boostFare" @input="syncTripBasePay(t)" placeholder="0" class="w-8 bg-transparent text-center font-mono text-ochre-500 font-bold focus:outline-none">
            </div>
          </div>
        </div>

        <!-- 您的費用明細 (單張詳細拆解) -->
        <div class="bg-ink-0/90 rounded-xl p-2.5 border border-ink-200 space-y-1.5 text-xs">
          <div class="flex items-center justify-between text-[11px] font-bold text-ink-800 border-b border-ink-200/80 pb-1">
            <span class="flex items-center gap-1 text-jade-200">
              <ico name="banknote"/> 您的費用明細
            </span>
            <span class="text-jade-500 font-mono font-bold">
              本趟總計: NT$ {{ ((t.basePay || 0) + (t.tips || 0) + (t.incentives || 0)) }}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div class="flex items-center justify-between text-ink-700">
              <span>基本行程費用:</span>
              <span class="text-ink-900 font-mono font-bold">NT$ {{ t.baseFare || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-ink-700">
              <span class="inline-flex items-center gap-1"><ico name="flame"/>基本報酬加成:</span>
              <span class="text-ochre-500 font-mono font-bold">+NT$ {{ t.boostFare || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-ink-700">
              <span>行程費用小計:</span>
              <span class="text-jade-200 font-mono font-bold">NT$ {{ t.basePay || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-ink-700">
              <span class="inline-flex items-center gap-1"><ico name="heart-handshake"/>顧客小費:</span>
              <span :class="(t.tips > 0) ? 'text-jade-500 font-bold' : 'text-ink-600'" class="font-mono">
                {{ t.tips > 0 ? '+NT$ ' + t.tips : '無 ($0)' }}
              </span>
            </div>
            <div v-if="t.incentives > 0" class="flex items-center justify-between text-ink-700 col-span-2">
              <span>活動獎勵加碼:</span>
              <span class="text-mist-300 font-mono font-bold">+NT$ {{ t.incentives }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-ink-200/50 text-[10px] text-ink-700">
            <span v-if="t.merchant" class="truncate max-w-[150px]"><ico name="store"/> {{ t.merchant }}</span>
            <span v-else class="text-ink-500">無商家備註</span>
            <span class="text-mist-400 font-mono"><ico name="sparkle"/> {{ t.points || Math.max(2, (t.stacks || 1) * 2) }} 點</span>
          </div>
        </div>

        <!-- 專法法定保底與補貼推算 (單趟即時精算) -->
        <div class="flex items-center justify-between text-[11px] p-2 rounded-xl bg-ink-50/90 border border-jade-500/30 text-ink-800">
          <div class="flex items-center gap-1.5">
            <span class="text-jade-500 font-bold"><ico name="scale"/> 專法保底應得:</span>
            <span class="font-mono font-bold text-jade-200">NT$ {{ tripLegal(t) }}</span>
            <span class="text-[10px] text-ink-600">({{ (getTripStatutoryMins(t)).toFixed(1) }}分)</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-ink-700">預估差額:</span>
            <span :class="(tripLegal(t) - (t.basePay||0)) > 0 ? 'text-ochre-500 font-bold' : 'text-jade-500 font-mono'" class="text-[11px] font-mono">
              {{ (tripLegal(t) - (t.basePay||0)) > 0 ? '+NT$' + (tripLegal(t) - (t.basePay||0)) + ' 補貼' : '✅ 已達保底' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="visibleTrips.length === 0" class="p-8 text-center text-ink-600 text-xs">
        尚無訂單資料，請使用上方功能秒貼文字或新增。
      </div>
    </div>

    <!-- 模式 B：電腦與平板版多欄表格視圖 -->
    <div class="hidden sm:block overflow-x-auto max-h-96">
      <table class="w-full min-w-[1400px] text-xs text-left text-ink-800">
        <thead class="bg-ink-50/80 text-ink-700 sticky top-0 border-b border-ink-200">
          <tr>
            <th class="p-3">#</th>
            <th class="p-3">日期時間</th>
            <th class="p-3">派單型態</th>
            <th class="p-3">服務時間 (分)</th>
            <th class="p-3">距離 (km)</th>
            <th class="p-3">基本行程費用</th>
            <th class="p-3">基本報酬加成</th>
            <th class="p-3">行程費用合計</th>
            <th class="p-3">顧客小費</th>
            <th class="p-3 text-jade-200">您的費用明細 (本趟總計)</th>
            <th class="p-3 text-ochre-500"><ico name="scale"/> 專法保底 / 預估補貼</th>
            <th class="p-3">戰力評級</th>
            <th class="p-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-200 font-mono">
          <tr v-for="(t, idx) in visibleTrips" :key="t.id" class="hover:bg-ink-200/40 transition">
            <td class="p-3 text-ink-600 font-sans">{{ idx + 1 }}</td>
            <td class="p-3 whitespace-nowrap"><input type="datetime-local" v-model="t.date" class="w-[10.5rem] bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 text-[11px] text-ink-800 font-mono focus:outline-none focus:border-mist-400" aria-label="訂單日期時間"></td>
            <td class="p-3">
              <select v-model.number="t.stacks" class="bg-ink-50 border border-ink-300 rounded px-2 py-1 text-mist-300 font-mono text-xs focus:outline-none focus:border-mist-400 cursor-pointer">
                <option v-for="n in 10" :key="'stk-'+n" :value="n">{{ n === 1 ? '1 單' : n + ' 疊' }} ({{ getStackMultiplier(n).toFixed(2) }}x)</option>
              </select>
              <input type="text" v-model.lazy="t.orderTimes" @change="syncStacksFromOrderTimes(t)" placeholder="逐單時間 14:05-14:32, …" :title="'每張單接單～送達，逗號分隔'" class="mt-1 block w-40 bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 text-[10px] text-ink-800 font-mono focus:outline-none focus:border-mist-400" aria-label="逐單接單到送達時間">
              <div v-if="orderTimesInfo(t).state === 'ok'" class="text-[10px] text-jade-500 font-sans mt-0.5">✓ 逐單 {{ orderTimesInfo(t).sum }} 分</div>
              <div v-else-if="orderTimesInfo(t).state === 'invalid'" class="text-[10px] text-crimson-500 font-sans mt-0.5">格式不符，未採用</div>
            </td>
            <td class="p-3">
              <div class="flex items-center gap-1">
                <input type="number" step="0.01" inputmode="decimal" onfocus="this.select()" v-model.number="t.duration" class="bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 w-14 text-mist-300 text-right font-mono focus:border-mist-400 focus:outline-none">
                <span class="text-ink-600 font-sans">分</span>
              </div>
            </td>
            <td class="p-3">
              <div class="flex items-center gap-1">
                <input type="number" step="0.01" inputmode="decimal" onfocus="this.select()" v-model.number="t.distance" class="bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 w-14 text-ink-900 text-right font-mono focus:border-mist-400 focus:outline-none">
                <span class="text-ink-600 font-sans">km</span>
              </div>
            </td>
            <!-- 基本行程費用 -->
            <td class="p-3">
              <div class="flex items-center gap-1">
                <span class="text-ink-600 font-sans">$</span>
                <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.baseFare" @input="syncTripBasePay(t)" placeholder="0" class="bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 w-14 text-ink-900 text-right font-mono focus:border-mist-400 focus:outline-none">
              </div>
            </td>
            <!-- 基本報酬加成 -->
            <td class="p-3">
              <div class="flex items-center gap-1">
                <span class="text-ochre-500 font-sans">+$</span>
                <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.boostFare" @input="syncTripBasePay(t)" placeholder="0" class="bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 w-14 text-ochre-500 font-bold text-right font-mono focus:border-ochre-500 focus:outline-none">
              </div>
            </td>
            <!-- 行程費用合計 -->
            <td class="p-3">
              <div class="flex items-center gap-1">
                <span class="text-ink-600 font-sans">$</span>
                <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.basePay" class="bg-ink-50 border border-jade-500/40 rounded px-1.5 py-0.5 w-14 text-jade-200 font-bold text-right font-mono focus:border-jade-500 focus:outline-none">
              </div>
            </td>
            <!-- 顧客小費 -->
            <td class="p-3">
              <div class="flex items-center gap-1">
                <span class="text-ink-600 font-sans">$</span>
                <input type="number" inputmode="numeric" onfocus="this.select()" v-model.number="t.tips" class="bg-ink-50 border border-ink-300 rounded px-1.5 py-0.5 w-12 text-ink-800 text-right font-mono focus:border-mist-400 focus:outline-none">
              </div>
            </td>
            <!-- 您的費用明細 (本趟總計) -->
            <td class="p-3 text-jade-500 font-bold">
              NT$ {{ ((t.basePay || 0) + (t.tips || 0) + (t.incentives || 0)) }}
            </td>
            <!-- 專法保底與預估補貼 -->
            <td class="p-3">
              <div class="flex flex-col">
                <span class="text-jade-200 font-bold">NT$ {{ tripLegal(t) }}</span>
                <span :class="(tripLegal(t) - (t.basePay||0)) > 0 ? 'text-ochre-500 font-bold text-[10px]' : 'text-jade-500 text-[10px]'">
                  {{ (tripLegal(t) - (t.basePay||0)) > 0 ? '+NT$' + (tripLegal(t) - (t.basePay||0)) + ' 補貼' : '已達保底' }}
                </span>
              </div>
            </td>
            <td class="p-3 font-sans">
              <span :class="getTierBadgeClass(t)" class="text-[10px] px-2 py-0.5 rounded font-bold">
                {{ getTierLabel(t) }}
              </span>
            </td>
            <td class="p-3 text-right font-sans">
              <button @click="removeTrip(t)" class="text-crimson-500 hover:text-crimson-500 px-2 py-1 hover:bg-crimson-200/10 rounded transition">
                刪除
              </button>
            </td>
          </tr>
          <tr v-if="visibleTrips.length === 0">
            <td colspan="12" class="p-10 text-center text-ink-600 font-sans">
              尚無訂單資料。請使用上方功能秒貼文字、匯入 CSV 或手動新增。
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>
`
  };
})(window);
