/* 自動由 index.html 拆出：TabRules。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['tab-rules'] = {
    name: 'TabRules',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 分頁 5: 專法公式與作戰守則說明 -->
<div v-show="activeTab === 'rules'" class="bg-ink-0 p-4 sm:p-6 rounded-2xl border border-ink-200 shadow-xl space-y-4 sm:space-y-6 text-ink-800 text-xs leading-relaxed">
  <div>
    <h2 class="text-base sm:text-lg font-bold text-jade-500 mb-1">外送專法與疊單機制收益精算模型（Uber Eats）</h2>
    <p class="text-[11px] text-ink-700">本精算系統遵照外送專法草案規範與雙週結算規則設計。</p>
  </div>

  <!-- 1. 核心結算三大基本公式 -->
  <section class="space-y-2.5 bg-ink-50 p-3.5 sm:p-4 rounded-xl border border-ink-200">
    <h3 class="text-xs sm:text-sm font-bold text-ink-950">1. 核心結算三大基本公式（純文字版）</h3>
    
    <div class="space-y-1.5">
      <div class="font-bold text-jade-200 bg-ink-0 p-2.5 rounded-lg border border-ink-200 text-xs">
        1.1 外送總工時 ＝ 第 1 單服務時間 ＋ 第 2 單服務時間 ＋ ... ＋ 第 n 單服務時間
      </div>
      <p class="text-ink-700 text-[11px] pl-1">
        • <strong>單筆定義</strong>：每筆訂單自「接受派單」起至「送達交付」為止之完整服務時間。<br>
        • <strong>兩種法定工時模式（頂部可切換）</strong>：<br>
        &nbsp;&nbsp;– <strong>獨立累加（對帳）</strong>：法定分鐘 ＝ 本趟記錄的服務時間 × 疊單數。因系統目前只存「整趟」時間、沒有每張單起迄，這是獨立計時的近似，重疊路段可能被高估。<br>
        &nbsp;&nbsp;– <strong>經驗倍率表</strong>：1 疊 1.00x、2 疊 1.75x、3 疊 2.50x，之後每多 1 疊 +0.75x。用來估產值，不是逐單獨立加總。
      </p>
    </div>

    <div class="space-y-1.5">
      <div class="font-bold text-jade-200 bg-ink-0 p-2.5 rounded-lg border border-ink-200 text-xs">
        1.2 法定最低保障 ＝ 外送總工時 (小時) × 法定保障時薪費率
      </div>
      <p class="text-ink-700 text-[11px] pl-1">
        • <strong>保障時薪</strong>：當年最低工資時薪 × 1.25（2026 年 196 → NT$ 245）。頂部選「依日期自動」時，每筆訂單會依自己的日期套用對應年度費率。
      </p>
    </div>

    <div class="space-y-1.5">
      <div class="font-bold text-jade-200 bg-ink-0 p-2.5 rounded-lg border border-ink-200 text-xs">
        1.3 基本差額補貼 ＝ 法定最低保障 － 實領行程費用總額（若大於 0 則全額補發）
      </div>
      <p class="text-ink-700 text-[11px] pl-1">
        • <strong>實領費用</strong>：雙週週期內實領之基本報酬（淨行程費 ＋ 基本加成）。<br>
        • <strong>排除項目</strong>：顧客小費與活動獎勵屬於免扣抵淨利，不計入實領費用抵扣。
      </p>
    </div>
  </section>

  <!-- 2. 跑單實質時薪產值模型 -->
  <section class="space-y-2.5 bg-ink-50 p-3.5 sm:p-4 rounded-xl border border-ink-200">
    <h3 class="text-xs sm:text-sm font-bold text-ink-950">2. 跑單實質時薪產值模型與對照表</h3>
    <div class="font-bold text-teal-300 bg-ink-0 p-2.5 rounded-lg border border-ink-200 text-xs">
      實質產值時薪 ＝（法定申報工時 ÷ 實際跑單耗時）× 法定保障時薪費率
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left font-mono text-[11px]">
        <thead class="text-ink-700 border-b border-ink-200">
          <tr>
            <th class="py-1.5">型態</th>
            <th class="py-1.5">60分內工時</th>
            <th class="py-1.5">放大倍數</th>
            <th class="py-1.5">保底實質時薪 (@$245)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-200 text-ink-800">
          <tr>
            <td class="py-1.5 text-ink-700">1 單</td>
            <td class="py-1.5">60 分鐘</td>
            <td class="py-1.5 text-mist-400">1.0x</td>
            <td class="py-1.5 text-jade-500">$245.00</td>
          </tr>
          <tr>
            <td class="py-1.5 text-ink-700">2 疊</td>
            <td class="py-1.5">100～110 分</td>
            <td class="py-1.5 text-mist-400">1.67～1.83x</td>
            <td class="py-1.5 text-jade-500">$408.33 ～ $449.17</td>
          </tr>
          <tr>
            <td class="py-1.5 text-ink-700">3 疊</td>
            <td class="py-1.5">140～160 分</td>
            <td class="py-1.5 text-mist-400">2.33～2.67x</td>
            <td class="py-1.5 text-jade-500">$571.67 ～ $653.33</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

</div>
`
  };
})(window);
