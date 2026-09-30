/** 三合一社群戰報與權益對帳草稿產生器。 */
(function (root) {
  'use strict';

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const money = (value) => Math.round(number(value)).toLocaleString('zh-TW');
  const hours = (value) => number(value).toFixed(2);
  const percent = (value) => `${number(value).toFixed(1)}%`;
  const durationMins = (trip) => {
    if (trip && trip.duration != null) return Math.max(0, number(trip.duration));
    return Math.max(0, number(trip && trip.durationSec) / 60);
  };
  const calcTrip = (trip, ctx) => {
    const calculator = root.DSC && root.DSC.calc
      ? root.DSC.calc
      : (typeof require === 'function' ? require('./calc.js') : null);
    return calculator ? calculator.calcTrip(trip, ctx) : trip;
  };

  function collect(summary = {}, trips = [], cycleInfo = {}) {
    const list = Array.isArray(trips) ? trips : [];
    const totalOrders = number(summary.totalOrdersCount, list.reduce((sum, trip) => sum + Math.max(1, number(trip.stacks, 1)), 0));
    const stackedTrips = list.filter((trip) => number(trip.stacks, 1) > 1).length;
    const stackRate = list.length ? (stackedTrips / list.length) * 100 : 0;
    const physicalHours = number(summary.totalPhysicalHours, number(summary.totalPhysicalMins) / 60 || list.reduce((sum, trip) => sum + durationMins(trip), 0) / 60);
    const statutoryHours = number(summary.totalStatutoryHours, number(summary.totalStatutoryMins) / 60);
    const basePay = number(summary.totalBasePay, summary.basePay);
    const legal = number(summary.totalLegal, number(summary.targetLegal, statutoryHours * number(summary.effectiveRate, 245)));
    const gap = Math.max(0, number(summary.subsidy, number(summary.gap, legal - basePay)));
    const tipsAndBonuses = number(summary.totalTips) + number(summary.totalIncentives);
    const income = number(summary.totalIncome, basePay + gap + tipsAndBonuses);
    const hourly = physicalHours > 0 ? income / physicalHours : 0;
    const rate = number(summary.effectiveRate, 245);
    const cycleLabel = cycleInfo && cycleInfo.cycleLabel ? cycleInfo.cycleLabel : '本期';

    return { list, totalOrders, stackedTrips, stackRate, physicalHours, statutoryHours, basePay, legal, gap, income, hourly, rate, cycleLabel };
  }

  function generateShortPost(summary, trips, cycleInfo) {
    const s = collect(summary, trips, cycleInfo);
    const text = `📦${s.cycleLabel}外送戰報｜${s.totalOrders}單／${s.list.length}趟，疊單率${percent(s.stackRate)}。法定保底NT$${money(s.legal)}，預估補差額NT$${money(s.gap)}；實跑${hours(s.physicalHours)}h，估算時薪NT$${money(s.hourly)}。#外送員權益 #對帳`;
    // 社群字數限制以 Unicode code point 計，避免 emoji 被當成兩字。
    return Array.from(text).slice(0, 280).join('');
  }

  function generateFullReport(summary, trips, cycleInfo, ctx = {}) {
    const s = collect(summary, trips, cycleInfo);
    const details = s.list.length
      ? s.list.map((trip, index) => {
        const calculated = calcTrip(trip, { ...ctx, rate: ctx.rate || s.rate });
        const mins = durationMins(trip);
        const statutoryMins = number(calculated.statMins);
        const stacks = Math.max(1, number(trip.stacks, 1));
        const legal = number(calculated.legal);
        const pay = number(calculated.basePay);
        return `${String(index + 1).padStart(2, '0')}. ${stacks}單疊單｜服務${mins.toFixed(1)}分（法定${statutoryMins.toFixed(1)}分）｜車資NT$${money(pay)}｜保底NT$${money(legal)}｜差額NT$${money(Math.max(0, calculated.gap))}`;
      }).join('\n')
      : '目前沒有匯入訂單明細。';

    return [
      `🚴‍♀️【${s.cycleLabel} 外送雙週對帳戰報】`,
      '━━━━━━━━━━━━━━',
      `📦 完成訂單：${s.totalOrders} 單（${s.list.length} 趟）｜疊單率：${percent(s.stackRate)}`,
      `⏱️ 實際跑單：${hours(s.physicalHours)} 小時｜法定累計：${hours(s.statutoryHours)} 小時`,
      `💵 平台基本車資：NT$${money(s.basePay)}｜法定最低保底：NT$${money(s.legal)}`,
      `⚖️ 預估應補差額：NT$${money(s.gap)}｜含補差額與獎勵收入：NT$${money(s.income)}`,
      `📈 實跑時薪產值：約 NT$${money(s.hourly)}/時（以總收入 ÷ 實際跑單時數估算）`,
      '━━━━━━━━━━━━━━',
      '🧾 訂單逐筆對帳（法定保底依各趟服務工時與疊單倍率估算）',
      details,
      '',
      '※ 本文為個人試算紀錄，實際認定及結算請以主管機關規定與平台明細為準。',
      '#外送員 #雙週對帳 #勞動權益'
    ].join('\n');
  }

  function generateLaborComplaintDraft(summary, trips, cycleInfo, ctx = {}) {
    const s = collect(summary, trips, cycleInfo);
    const evidence = s.list.map((trip, index) => {
      const calculated = calcTrip(trip, { ...ctx, rate: ctx.rate || s.rate });
      const mins = durationMins(trip);
      const statutoryMins = number(calculated.statMins);
      const stacks = Math.max(1, number(trip.stacks, 1));
      const legal = number(calculated.legal);
      return `${index + 1}. 實際工時${mins.toFixed(1)}分鐘、法定工時${statutoryMins.toFixed(1)}分鐘、${stacks}單；平台基本車資NT$${money(calculated.basePay)}，試算保底NT$${money(legal)}，差額NT$${money(Math.max(0, calculated.gap))}`;
    }).join('\n') || '（請附上逐筆訂單、服務時間與報酬紀錄）';

    return [
      '主旨：請協助查明外送服務報酬及最低保障差額之計算與給付',
      '',
      '受文者：勞動部／相關工會（請依實際受理單位調整）',
      '',
      `本人就 ${s.cycleLabel} 期間之外送服務報酬提出對帳申請。依《外送員權益保障及外送平臺管理法》第 3、5 條規範及每小時 NT$${money(s.rate)}/h 底線進行初步試算（法規名稱、條文及適用範圍，敬請受理單位依現行法令核實）：`,
      `• 實際跑單總工時：${hours(s.physicalHours)} 小時`,
      `• 法定累計服務工時：${hours(s.statutoryHours)} 小時`,
      `• 平台已給付基本車資：NT$${money(s.basePay)}`,
      `• 試算應有法定最低保底：NT$${money(s.legal)}`,
      `• 初估尚應補足差額：NT$${money(s.gap)}`,
      '',
      '逐筆對帳摘要：',
      evidence,
      '',
      '敬請協助確認服務工時認定、疊單計算方式及差額報酬，並告知所需補充文件。隨文可檢附平台訂單截圖、派單／送達時間紀錄、報酬明細、銀行入帳紀錄及本次計算表。以上為本人依現有資料提出之初步試算，請以主管機關調查及適用法令為準。',
      '',
      '申訴人：＿＿＿＿＿＿　聯絡方式：＿＿＿＿＿＿　日期：＿＿＿＿＿＿'
    ].join('\n');
  }

  const api = { generateShortPost, generateFullReport, generateLaborComplaintDraft };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { report: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
