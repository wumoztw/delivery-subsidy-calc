/* 自動由 index.html 拆出：ManualModal。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['manual-modal'] = {
    name: 'ManualModal',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 彈窗 2：手動新增單筆彈窗 -->
<div v-if="showManualModal" v-cloak class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-ink-0/50 backdrop-blur-sm">
  <div class="bg-ink-0 border border-ink-300 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
    <div class="flex items-center justify-between border-b border-ink-200 pb-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">✏️</span>
        <h3 class="text-sm sm:text-base font-bold text-ink-950">手動新增單筆行程</h3>
      </div>
      <button @click="showManualModal = false" class="text-ink-700 hover:text-ink-900 text-lg">✕</button>
    </div>

    <div class="grid grid-cols-2 gap-3 text-xs">
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">服務時間 (分鐘) *</label>
        <input type="number" step="0.01" inputmode="decimal" v-model.number="newTrip.duration" placeholder="例: 19.63" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">距離 (公里 km)</label>
        <input type="number" step="0.01" inputmode="decimal" v-model.number="newTrip.distance" placeholder="例: 1.58" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">基本行程費用 (NT$)</label>
        <input type="number" inputmode="numeric" v-model.number="newTrip.baseFare" @input="syncNewTripBasePay" placeholder="例: 93" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">基本報酬加成 (NT$)</label>
        <input type="number" inputmode="numeric" v-model.number="newTrip.boostFare" @input="syncNewTripBasePay" placeholder="例: 20" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">行程費用合計 (NT$) *</label>
        <input type="number" inputmode="numeric" v-model.number="newTrip.basePay" placeholder="例: 113" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-jade-200 font-bold font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">派單型態 (疊單數)</label>
        <select v-model.number="newTrip.stacks" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
          <option :value="1">1 單 (單發 - 1.0x)</option>
          <option :value="2">2 疊 (雙單 - 1.75x)</option>
          <option :value="3">3 疊 (三單 - 2.50x)</option>
          <option :value="4">4 疊 (四單 - 3.25x)</option>
          <option :value="5">5 疊 (五單 - 4.00x)</option>
          <option :value="6">6 疊 (六單 - 4.75x)</option>
          <option :value="7">7 疊 (七單 - 5.50x)</option>
          <option :value="8">8 疊 (八單 - 6.25x)</option>
          <option :value="9">9 疊 (九單 - 7.00x)</option>
          <option :value="10">10 疊 (十單 - 7.75x)</option>
        </select>
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">顧客小費 (NT$)</label>
        <input type="number" inputmode="numeric" v-model.number="newTrip.tips" placeholder="無則留空" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
      <div>
        <label class="text-[11px] text-ink-700 block mb-1">商家名稱 (可選)</label>
        <input type="text" v-model="newTrip.merchant" placeholder="例: 熱門便當店" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 focus:border-jade-500 focus:outline-none">
      </div>
      <div class="col-span-2 space-y-1">
        <label class="text-[11px] text-ink-700 block mb-1">逐單時間（選填）</label>
        <input type="text" v-model.lazy="newTrip.orderTimes" @change="syncStacksFromOrderTimes(newTrip)" placeholder="14:05-14:32, 14:10-14:40" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
        <p class="text-[10px] text-ink-600">每張單從接單到送達的起迄，逗號分隔。填了之後「獨立累加」模式會逐單精算，不再用「整趟 × 疊數」近似；沒填服務時間時以區間聯集當實際耗時。
          <span v-if="orderTimesInfo(newTrip).state === 'ok'" class="text-jade-500">✓ {{ orderTimesInfo(newTrip).count }} 單，合計 {{ orderTimesInfo(newTrip).sum }} 分，實際 {{ orderTimesInfo(newTrip).union }} 分</span>
          <span v-else-if="orderTimesInfo(newTrip).state === 'invalid'" class="text-crimson-500">格式不符</span>
        </p>
      </div>
      <div class="col-span-2">
        <label class="text-[11px] text-ink-700 block mb-1">日期時間（決定歸入哪一期、套用哪年費率）</label>
        <input type="datetime-local" v-model="newTrip.date" class="w-full bg-ink-50 border border-ink-300 p-2 rounded-xl text-ink-950 font-mono focus:border-jade-500 focus:outline-none">
      </div>
    </div>

    <div class="flex gap-2 pt-2">
      <button @click="addTripFromModal" class="flex-1 py-2.5 rounded-xl bg-jade-700 active:bg-jade-500 hover:bg-jade-500 text-ink-50 font-bold text-xs transition shadow">
        加入訂單清單
      </button>
      <button @click="showManualModal = false" class="px-4 py-2.5 rounded-xl bg-ink-200 hover:bg-ink-300 text-ink-800 text-xs border border-ink-300 transition">
        取消
      </button>
    </div>
  </div>
</div>
`
  };
})(window);
