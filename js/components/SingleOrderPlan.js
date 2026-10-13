/* 自動由 index.html 拆出：SingleOrderPlan。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['single-order-plan'] = {
    name: 'SingleOrderPlan',
    setup() { return root.Vue.inject('dsc'); },
    template: `
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- 2.5 平台不給疊單？三大載具「單張訂單 (單發單) 最大收益作戰計畫」 -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <div class="bg-gradient-to-br from-ink-0 via-ink-0 to-ochre-0/30 p-4 sm:p-6 rounded-2xl border border-ochre-200/40 shadow-2xl space-y-4 sm:space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-200 pb-3.5">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-ochre-500 flex items-center gap-2">
          <span>🎯</span> 平台不給疊單時怎麼跑？「單張訂單最大收益作戰計畫」
        </h3>
        <p class="text-[11px] sm:text-xs text-ink-700 mt-1">
          當 Uber Eats 壓制疊單、全場只能接到單發單 (1.0x) 時，運用第一原理公式將每分鐘效益最大化，確保時薪穩達 NT$ 230 ~ $260+
        </p>
      </div>
      <span class="px-2.5 py-1 rounded-full bg-ochre-200/20 text-ochre-500 text-xs font-mono font-bold border border-ochre-200/30 self-start sm:self-auto">
        專法最大收益模式
      </span>
    </div>

    <!-- 專法物理公式核心：臨界時間 (Break-Even Time) -->
    <div class="bg-ink-50/90 p-4 rounded-xl border border-ochre-200/30 space-y-2 text-xs">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="font-bold text-ochre-500 flex items-center gap-1.5 text-xs sm:text-sm">
          <span>🔬</span> 單張訂單基礎計算方式：為什麼單趟服務時間「低於 10.3 分鐘」專法補貼會直接歸零？
        </span>
        <span class="px-2 py-0.5 rounded bg-ink-0 text-ink-700 font-mono text-[10px]">專法基數：NT$ 245/hr ≈ NT$ 4.083/分</span>
      </div>
      <p class="text-ink-800 text-[11px] leading-relaxed">
        依據專法，單發單補貼款為 <span class="font-mono text-jade-200">ΔR = max(0, 法定工時保底 - 平台車資)</span>。若平台給最低底價 <strong>$42 元</strong>：<br>
        • <strong>狂飆 8 分鐘送達</strong>：法定保底僅 <span class="font-mono text-crimson-500">8分 × $4.083 = $32.6</span> ➔ <strong>差額補貼 = $0 元</strong>（專法保障直接作廢）！<br>
        • <strong>專法起補臨界點</strong>：<span class="font-mono text-ochre-500 font-bold">$42 ÷ $4.083 ≈ 10.3 分鐘</span>。<strong>服務時間必須超過 10.3 分鐘，專法才開始每一分鐘補發 $4.08 元！</strong>
      </p>
    </div>

    <!-- 3 大致命誤區 vs 第一原理破局法則 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
      <div class="bg-ink-50 p-3.5 rounded-xl border border-crimson-200/30 space-y-1.5">
        <div class="flex items-center gap-1.5 text-crimson-500 font-bold text-[11px]">
          <span>⚠️</span> 致命誤區 1：搶快狂飆
        </div>
        <p class="text-ink-700 text-[11px] leading-relaxed">
          以為送越快賺越多。接 2km 狂飆 5 分鐘送達，服務時間僅 7 分鐘（保底僅 $28.5，補貼 $0）。送完在住宅區等單 8 分鐘，實質時薪慘跌至 <strong class="text-crimson-500 font-mono">$160/時</strong>！
        </p>
      </div>

      <div class="bg-ink-50 p-3.5 rounded-xl border border-crimson-200/30 space-y-1.5">
        <div class="flex items-center gap-1.5 text-crimson-500 font-bold text-[11px]">
          <span>⚠️</span> 致命誤區 2：單發跑長距
        </div>
        <p class="text-ink-700 text-[11px] leading-relaxed">
          單發接 4km 跨區單，表定給 $60。送達後身處郊區死胡同，空車騎回商圈 12 分鐘（0 元空窗），加上油耗來回 8km 扣 $12，實質時薪慘跌至 <strong class="text-crimson-500 font-mono">$125/時</strong>！
        </p>
      </div>

      <div class="bg-ink-50 p-3.5 rounded-xl border border-jade-500/30 space-y-1.5">
        <div class="flex items-center gap-1.5 text-jade-200 font-bold text-[11px]">
          <span>💎</span> 第一原理破局：短距拉滿工時
        </div>
        <p class="text-jade-500 text-[11px] leading-relaxed">
          <strong>「只接商圈核心短單」＋「店內吹冷氣等餐 6~8 分」＋「平穩安全巡航」</strong>，將單趟服務時間拉滿至 <strong>16~18 分鐘</strong>（每趟保底 $65~$73），消滅空車折返死時間！
        </p>
      </div>
    </div>

    <!-- 4 大單張訂單最大收益作戰法則 -->
    <div class="space-y-2.5">
      <h4 class="text-xs sm:text-sm font-bold text-ink-900 flex items-center gap-2">
        <span>⚔️</span> 單張訂單最大化收益：4 大作戰鐵律
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-xl bg-ink-50/80 border border-ink-200 space-y-1">
          <strong class="text-jade-500 flex items-center gap-1 text-[11px]">
            <span>1.</span> 嚴格執行「微距極限主義」（將空車死時間壓縮為 0）
          </strong>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            步行只接 300~500m、腳踏車只接 1.0~1.8km、機車只接 1.5~2.5km。送達點就在下個熱點隔壁，<strong>送完瞬間車輪就在下一家店門口，全天 0 分鐘浪費在無薪折返跑上！</strong>
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-ink-50/80 border border-ink-200 space-y-1">
          <strong class="text-jade-500 flex items-center gap-1 text-[11px]">
            <span>2.</span> 掌握「合法工時拉伸術」（吃滿 15~18 分鐘專法甜點區）
          </strong>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            到店等餐 6~8 分（吹冷氣算時薪）＋依法不超速平穩巡航 7~8 分 ＋ 交付 2 分。<strong>單趟穩拿 16 分鐘（保底 $65.3）</strong>，平台給 $42 立即強制補發 +$23.3 補貼款！
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-ink-50/80 border border-ink-200 space-y-1">
          <strong class="text-mist-300 flex items-center gap-1 text-[11px]">
            <span>3.</span> 偷渡微型疊單效益：送達前 2 分鐘「無縫預接」
          </strong>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            在抵達客人地址前 1~2 分鐘彈出下一張商圈單時立即按下接受！<strong>讓上一張單與下一張單重疊 2 分鐘起跳計費</strong>，消滅發呆空檔，輪子每一分鐘都在賺保底。
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-ink-50/80 border border-ink-200 space-y-1">
          <strong class="text-ochre-500 flex items-center gap-1 text-[11px]">
            <span>4.</span> 避開所有「長距孤島單」（單發過長一律拒接）
          </strong>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            沒有疊單倍率覆蓋時，單發超過機車 3km、腳踏車 2.5km、步行 800m 絕不能接。任何將你帶離商圈的長單，都會讓你陷入「去程賺車資、回程做白工」的慢性失血。
          </p>
        </div>
      </div>
    </div>

    <!-- 三大載具單張訂單黃金實戰參數表 -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse font-sans">
        <thead>
          <tr class="bg-ink-50 text-ink-700 border-b border-ink-200 text-[11px]">
            <th class="p-2.5 font-bold">載具模式</th>
            <th class="p-2.5 font-bold">單發單黃金距離</th>
            <th class="p-2.5 font-bold">最佳服務時間結構</th>
            <th class="p-2.5 font-bold">每小時目標趟數</th>
            <th class="p-2.5 font-bold text-right">單發實質淨時薪</th>
            <th class="p-2.5 font-bold text-ochre-500">單張訂單核心致勝策略</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-200 text-xs">
          <!-- 步行 -->
          <tr class="hover:bg-ink-200/30 text-ink-800">
            <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>🚶</span> 步行模式</td>
            <td class="p-2.5 font-mono text-ochre-500 font-bold">200m ～ 600m (極短單)</td>
            <td class="p-2.5 text-ink-800">等餐 8 分 + 步行 8 分 + 交付 2 分 = <span class="font-mono text-jade-200 font-bold">18 分鐘</span></td>
            <td class="p-2.5 font-mono text-ink-900">2.5 ～ 3.0 趟 / hr</td>
            <td class="p-2.5 text-right font-mono text-ochre-500 font-bold">NT$ 210 ～ $245</td>
            <td class="p-2.5 text-ink-800">守在百貨美食街/捷運出口，只接對街大樓短單，<strong>0 成本 100% 落袋</strong></td>
          </tr>
          <!-- 腳踏車 -->
          <tr class="hover:bg-ink-200/30 text-ink-800">
            <td class="p-2.5 font-bold text-jade-200 flex items-center gap-1"><span>🚲</span> 腳踏車</td>
            <td class="p-2.5 font-mono text-jade-200 font-bold">1.0km ～ 2.0km (生活圈)</td>
            <td class="p-2.5 text-ink-800">等餐 6 分 + 悠閒巡航 8 分 + 交付 2 分 = <span class="font-mono text-jade-200 font-bold">16 分鐘</span></td>
            <td class="p-2.5 font-mono text-ink-900">2.8 ～ 3.2 趟 / hr</td>
            <td class="p-2.5 text-right font-mono text-jade-200 font-bold">NT$ 225 ～ $250</td>
            <td class="p-2.5 text-ink-800">平路 15~18km/h 悠閒平穩巡航，輕齒比防抽筋，巷弄靠門取餐，<strong>體能消耗最低、合法賺滿工時</strong></td>
          </tr>
          <!-- 機車 -->
          <tr class="hover:bg-ink-200/30 text-ink-800">
            <td class="p-2.5 font-bold text-mist-300 flex items-center gap-1"><span>🛵</span> 機車模式</td>
            <td class="p-2.5 font-mono text-mist-300 font-bold">1.5km ～ 2.8km (商圈單)</td>
            <td class="p-2.5 text-ink-800">等餐 5 分 + 安全巡航 8 分 + 交付 2 分 = <span class="font-mono text-jade-200 font-bold">15 分鐘</span></td>
            <td class="p-2.5 font-mono text-ink-900">3.0 ～ 3.5 趟 / hr</td>
            <td class="p-2.5 text-right font-mono text-mist-300 font-bold">NT$ 235 ～ $260</td>
            <td class="p-2.5 text-ink-800"><strong>拒接 >3km 單發</strong>，送達前 2 分鐘預接下一張，<strong>無縫銜接消滅 0 元空窗</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 實戰模擬比對：盲目狂飆跑法 vs. 專法最大收益跑法 (以機車跑 3 小時為例) -->
    <div class="bg-ink-50 p-4 rounded-xl border border-ink-200 space-y-2.5 text-xs">
      <span class="font-bold text-ink-900 block text-[11px] sm:text-xs">
        📊 實戰成果比對：傳統狂飆跑法 vs. 專法最大收益跑法（以機車單發單連跑 3 小時為例）
      </span>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
        <div class="p-3 rounded-lg bg-ink-0 border border-crimson-200/30 space-y-1">
          <span class="text-crimson-500 font-bold block">🛑 傳統盲目跑法（狂飆＋隨意接長單）</span>
          <p class="text-ink-700 leading-relaxed">
            • 接 4km 遠單，10 分鐘飆達（保底僅 $40.8，補貼 $0）<br>
            • 回程空車花 10 分鐘無薪，來回 8km 油耗扣 $12<br>
            • <strong>3 小時總營收僅 NT$ 450，油耗扣 $108，淨時薪僅 NT$ 114/時 慘賠！</strong>
          </p>
        </div>
        <div class="p-3 rounded-lg bg-ink-0 border border-jade-500/40 space-y-1">
          <span class="text-jade-200 font-bold block">🌟 專法最大收益跑法（短距＋拉滿工時＋預接）</span>
          <p class="text-jade-500 leading-relaxed">
            • 專接 2km 商圈單，等餐＋平穩巡航 16 分鐘（保底 $65.3，補貼 +$20）<br>
            • 送達前預接下一筆，空窗壓低至 2 分鐘，短距油耗僅扣 $3/趟<br>
            • <strong>3 小時跑 10 趟總營收 NT$ 653，油耗僅 $50，淨時薪穩拿 NT$ 200~245+/時！</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- 十六字真言核心心法卡片 -->
    <div class="p-3.5 rounded-xl bg-gradient-to-r from-ochre-200/20 via-jade-500/20 to-mist-500/20 border border-ochre-200/40 flex items-center justify-between flex-wrap gap-2 text-xs">
      <div class="space-y-0.5">
        <span class="text-ochre-500 font-bold text-xs sm:text-sm">💎 單張訂單最大收益十六字真言：</span>
        <p class="text-ink-900 text-[11px]">
          <strong>「短距為王、等餐莫慌、安全巡航、預接續航！」</strong>
        </p>
      </div>
      <span class="text-[10px] text-ink-700 font-mono">消滅無薪折返，把每一分鐘專法保底落袋為安</span>
    </div>

  </div>
`
  };
})(window);
