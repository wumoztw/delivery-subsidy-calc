/* 雙週對帳單：預覽、下載圖片、列印／存 PDF、複製文字。列印時只印 .statement-sheet（見 css/src.css）。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['statement-modal'] = {
    name: 'StatementModal',
    setup() {
      const ctx = root.Vue.inject('dsc');
      const money = (v) => 'NT$' + Math.round(Number(v) || 0).toLocaleString('zh-TW');
      const mins = (v) => (Number(v) || 0).toFixed(1);
      return { ...ctx, money, mins };
    },
    template: `
<div v-if="showStatementModal && statement" class="statement-root fixed inset-0 z-50 flex items-center justify-center p-3 bg-ink-0/50 backdrop-blur-sm">
  <div class="statement-frame bg-ink-0 border border-ink-200 rounded-2xl w-full max-w-3xl p-4 sm:p-5 space-y-3 shadow-2xl overflow-y-auto max-h-[92vh]">
    <div class="statement-tools flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 pb-3">
      <h3 class="text-sm sm:text-base font-bold text-ink-950">🧾 雙週對帳單</h3>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" @click="downloadStatementPNG" :disabled="statementBusy" class="px-3 py-1.5 bg-jade-700 hover:bg-jade-500 text-ink-50 font-bold text-xs rounded-xl disabled:opacity-60">{{ statementBusy ? '產生中…' : '🖼️ 存成圖片' }}</button>
        <button type="button" @click="printStatement" class="px-3 py-1.5 bg-ink-200 hover:bg-ink-300 text-ink-900 text-xs rounded-xl border border-ink-300">🖨️ 列印／存 PDF</button>
        <button type="button" @click="copyStatementText" class="px-3 py-1.5 bg-ink-200 hover:bg-ink-300 text-ink-900 text-xs rounded-xl border border-ink-300">📋 複製文字</button>
        <button type="button" @click="showStatementModal = false" class="px-3 py-1.5 text-ink-700 text-xs rounded-xl border border-ink-300 bg-white" aria-label="關閉">關閉</button>
      </div>
    </div>

    <article class="statement-sheet bg-white text-ink-950 rounded-xl border border-ink-200 p-4 sm:p-6 space-y-3 text-xs">
      <header class="border-b-2 border-ink-900 pb-2">
        <h1 class="text-lg sm:text-xl font-bold">{{ statement.title }}</h1>
        <div class="text-ink-700 mt-0.5">{{ statement.cycleLabel }}</div>
        <div class="text-ink-600 mt-1">製表日 {{ statement.generatedAt }}　保障時薪 {{ statement.rateText }}　工時模式 {{ statement.modeLabel }}</div>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full font-mono text-[11px]">
          <thead class="font-sans text-ink-700">
            <tr class="border-b border-ink-300">
              <th class="text-left py-1 pr-2">日期時間</th><th class="text-left pr-2">商家</th><th class="text-right">疊</th>
              <th class="text-right">實際(分)</th><th class="text-right">法定(分)</th><th class="text-right whitespace-nowrap pl-1">保底</th><th class="text-right whitespace-nowrap pl-1">平台報酬</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in statement.rows" :key="'st-'+i" class="border-b border-ink-200/70 align-top">
              <td class="py-1 pr-2 whitespace-nowrap">{{ r.date }}</td>
              <td class="pr-2 font-sans min-w-[5rem]">{{ r.merchant || '－' }}<div v-if="r.exact" class="text-[10px] text-ink-600 font-mono">{{ r.orderTimes }}</div></td>
              <td class="text-right">{{ r.stacks }}</td>
              <td class="text-right">{{ mins(r.physicalMins) }}</td>
              <td class="text-right">{{ mins(r.statMins) }}<span v-if="r.exact" title="逐單精算">*</span></td>
              <td class="text-right whitespace-nowrap pl-1">{{ money(r.legal) }}</td>
              <td class="text-right whitespace-nowrap pl-1">{{ money(r.basePay) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div class="rounded-lg border border-ink-200 p-2"><div class="text-[10px] text-ink-600">趟／單</div><div class="font-mono font-bold">{{ statement.totals.trips }}／{{ statement.totals.orders }}</div></div>
        <div class="rounded-lg border border-ink-200 p-2"><div class="text-[10px] text-ink-600">實際／法定工時</div><div class="font-mono font-bold">{{ (statement.totals.physicalMins / 60).toFixed(2) }}／{{ (statement.totals.statMins / 60).toFixed(2) }} 時</div></div>
        <div class="rounded-lg border border-ink-200 p-2"><div class="text-[10px] text-ink-600">法定保底</div><div class="font-mono font-bold">{{ money(statement.totals.legal) }}</div></div>
        <div class="rounded-lg border border-ink-200 p-2"><div class="text-[10px] text-ink-600">平台基本報酬</div><div class="font-mono font-bold">{{ money(statement.totals.basePay) }}</div></div>
      </section>
      <div class="flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-ink-900 pt-2">
        <div class="text-base sm:text-lg font-bold text-ochre-700">應補差額 {{ money(statement.totals.subsidy) }}</div>
        <div class="text-ink-700">總收入 {{ money(statement.totals.income) }}（含小費獎勵 {{ money(statement.totals.tips) }}）</div>
      </div>
      <ul class="text-[10px] text-ink-600 space-y-0.5">
        <li v-if="statement.exactCount > 0">* 依每張單接單～送達起迄逐單加總。</li>
        <li v-for="(n, i) in statement.notes" :key="'n-'+i">※ {{ n }}</li>
      </ul>
    </article>
  </div>
</div>
`
  };
})(window);
