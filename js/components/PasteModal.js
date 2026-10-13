/* 自動由 index.html 拆出：PasteModal。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['paste-modal'] = {
    name: 'PasteModal',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 彈窗 1：原況文字 / 剪貼簿一鍵秒貼解析彈窗 -->
<div v-if="showPasteModal" v-cloak class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-ink-0/50 backdrop-blur-sm">
  <div class="bg-ink-0 border border-mist-500/40 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
    <div class="flex items-center justify-between border-b border-ink-200 pb-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">📋</span>
        <h3 class="text-sm sm:text-base font-bold text-mist-300">剪貼簿 / 原況文字一鍵秒貼解析</h3>
      </div>
      <button @click="showPasteModal = false" class="text-ink-700 hover:text-ink-900 text-lg">✕</button>
    </div>

    <p class="text-xs text-ink-700">
      💡 <strong>使用技巧</strong>：在手機相簿長按跑單截圖複製文字，或點「從剪貼簿直接貼上」。下方會標示哪些欄位有抓到、哪些是漏欄（請手動補）。疊單數不會從點數自動推算，預設 1 疊。
    </p>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-ink-800 font-bold">跑單文字內容：</label>
        <button @click="readClipboard" class="text-xs px-2.5 py-1 rounded-lg bg-mist-600/30 hover:bg-mist-600/50 text-mist-300 border border-mist-500/40 transition flex items-center gap-1">
          <span>📋</span> 從剪貼簿直接貼上
        </button>
      </div>
      <textarea v-model="pasteText" placeholder="請在此貼上複製的文字（如：本趟行程預估費用為 $113.00、19 分鐘 38 秒、1.58 公里、已賺取 4 點、基本行程費用 $93、基本報酬加成 $20）" rows="4" class="w-full bg-ink-50 border border-ink-300 rounded-xl p-3 text-xs text-ink-950 font-mono focus:border-mist-500 focus:outline-none"></textarea>
    </div>

    <!-- 即時解析預覽卡片：有文字就顯示，並標示漏欄 -->
    <div v-if="pasteText.trim()" class="bg-ink-50 p-3.5 rounded-xl border border-mist-500/30 space-y-2">
      <div class="flex items-center justify-between text-xs border-b border-ink-200 pb-2">
        <span class="font-bold text-mist-300">🔍 即時解析萃取結果：</span>
        <span :class="getTierBadgeClass(parsedPasteTrip)" class="text-[9px] px-1.5 py-0.5 rounded font-bold">
          {{ getTierLabel(parsedPasteTrip) }}
        </span>
      </div>

      <div class="flex flex-wrap gap-1">
        <span v-for="f in pasteFieldStatus.found" :key="'ok-'+f.key" class="text-[10px] px-1.5 py-0.5 rounded-full bg-jade-500/15 text-jade-200 border border-jade-500/30">✓ {{ f.label }}</span>
        <span v-for="f in pasteFieldStatus.missing" :key="'miss-'+f.key" class="text-[10px] px-1.5 py-0.5 rounded-full bg-crimson-200/15 text-crimson-500 border border-crimson-200/30">✗ 漏欄：{{ f.label }}</span>
        <span v-for="f in pasteFieldStatus.notes" :key="'note-'+f.key" class="text-[10px] px-1.5 py-0.5 rounded-full bg-ochre-200/15 text-ochre-500 border border-ochre-200/30">! {{ f.label }}</span>
      </div>
      <p v-if="pasteFieldStatus.missing.length" class="text-[10px] text-crimson-500/90">漏欄不會阻擋加入，但法定工時／差額可能偏差，建議在訂單明細手動補上。</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div class="bg-ink-0 p-2 rounded border" :class="parsedPasteTrip.duration > 0 ? 'border-ink-200' : 'border-crimson-200/40'">
          <span class="text-[10px] text-ink-700 block">服務時間</span>
          <span class="font-bold font-mono" :class="parsedPasteTrip.duration > 0 ? 'text-mist-300' : 'text-crimson-500'">{{ parsedPasteTrip.duration > 0 ? parsedPasteTrip.duration + ' 分' : '未抓到' }}</span>
        </div>
        <div class="bg-ink-0 p-2 rounded border" :class="parsedPasteTrip.distance > 0 ? 'border-ink-200' : 'border-crimson-200/40'">
          <span class="text-[10px] text-ink-700 block">距離里程</span>
          <span class="font-bold font-mono" :class="parsedPasteTrip.distance > 0 ? 'text-ink-900' : 'text-crimson-500'">{{ parsedPasteTrip.distance > 0 ? parsedPasteTrip.distance + ' km' : '未抓到' }}</span>
        </div>
        <div class="bg-ink-0 p-2 rounded border" :class="parsedPasteTrip.basePay > 0 ? 'border-ink-200' : 'border-crimson-200/40'">
          <span class="text-[10px] text-ink-700 block">行程費用合計</span>
          <span class="font-bold font-mono" :class="parsedPasteTrip.basePay > 0 ? 'text-jade-200' : 'text-crimson-500'">{{ parsedPasteTrip.basePay > 0 ? 'NT$ ' + parsedPasteTrip.basePay : '未抓到' }}</span>
        </div>
        <div class="bg-ink-0 p-2 rounded border border-ochre-200/30">
          <span class="text-[10px] text-ink-700 block">疊單型態</span>
          <span class="font-bold font-mono text-ochre-500">{{ parsedPasteTrip.stacks }} 疊 ({{ getStackMultiplier(parsedPasteTrip.stacks).toFixed(2) }}x)</span>
        </div>
      </div>
      <div v-if="parsedPasteTrip.orderTimes" class="bg-ink-0 p-2 rounded border border-jade-200/40 text-[11px]">
        <span class="text-[10px] text-ink-700 block">逐單時間（已依單數設定疊單數）</span>
        <span class="font-mono text-jade-500">{{ parsedPasteTrip.orderTimes }}</span>
        <span class="text-ink-600">　合計 {{ orderTimesInfo(parsedPasteTrip).sum }} 分</span>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink-700 pt-1 px-1">
        <span :class="parsedPasteTrip.baseFare > 0 ? '' : 'text-crimson-500'">基本費: {{ parsedPasteTrip.baseFare > 0 ? 'NT$' + parsedPasteTrip.baseFare : '未抓到' }} | 加成: {{ parsedPasteTrip.boostFare > 0 ? '+NT$' + parsedPasteTrip.boostFare : '未抓到' }}</span>
        <span v-if="parsedPasteTrip.tips > 0" class="text-jade-500 font-bold">🎁 小費: +NT\${{ parsedPasteTrip.tips }}</span>
        <span v-else class="text-crimson-500">小費未抓到</span>
      </div>
    </div>

    <div class="flex gap-2 pt-2">
      <button @click="confirmPasteTrip" :disabled="!parsedPasteTrip.duration && !parsedPasteTrip.basePay" class="flex-1 py-2.5 rounded-xl bg-mist-600 active:bg-mist-500 hover:bg-mist-500 text-ink-50 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition shadow">
        確認加入訂單清單
      </button>
      <button @click="showPasteModal = false" class="px-4 py-2.5 rounded-xl bg-ink-200 hover:bg-ink-300 text-ink-800 text-xs border border-ink-300 transition">
        取消
      </button>
    </div>
  </div>
</div>
`
  };
})(window);
