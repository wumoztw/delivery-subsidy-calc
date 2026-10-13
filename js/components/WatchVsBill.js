/* 自動由 index.html 拆出：WatchVsBill。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['watch-vs-bill'] = {
    name: 'WatchVsBill',
    setup() { return root.Vue.inject('dsc'); },
    template: `
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- 4. 觀念核心：手錶時間（物理工時） vs 帳單工時（法定工時） -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <div class="bg-ink-0 p-4 sm:p-6 rounded-2xl border border-mist-500/40 shadow-2xl space-y-4">
    <div class="flex items-center justify-between border-b border-ink-200 pb-3">
      <h3 class="text-sm sm:text-base font-bold text-mist-300 flex items-center gap-2">
        <span>⏱️</span> 觀念秒懂：手錶時間（物理工時） vs 帳單工時（法定工時）
      </h3>
      <span class="px-2.5 py-1 rounded-full bg-mist-500/20 text-mist-300 text-xs font-bold font-mono border border-mist-500/30">
        專法核心精髓
      </span>
    </div>

    <p class="text-xs text-ink-800 leading-relaxed">
      這兩個概念是專法精算中<strong>最核心、也最容易混淆的關鍵差異</strong>。簡單一句話區分：
      <span class="text-teal-300 font-bold">「實際跑單耗時」＝ 看手錶（物理肉體付出）</span>，
      <span class="text-mist-300 font-bold">「每單服務時間」＝ 看 App 帳單明細（政府合法承認）</span>。
    </p>

    <!-- 情境對照卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
      
      <div class="p-3.5 rounded-xl bg-ink-50 border border-ink-200 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-teal-300 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>⌚</span> 1. 實際跑單耗時（物理工時）
          </span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold font-mono">肉體真實付出</span>
        </div>
        <div class="text-ink-800 text-[11px] space-y-1.5 leading-relaxed">
          <div>• <strong>定義</strong>：您手錶上看著時間從 12:00 走到 12:30，在物理世界真實花費的時間。</div>
          <div>• <strong>實例</strong>：12:00 在便當店同時領取雙疊單（單 A ＋ 單 B），12:30 將兩單全部送完。</div>
          <div>• ⏱️ <strong>您的實際耗時</strong>：剛好就是 <strong class="text-teal-300 font-mono">30 分鐘</strong>。</div>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-ink-50 border border-ink-200 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-mist-300 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>📜</span> 2. 每單服務時間（法定工時）
          </span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-mist-500/20 text-mist-300 font-bold font-mono">政府專法承認</span>
        </div>
        <div class="text-ink-800 text-[11px] space-y-1.5 leading-relaxed">
          <div>• <strong>定義</strong>：Uber Eats App 帳單截圖上，每筆訂單「自接單至交付」各自獨立計時的時間。</div>
          <div>• <strong>實例</strong>：單 A 明細記錄 25 分鐘，單 B 明細記錄 25 分鐘（每單平均 25 分鐘）。</div>
          <div>• 📈 <strong>專法累加工時</strong>：依專法獨立累加，承認您服務了 <strong class="text-mist-300 font-mono">50 分鐘法定工時</strong>！</div>
        </div>
      </div>

    </div>

    <!-- 魔法結論 Box -->
    <div class="bg-gradient-to-r from-mist-0/60 to-jade-0/60 p-3.5 rounded-xl border border-mist-500/30 text-[11px] sm:text-xs text-ink-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
      <div>
        <div class="font-bold text-mist-300 flex items-center gap-1.5">
          <span>🪄</span> 為什麼兩者落差會產生「高時薪魔法」？
        </div>
        <p class="text-ink-700 mt-1 leading-relaxed">
          您只付出了 <strong class="text-teal-300 font-mono">30 分鐘</strong> 的肉體手錶時間，專法卻合法承認並撥付 <strong class="text-mist-300 font-mono">50 分鐘</strong> 的保底工資（放大倍數 <strong class="text-ochre-500 font-mono">1.67 倍</strong>，實質時薪衝上 <strong class="text-jade-500 font-mono font-bold">NT$408 / 時</strong>）！
        </p>
      </div>
    </div>

  </div>
`
  };
})(window);
