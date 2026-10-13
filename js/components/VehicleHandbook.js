/* 自動由 index.html 拆出：VehicleHandbook。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['vehicle-handbook'] = {
    name: 'VehicleHandbook',
    setup() { return root.Vue.inject('dsc'); },
    template: `
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- 3. 3 大載具專屬實戰作戰手冊（步行 / 腳踏車 / 機車） -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <div class="bg-ink-0 p-4 sm:p-6 rounded-2xl border border-ink-200 shadow-2xl space-y-4 sm:space-y-5">
    
    <!-- 頂部切換標頭 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200 pb-3.5">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-ink-900 flex items-center gap-2">
          <span>📖</span> 載具專屬實戰作戰手冊（含多疊單密度豁免法則）
        </h3>
        <p class="text-[11px] text-ink-700 mt-0.5">
          依據第一原理：總里程 vs. 每單平均密度（Density）、距離陷阱與高產值決策樹
        </p>
      </div>

      <!-- 3 大載具手冊切換標籤 -->
      <div class="flex items-center gap-1.5 p-1 bg-ink-50 rounded-xl border border-ink-200 self-start sm:self-auto flex-wrap">
        <button type="button" @click="tacticsGuideTab = 'walk'"
          :class="tacticsGuideTab === 'walk' ? 'bg-ochre-200/20 text-ochre-500 border-ochre-200/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-2.5 py-1 rounded-lg text-xs transition border flex items-center gap-1">
          <span>🚶</span> <span>步行實戰</span>
        </button>
        <button type="button" @click="tacticsGuideTab = 'bike'"
          :class="tacticsGuideTab === 'bike' ? 'bg-jade-500/20 text-jade-200 border-jade-500/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-2.5 py-1 rounded-lg text-xs transition border flex items-center gap-1">
          <span>🚲</span> <span>腳踏車實戰</span>
        </button>
        <button type="button" @click="tacticsGuideTab = 'motorcycle'"
          :class="tacticsGuideTab === 'motorcycle' ? 'bg-mist-500/20 text-mist-300 border-mist-500/40 font-bold shadow' : 'text-ink-700 hover:text-ink-900 border-transparent'"
          class="px-2.5 py-1 rounded-lg text-xs transition border flex items-center gap-1">
          <span>🛵</span> <span>機車實戰</span>
        </button>
      </div>
    </div>

    <!-- ⚡ 第一原理專題：打破「總里程」盲點，看懂「每單平均密度 (Density)」 ⚡ -->
    <div class="bg-gradient-to-r from-jade-0/40 via-ink-0 to-mist-0/40 p-4 rounded-xl border border-jade-500/30 space-y-2 text-xs">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="text-jade-200 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
          <span>💡</span> 第一原理核心洞察：為什麼「5 疊 6 公里」不是雷單，而是時薪 $900 的超級神單？
        </span>
        <span class="px-2 py-0.5 rounded bg-jade-500/20 text-jade-200 text-[10px] font-mono font-bold border border-jade-500/30">
          多疊密度豁免法則
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-ink-800">
        <div class="p-2.5 rounded-lg bg-ink-50/80 border border-crimson-200/30 space-y-1">
          <span class="text-crimson-500 font-bold block">🛑 單發長單 6.0km（1 疊）：真·超級雷單</span>
          <p class="text-ink-700 leading-relaxed">
            耗時 25 分鐘，法定保障僅 NT$102。回程空車 6km 耗力耗時無收入，每單平均 6km，實質時薪慘跌至 <strong>$120~$140/時</strong>。
          </p>
        </div>
        <div class="p-2.5 rounded-lg bg-ink-50/80 border border-jade-500/40 space-y-1">
          <span class="text-jade-200 font-bold block">👑 多疊長單 6.0km（5 疊）：SSR 級奇蹟神單</span>
          <p class="text-jade-500 leading-relaxed">
            耗時 38 分鐘，<strong>工時放大 4.00x，法定保障狂飆 NT$630</strong>！平均每單僅 <strong>1.2km</strong>（在舒適圈內），每公里產值達 <strong>$105/km</strong>，時薪高達 <strong>NT$ 660~$970+/時</strong>！
          </p>
        </div>
      </div>
      <p class="text-[11px] text-jade-500 font-medium">
        🎯 <strong>黃金接單公式</strong>：只要 <span class="font-mono underline">總里程 ÷ 疊單數 ≤ 載具舒適圈</span> 且 <span class="font-mono underline">每公里產值 ≥ NT$60</span>，就算總里程偏長，也必須「秒接」！
      </p>
    </div>

    <!-- ────────────────────────────────────────────────────────── -->
    <!-- 3-A. 🚶 步行外送員實戰指南 -->
    <!-- ────────────────────────────────────────────────────────── -->
    <div v-show="tacticsGuideTab === 'walk'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🚶</span>
          <h4 class="text-sm font-bold text-ochre-500">
            步行帳號實戰：如何打破「走不動魔咒」與極致零成本高時薪？
          </h4>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-ochre-200/20 text-ochre-500 text-xs font-bold font-mono border border-ochre-200/30">
          步行專屬決策樹
        </span>
      </div>

      <!-- 3 大步行距離與體能陷阱 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-ink-50 p-3 rounded-xl border border-crimson-200/30 space-y-1">
          <span class="text-crimson-500 font-bold flex items-center gap-1 text-[11px]">
            <span>🛑</span> 陷阱 1：超距體能崩潰（> 1.0km）
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            步行 1.2km 需走 18 分鐘，來回走 36 分鐘耗盡體力且回程無單，實質時薪直接暴跌至 <span class="text-crimson-500 font-mono font-bold">$130/時</span>。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-ochre-200/30 space-y-1">
          <span class="text-ochre-500 font-bold flex items-center gap-1 text-[11px]">
            <span>⚠️</span> 陷阱 2：垂直爬樓與巷弄迷宮
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            爬 5 樓無電梯公寓等同水平 300 公尺體能消耗，巷弄死胡同大幅拖慢步速，無法維持穩定服務時薪。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-teal-500/30 space-y-1">
          <span class="text-teal-400 font-bold flex items-center gap-1 text-[11px]">
            <span>🎒</span> 陷阱 3：大體積與重物手搖飲
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            手提 6 杯以上飲料負重過大，步速驟降至 3km/h，且容易傾倒打翻，徒增爭議與時間損失。
          </p>
        </div>
      </div>

      <!-- 步行距離與單數決策矩陣 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr class="bg-ink-50 text-ink-700 border-b border-ink-200 text-[11px]">
              <th class="p-2.5 font-bold">派單型態</th>
              <th class="p-2.5 font-bold">總里程</th>
              <th class="p-2.5 font-bold">送達環境</th>
              <th class="p-2.5 font-bold text-center">戰力評級</th>
              <th class="p-2.5 font-bold text-right">預估實質時薪</th>
              <th class="p-2.5 font-bold text-ochre-500">步行司機實戰處置</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-200 text-xs">
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-crimson-500 flex items-center gap-1"><span>❌</span> 遠距單發單</td>
              <td class="p-2.5 font-mono text-crimson-500">&gt; 1.0 km</td>
              <td class="p-2.5 text-ink-700">住宅區 / 郊外無商圈</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-crimson-200/20 text-crimson-500 border border-crimson-200/40 text-[10px] font-bold">🚫 超級雷單</span></td>
              <td class="p-2.5 text-right font-mono text-crimson-500 font-bold">$120 ～ $150</td>
              <td class="p-2.5 text-crimson-500 font-bold">果斷轉單 / 拒接！（避免體能透支）</td>
            </tr>
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>🟡</span> 商圈一般短單</td>
              <td class="p-2.5 font-mono text-ochre-500">500m ～ 800m</td>
              <td class="p-2.5 text-ink-700">同商圈隔壁街 / 辦公大樓</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 border border-mist-500/40 text-[10px] font-bold">⚡ 標準單</span></td>
              <td class="p-2.5 text-right font-mono text-mist-300 font-bold">$245 ～ $290</td>
              <td class="p-2.5 text-mist-300">可以接！（等餐 8 分＋步行 10 分，拉滿 18 分工時）</td>
            </tr>
            <tr class="bg-ochre-0/30 text-ochre-700 border-ochre-200/30">
              <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>👑</span> 美食街/百貨雙疊</td>
              <td class="p-2.5 font-mono text-ochre-500 font-bold">≤ 500 公尺</td>
              <td class="p-2.5 text-ochre-950">同一商場 / 對街住商群</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-ochre-200/20 text-ochre-500 border border-ochre-200/40 text-[10px] font-bold">🌟 SSR 步行黃金單</span></td>
              <td class="p-2.5 text-right font-mono text-ochre-500 font-black">NT$ 340 ～ $380</td>
              <td class="p-2.5 text-ochre-500 font-black">秒接！零油耗 100% 純淨賺 🚀</td>
            </tr>
            <tr class="bg-jade-0/30 text-jade-400 border-jade-500/30">
              <td class="p-2.5 font-bold text-jade-200 flex items-center gap-1"><span>🚀</span> 商圈高密度三疊群單</td>
              <td class="p-2.5 font-mono text-jade-200 font-bold">1.2 ～ 1.8 km (均單 0.5km)</td>
              <td class="p-2.5 text-jade-500">商圈順路連續交付</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-jade-500/20 text-jade-200 border border-jade-500/40 text-[10px] font-bold">👑 SSR 步行工時放大單</span></td>
              <td class="p-2.5 text-right font-mono text-jade-200 font-black">NT$ 360 ～ $420+</td>
              <td class="p-2.5 text-jade-200 font-black">秒接！均單 500m 觸發密度豁免 💎</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 步行司機 5 大接單鐵律 -->
      <div class="bg-ink-50/80 p-4 rounded-xl border border-ochre-200/30 space-y-3 text-xs">
        <h4 class="text-ochre-500 font-bold text-xs sm:text-sm flex items-center gap-1.5">
          <span>💎</span> 步行司機收益最大化：5 大實戰接單鐵律
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-ink-800">
          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-ochre-500 block">1. 嚴格執行「步行過 800m 必轉」</strong>
            <p class="text-ink-700 leading-relaxed">
              超過 800 公尺對步行是體能負擔，嚴格只接 800m 內短單，把精力留給核心熱區。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-ochre-500 block">2. 專注「百貨/美食街雙疊」同取同送</strong>
            <p class="text-ink-700 leading-relaxed">
              百貨商場一次領兩單，室內有空調且步行距離極短，體能消耗最低、時薪產值最高。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-200 block">3. 善用「等餐時間拉滿法」</strong>
            <p class="text-ink-700 leading-relaxed">
              在店家吹冷氣等餐 8 分鐘，雙疊同步計時＝累積 16 分鐘專法工時，兼具舒適與收益。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-200 block">4. 堅決拒接「大體積重物/多杯熱湯」</strong>
            <p class="text-ink-700 leading-relaxed">
              保護雙手與膝蓋，輕裝快步維持 4.5km/h 巡航步速，避免傾倒打翻風險。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-mist-300 block">5. 定點守候「高密度捷運商圈/夜市」</strong>
            <p class="text-ink-700 leading-relaxed">
              不在路邊漫無目的走動，定點在知名餐飲街或捷運美食圈守候，輪子不動但步步是黃金。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ochre-0/40 border border-ochre-200/40 space-y-1 sm:col-span-2">
            <strong class="text-ochre-500 block">🎯 單張訂單 (單發) 專屬致勝戰術：極短距＋店內等餐拉滿法</strong>
            <p class="text-ink-800 leading-relaxed">
              當只有單張訂單時，嚴格只接 <strong>200m ~ 500m</strong> 極短單！在店家吹冷氣等餐 8 分鐘 ＋ 步行過馬路 8 分鐘 ＋ 交付拍照 2 分鐘 ＝ <strong>單趟合法服務工時拉滿至 18 分鐘（專法保障 NT$ 73.5）</strong>。送完只需 3 分鐘就能走回店門口，一小時跑 2.5 趟，<strong>實質時薪穩拿 NT$ 210~245 純利</strong>！
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ────────────────────────────────────────────────────────── -->
    <!-- 3-B. 🚲 腳踏車外送員實戰指南 -->
    <!-- ────────────────────────────────────────────────────────── -->
    <div v-show="tacticsGuideTab === 'bike'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🚲</span>
          <h4 class="text-sm font-bold text-jade-200">
            腳踏車實戰：如何打破「腿力耗竭魔咒」與悠閒高產值？
          </h4>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-jade-500/20 text-jade-200 text-xs font-bold font-mono border border-jade-500/30">
          腳踏車專屬決策樹
        </span>
      </div>

      <!-- 3 大腳踏車距離與地形陷阱 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-ink-50 p-3 rounded-xl border border-crimson-200/30 space-y-1">
          <span class="text-crimson-500 font-bold flex items-center gap-1 text-[11px]">
            <span>🛑</span> 陷阱 1：長陡坡與山路爬升
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            長陡坡踩踏阻力暴增，時速跌至 6~8km/h，雙腿乳酸急遽堆積導致提早耗竭，回程無單空踩，實質時薪直接腰斬至 <span class="text-crimson-500 font-mono font-bold">$160/時</span>。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-ochre-200/30 space-y-1">
          <span class="text-ochre-500 font-bold flex items-center gap-1 text-[11px]">
            <span>⚠️</span> 陷阱 2：跨區主幹道長單（> 3.0km）
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            大馬路車速快停等紅燈久，超過 3km 易落入機車競爭區且空踩折返體能負擔過重，效率大幅稀釋。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-teal-500/30 space-y-1">
          <span class="text-teal-400 font-bold flex items-center gap-1 text-[11px]">
            <span>🦵</span> 陷阱 3：重踩重齒比與肌肉抽筋耗竭
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            切忌盲目追求速度而重踩大齒盤，長時間低踏頻重踩易引發膝蓋磨損與大腿抽筋，導致後續全天作戰節奏崩潰。
          </p>
        </div>
      </div>

      <!-- 腳踏車距離與單數決策矩陣 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr class="bg-ink-50 text-ink-700 border-b border-ink-200 text-[11px]">
              <th class="p-2.5 font-bold">派單型態</th>
              <th class="p-2.5 font-bold">總里程</th>
              <th class="p-2.5 font-bold">送達環境</th>
              <th class="p-2.5 font-bold text-center">戰力評級</th>
              <th class="p-2.5 font-bold text-right">預估實質時薪</th>
              <th class="p-2.5 font-bold text-jade-200">腳踏車司機實戰處置</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-200 text-xs">
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-crimson-500 flex items-center gap-1"><span>❌</span> 跨區長距單發</td>
              <td class="p-2.5 font-mono text-crimson-500">&gt; 3.2 km</td>
              <td class="p-2.5 text-ink-700">跨橋 / 山坡住宅 / 偏遠死巷</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-crimson-200/20 text-crimson-500 border border-crimson-200/40 text-[10px] font-bold">🚫 超級雷單</span></td>
              <td class="p-2.5 text-right font-mono text-crimson-500 font-bold">$160 ～ $200</td>
              <td class="p-2.5 text-crimson-500 font-bold">果斷轉單 / 拒接！（讓機車去跑）</td>
            </tr>
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>🟡</span> 平路商圈單發</td>
              <td class="p-2.5 font-mono text-ochre-500">1.5 ～ 2.5 km</td>
              <td class="p-2.5 text-ink-700">生活圈大馬路 / 捷運沿線</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 border border-mist-500/40 text-[10px] font-bold">⚡ 標準合格單</span></td>
              <td class="p-2.5 text-right font-mono text-mist-300 font-bold">$280 ～ $330</td>
              <td class="p-2.5 text-mist-300">可以接！（悠閒巡航安全拉長工時）</td>
            </tr>
            <tr class="bg-jade-0/30 text-jade-400 border-jade-500/30">
              <td class="p-2.5 font-bold text-jade-200 flex items-center gap-1"><span>👑</span> 生活圈黃金雙疊/三疊</td>
              <td class="p-2.5 font-mono text-jade-200 font-bold">1.0 ～ 2.5 km</td>
              <td class="p-2.5 text-jade-500">核心商圈 / 順路住宅區</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-jade-500/20 text-jade-200 border border-jade-500/40 text-[10px] font-bold">🌟 SSR 腳踏車黃金單</span></td>
              <td class="p-2.5 text-right font-mono text-jade-200 font-black">NT$ 390 ～ $440+</td>
              <td class="p-2.5 text-jade-200 font-black">秒接！1.75x~2.5x 工時並聯最高性價比 🚀</td>
            </tr>
            <tr class="bg-mist-0/40 text-mist-100 border-mist-500/40">
              <td class="p-2.5 font-bold text-mist-300 flex items-center gap-1"><span>💎</span> 4~5 疊長距工時並聯單</td>
              <td class="p-2.5 font-mono text-mist-300 font-black">4.0 ～ 6.0 km (均單 1.2km)</td>
              <td class="p-2.5 text-mist-50">多餐廳連取 / 生活圈順路連送</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 border border-mist-500/40 text-[10px] font-black">👑 SSR 5疊奇蹟神單</span></td>
              <td class="p-2.5 text-right font-mono text-mist-300 font-black">NT$ 600 ～ $950+</td>
              <td class="p-2.5 text-mist-300 font-black">絕對秒接！4.0x 工時並聯，每公里產值破 $100 🏆</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 腳踏車司機 5 大接單鐵律 -->
      <div class="bg-ink-50/80 p-4 rounded-xl border border-jade-500/30 space-y-3 text-xs">
        <h4 class="text-jade-200 font-bold text-xs sm:text-sm flex items-center gap-1.5">
          <span>💎</span> 腳踏車司機收益最大化：5 大實戰接單鐵律
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-ink-800">
          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-500 block">1. 嚴守「2.5 公里生活圈舒適線」</strong>
            <p class="text-ink-700 leading-relaxed">
              超過 3km 果斷轉單，讓機車去跑，自己專注在 2.5km 內密集生活圈。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-500 block">2. 堅持「平路優先、避開陡坡」原則</strong>
            <p class="text-ink-700 leading-relaxed">
              查看地圖走平緩巷弄，維持 15~18km/h 穩定巡航，保留充沛體能持久作戰。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-mist-300 block">3. 善用「悠閒騎乘拉工時」戰術</strong>
            <p class="text-ink-700 leading-relaxed">
              不需像機車一樣搶快飆速，多花 3 分鐘安全騎乘＝合法多賺 3 分鐘專法保障！
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-mist-300 block">4. 堅持「輕齒比高踏頻與補水策略」</strong>
            <p class="text-ink-700 leading-relaxed">
              變速保持輕齒比維持 70~80rpm 輕鬆踏頻，車架常備電解質水與高熱量補給，避免肌肉過勞與脫水抽筋。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-ochre-500 block">5. 掌握「巷弄穿梭直接靠門取餐」優勢</strong>
            <p class="text-ink-700 leading-relaxed">
              省去機車找車位與移車的 2~4 分鐘，將時間全數轉化為有效服務工時，積少成多。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-jade-0/40 border border-jade-500/40 space-y-1 sm:col-span-2">
            <strong class="text-jade-200 block">🎯 單張訂單 (單發) 專屬致勝戰術：生活圈平路悠閒巡航法 (1.0 ~ 2.0km)</strong>
            <p class="text-ink-800 leading-relaxed">
              沒有疊單時，<strong>嚴格拒接 >2.5km 單發長單</strong>！專注在 1.0~2.0km 生活圈：等餐 6 分鐘 ＋ 維持 15~18km/h 悠閒平穩騎乘 8 分鐘 ＋ 交付 2 分鐘 ＝ <strong>單趟服務時間 16 分鐘（專法保障 NT$ 65.3）</strong>。回程僅 1.5km 騎 4 分鐘即可重返熱區，一小時跑 3 趟，<strong>淨時薪穩守 NT$ 225~250 且體力完全不疲累</strong>！
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ────────────────────────────────────────────────────────── -->
    <!-- 3-C. 🛵 機車外送員實戰指南 -->
    <!-- ────────────────────────────────────────────────────────── -->
    <div v-show="tacticsGuideTab === 'motorcycle'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🛵</span>
          <h4 class="text-sm font-bold text-mist-300">
            機車帳號實戰：如何打破「3 公里魔咒」？
          </h4>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-mist-500/20 text-mist-300 text-xs font-bold font-mono border border-mist-500/30">
          機車專屬決策樹
        </span>
      </div>

      <!-- 3 大距離陷阱圖解 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-ink-50 p-3 rounded-xl border border-crimson-200/30 space-y-1">
          <span class="text-crimson-500 font-bold flex items-center gap-1 text-[11px]">
            <span>🛑</span> 陷阱 1：空車折返零計費
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            專法只保障「送餐中」工時。送完 4.5km 遠單後，騎回熱區的 8 分鐘是 <strong>0 元空窗</strong>，實質時薪直接腰斬至 <span class="text-crimson-500 font-mono font-bold">$160/時</span>。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-ochre-200/30 space-y-1">
          <span class="text-ochre-500 font-bold flex items-center gap-1 text-[11px]">
            <span>⚠️</span> 陷阱 2：單發單無法並聯
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            遠距單若只有 1 單，工時倍率永遠鎖死在 <span class="text-ochre-500 font-mono font-bold">1.0x</span>，無法享受專法「多單時間重疊獨立累加」的倍數紅利。
          </p>
        </div>

        <div class="bg-ink-50 p-3 rounded-xl border border-teal-500/30 space-y-1">
          <span class="text-teal-400 font-bold flex items-center gap-1 text-[11px]">
            <span>⛽</span> 陷阱 3：油耗與磨耗流失
          </span>
          <p class="text-ink-700 text-[11px] leading-relaxed">
            機車每公里實體成本約 <strong>NT$ 1.5～2.0 元</strong>（油錢 + 機油輪胎損耗）。單張遠距單來回 9km 直接吃掉 NT$15+ 純利。
          </p>
        </div>
      </div>

      <!-- 機車帳號距離與單數決策矩陣 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr class="bg-ink-50 text-ink-700 border-b border-ink-200 text-[11px]">
              <th class="p-2.5 font-bold">派單型態</th>
              <th class="p-2.5 font-bold">總里程</th>
              <th class="p-2.5 font-bold">終點環境</th>
              <th class="p-2.5 font-bold text-center">戰力評級</th>
              <th class="p-2.5 font-bold text-right">預估實質時薪</th>
              <th class="p-2.5 font-bold text-jade-500">機車司機實戰處置</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-200 text-xs">
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-crimson-500 flex items-center gap-1"><span>❌</span> 長距單發單</td>
              <td class="p-2.5 font-mono text-crimson-500">3.5 ～ 6.0 km</td>
              <td class="p-2.5 text-ink-700">偏遠住宅區 / 郊區死胡同</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-crimson-200/20 text-crimson-500 border border-crimson-200/40 text-[10px] font-bold">🚫 超級雷單</span></td>
              <td class="p-2.5 text-right font-mono text-crimson-500 font-bold">$150 ～ $180</td>
              <td class="p-2.5 text-crimson-500 font-bold">果斷拒接 / 轉單！（避免產能死鎖）</td>
            </tr>
            <tr class="hover:bg-ink-200/30 text-ink-800">
              <td class="p-2.5 font-bold text-ochre-500 flex items-center gap-1"><span>🟡</span> 雙疊中長距</td>
              <td class="p-2.5 font-mono text-ochre-500">3.0 ～ 4.5 km</td>
              <td class="p-2.5 text-ink-700">鄰近下一個次級商圈/大馬路</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 border border-mist-500/40 text-[10px] font-bold">⚡ 標準合格單</span></td>
              <td class="p-2.5 text-right font-mono text-mist-300 font-bold">$380 ～ $420</td>
              <td class="p-2.5 text-mist-300">可以接！（1.75x 並聯工時覆蓋距離成本）</td>
            </tr>
            <tr class="bg-jade-0/40 text-jade-400 border-jade-500/30">
              <td class="p-2.5 font-bold text-jade-200 flex items-center gap-1"><span>👑</span> 三疊商圈巡航</td>
              <td class="p-2.5 font-mono text-jade-200 font-bold">3.5 ～ 5.5 km</td>
              <td class="p-2.5 text-jade-500">市區主幹道 / 繁華美食圈</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-ochre-200/20 text-ochre-500 border border-ochre-200/40 text-[10px] font-bold">🌟 SSR 黃金單</span></td>
              <td class="p-2.5 text-right font-mono text-jade-200 font-black">NT$ 480 ～ $550+</td>
              <td class="p-2.5 text-jade-200 font-black">秒接！機車高速吞吐最賺模式 🚀</td>
            </tr>
            <tr class="bg-mist-0/40 text-mist-100 border-mist-500/40">
              <td class="p-2.5 font-bold text-mist-300 flex items-center gap-1"><span>💎</span> 4~5 疊跨商圈群單</td>
              <td class="p-2.5 font-mono text-mist-300 font-black">6.0 ～ 8.5 km (均單 1.6km)</td>
              <td class="p-2.5 text-mist-50">主幹道高速串聯 / 次商圈貫穿</td>
              <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded bg-mist-500/20 text-mist-300 border border-mist-500/40 text-[10px] font-black">👑 SSR 高速吞吐群單</span></td>
              <td class="p-2.5 text-right font-mono text-mist-300 font-black">NT$ 700 ～ $900+</td>
              <td class="p-2.5 text-mist-300 font-black">秒接！均單 1.6km 觸發密度豁免，狂拉工時 🏆</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 機車司機 5 大接單鐵律 -->
      <div class="bg-ink-50/80 p-4 rounded-xl border border-mist-500/30 space-y-3 text-xs">
        <h4 class="text-mist-300 font-bold text-xs sm:text-sm flex items-center gap-1.5">
          <span>💎</span> 機車司機收益最大化：5 大實戰接單鐵律
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-ink-800">
          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-500 block">1. 嚴格執行「單發過 3km 必轉」</strong>
            <p class="text-ink-700 leading-relaxed">
              看到單發單超過 3 公里請毫不猶豫拒接或轉單，把寶貴的時間留給商圈內的雙疊或三疊單。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-jade-500 block">2. 善用機車速度優勢「大膽接 4~5km 三疊」</strong>
            <p class="text-ink-700 leading-relaxed">
              機車時速 50km/h 跑 4km 僅需 5 分鐘，搭配三疊單 2.5x 工時並聯，能將小時時薪直接推上 $500+。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-mist-300 block">3. 堅持「終點熱區預判」原則</strong>
            <p class="text-ink-700 leading-relaxed">
              接單前快速看終點地圖：如果終點周圍 500 公尺有其他連鎖餐飲，即可大膽接；若是荒涼斷頭路則需謹慎。
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-mist-300 block">4. 善用「等餐時間槓桿」</strong>
            <p class="text-ink-700 leading-relaxed">
              三疊單在店等餐 6 分鐘＝3 單同時跳表＝累積 18 分鐘法定工時（賺 NT$73.5），等餐不再是浪費時間！
            </p>
          </div>

          <div class="p-3 rounded-lg bg-ink-0/90 border border-ink-200 space-y-1">
            <strong class="text-ochre-500 block">5. 送達前 2 分鐘「無縫預接下一組」</strong>
            <p class="text-ink-700 leading-relaxed">
              在即將送達最後一單前 2 分鐘，若系統彈出下一張訂單立即按下接受，消除任何零工時空窗，讓機車輪子每一分鐘都在賺取法定保底！
            </p>
          </div>

          <div class="p-3 rounded-lg bg-mist-0/40 border border-mist-500/40 space-y-1 sm:col-span-2">
            <strong class="text-mist-300 block">🎯 單張訂單 (單發) 專屬致勝戰術：商圈短巡航＋送達前預接無縫循環 (1.5 ~ 2.8km)</strong>
            <p class="text-ink-800 leading-relaxed">
              單發單切忌「狂飆」與「接 4km+ 遠單」！只接 <strong>1.5~2.8km 商圈單</strong>：等餐 5 分 ＋ 安全巡航 8 分 ＋ 交付 2 分 ＝ <strong>單趟服務時間 15 分鐘（法定保障 NT$ 61.25）</strong>。在即將抵達目的地前 2 分鐘預接下一張商圈單，消滅空車折返死時間，一小時無縫完成 3.5 趟，<strong>扣除油耗後淨時薪穩拿 NT$ 235~260/hr</strong>！
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
`
  };
})(window);
