/* 自動由 index.html 拆出：AppHeader。共用狀態由 app.js 以 provide('dsc') 提供。 */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['app-header'] = {
    name: 'AppHeader',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<!-- 頂部導航列與系統狀態 -->
<header class="contour-bg relative overflow-hidden bg-ink-0 border border-ink-200 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3.5">
  <div class="sky-strip" :class="'sky-' + timeOfDay.key" aria-hidden="true"></div>
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center gap-2.5 sm:gap-3">
      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-jade-500 text-ink-0 flex items-center justify-center shrink-0 ring-4 ring-jade-0" aria-hidden="true">
        <svg class="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="22" r="4"/><circle cx="25" cy="22" r="4"/>
          <path d="M12 22h7l3-8h-4"/><path d="M19 22l-3-7H9"/><rect x="5" y="8" width="8" height="7" rx="1"/><path d="M22 14l1.5-4H26"/>
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <h1 class="text-base sm:text-2xl font-bold text-ink-950 tracking-tight leading-tight">
            外送專法與疊單收益精算系統
          </h1>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-jade-0 text-jade-700 border border-jade-500/30 font-mono">v3.0</span>
          <span class="sky-chip" :class="'sky-' + timeOfDay.key" :title="timeOfDay.text">{{ timeOfDay.label }}</span>
        </div>
        <p class="text-[11px] sm:text-xs text-ink-700 mt-0.5 line-clamp-1">智慧雙單疊單工時放大 × 戰力評級 × 秒級精算 × 差額補貼</p>
      </div>
    </div>
  </div>

  <!-- 設定摘要列：點擊展開／收合三項設定 -->
  <button type="button" @click="showSettings = !showSettings" :aria-expanded="showSettings ? 'true' : 'false'" aria-controls="settings-panel"
    class="w-full flex items-center gap-2 bg-ink-50 hover:bg-jade-0 border border-ink-200 rounded-lg px-2.5 py-2 text-left text-[11px] sm:text-xs">
    <span class="shrink-0 text-ink-700"><ico name="settings" class="ico-lg"/></span>
    <span class="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink-0 border border-ink-200 font-mono font-bold text-jade-700">NT$ {{ displayRateText }}/hr</span>
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink-0 border border-ink-200 text-ink-800 truncate max-w-full"><ico name="calendar"/> {{ cycleFilterLabel }}</span>
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink-0 border border-ink-200 text-ink-800 truncate max-w-full"><ico name="clock"/> {{ statutoryModeLabel }}</span>
    </span>
    <span class="shrink-0 text-ink-600 font-medium flex items-center gap-1">
      <span class="hidden sm:inline">{{ showSettings ? '收合' : '設定' }}</span>
      <svg class="w-4 h-4 transition-transform" :class="showSettings ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
    </span>
  </button>

  <!-- 設定面板（預設收合） -->
  <div id="settings-panel" v-show="showSettings" class="flex flex-col gap-2.5">
    <!-- 費率：依訂單日期自動查最低工資表，或自訂 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-ink-0 p-2 sm:p-2.5 rounded-lg border border-ink-200 text-xs">
      <div class="text-ink-700 flex items-center justify-between sm:justify-start gap-1.5">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-jade-500 animate-pulse"></span>
          <span>法定保障時薪：</span>
        </div>
        <span class="text-jade-700 font-mono font-bold">NT$ {{ displayRateText }} / hr</span>
      </div>
      <div class="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar">
        <button type="button" @click="rateMode = 'auto'" :class="rateMode === 'auto' ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-300 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2.5 py-1 rounded-md border transition shrink-0" :title="rateScheduleHint">依日期自動<span class="hidden sm:inline">（最低工資 × 1.25）</span></button>
        <div class="flex items-center gap-1 border-l border-ink-300 pl-2 shrink-0">
          <button type="button" @click="rateMode = 'custom'" :class="rateMode === 'custom' ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-300 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2 py-1 rounded-md border transition">自訂</button>
          <span class="text-[10px] text-ink-600">NT$</span>
          <input type="number" v-model.number="rate" @focus="rateMode = 'custom'" step="0.5" min="0" class="w-16 bg-white border border-ink-300 rounded px-1.5 py-0.5 text-right font-mono text-jade-700 text-xs focus:outline-none focus:border-blue-500">
          <span class="text-[10px] text-ink-600">/ hr</span>
        </div>
      </div>
    </div>

    <!-- 對帳週期篩選：依訂單日期歸入 Uber Eats 雙週週期 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-ink-0 p-2 sm:p-2.5 rounded-lg border border-ink-200 text-xs">
      <div class="text-ink-700 flex items-center gap-1.5">
        <span class="inline-flex items-center gap-1"><ico name="calendar"/>結算週期：</span>
        <span class="text-ink-900 font-medium">{{ cycleFilterLabel }}</span>
      </div>
      <select v-model="cycleFilter" class="bg-white border border-ink-300 rounded-md px-2 py-1 text-[11px] sm:text-xs text-ink-900 focus:outline-none focus:border-blue-500">
        <option value="current">本期（{{ currentCycleInfo.cycleLabel }}）</option>
        <option v-for="c in pastCycleOptions" :key="c.key" :value="c.key">{{ c.label }}（{{ c.count }} 筆）</option>
        <option v-if="cycleGroups.undated > 0" value="undated">未標日期（{{ cycleGroups.undated }} 筆）</option>
        <option value="all">全部訂單（{{ trips.length }} 筆）</option>
      </select>
    </div>

    <!-- 法定工時模式切換 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-ink-0 p-2 sm:p-2.5 rounded-lg border border-ink-200 text-xs">
      <div class="text-ink-700">
        法定工時模式：
        <span class="text-ink-900 font-medium">{{ statutoryModeLabel }}</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button @click="statutoryMode = 'independent'" :class="statutoryMode === 'independent' ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-900 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2.5 py-1 rounded-md border transition">獨立累加（對帳）</button>
        <button @click="statutoryMode = 'table'" :class="statutoryMode === 'table' ? 'bg-ochre-0 text-amber-800 border-ochre-700 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-900 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2.5 py-1 rounded-md border transition">經驗倍率表</button>
      </div>
    </div>
    <p v-if="statutoryMode === 'independent'" class="text-[11px] text-ink-600 px-1 -mt-1">
      本期 {{ exactCount }} / {{ visibleTrips.length }} 趟有逐單起迄時間（精算）；其餘以「整趟 × 疊單數」近似。可在訂單明細的「逐單時間」欄補上。
    </p>

    <!-- 建議文字語氣 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-ink-0 p-2 sm:p-2.5 rounded-lg border border-ink-200 text-xs">
      <div class="text-ink-700">
        建議文字語氣：
        <span class="text-ink-900 font-medium">{{ tone === 'formal' ? '正式（適合分享）' : '輕鬆（跑單口吻）' }}</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button @click="tone = 'casual'" :class="tone === 'casual' ? 'bg-ochre-0 text-amber-800 border-ochre-700 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-900 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2.5 py-1 rounded-md border transition">輕鬆</button>
        <button @click="tone = 'formal'" :class="tone === 'formal' ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-sm' : 'bg-white text-ink-600 border-ink-900 hover:bg-ink-0'" class="text-[11px] sm:text-xs px-2.5 py-1 rounded-md border transition">正式</button>
      </div>
    </div>
  </div>
</header>

<div v-if="storageStatus !== 'ok'" class="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3 border border-red-200">
  ⚠️ 資料未能儲存（{{ storageStatus === 'corrupt' ? '偵測到資料損毀，已停止覆寫以保護原文' : '瀏覽器儲存空間寫入失敗或無痕模式限制' }}）。
  請先 <button @click="exportCSV" class="underline font-bold text-ochre-700">匯出 CSV</button> 進行備份。
</div>

<!-- 主選單分頁切換 -->
<div class="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
  <nav class="flex border-b border-ink-300 gap-1 sm:gap-2 text-xs sm:text-sm font-medium min-w-max">
    <button @click="activeTab = 'dashboard'" :class="activeTab === 'dashboard' ? 'tab-on' : 'tab-off'" class="index-tab">
      <svg class="tab-ico" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="1.5"/><path d="M4 11h16M9 7V5h6v2"/></svg> 結算儀表板
    </button>
    <button @click="activeTab = 'trips'" :class="activeTab === 'trips' ? 'tab-on' : 'tab-off'" class="index-tab">
      <svg class="tab-ico" viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z"/><path d="M9 8h6M9 12h6"/></svg> 訂單明細
      <span v-if="trips.length > 0" class="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-mono">{{ trips.length }}</span>
    </button>
    <button @click="activeTab = 'tactics'" :class="activeTab === 'tactics' ? 'tab-on' : 'tab-off'" class="index-tab">
      <svg class="tab-ico" viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l2-6h-3M14 17l-2-5H7"/></svg> 疊單作戰模擬
    </button>
    <button @click="activeTab = 'analysis'" :class="activeTab === 'analysis' ? 'tab-on' : 'tab-off'" class="index-tab">
      <svg class="tab-ico" viewBox="0 0 24 24"><path d="M2 19l7-10 4 6 3-4 6 8z"/><circle cx="17" cy="6" r="2"/></svg> 時段與戰力分析
    </button>
    <button @click="activeTab = 'rules'" :class="activeTab === 'rules' ? 'tab-on' : 'tab-off'" class="index-tab">
      <svg class="tab-ico" viewBox="0 0 24 24"><path d="M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v12a2 2 0 012-2h6z"/></svg> 專法準則
    </button>
  </nav>
</div>
`
  };
})(window);
