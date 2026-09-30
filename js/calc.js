/**
 * delivery-subsidy-calc - Calculation Module
 * 外送專法與疊單收益精算核心
 * 支援 Node.js 測試 (CommonJS) 與 瀏覽器全域載入 (window.DSC.calc)
 */
(function (root) {
  'use strict';

  // 1. 經驗倍率表
  const stackMultiplierMap = {
    1: 1.00,
    2: 1.75,
    3: 2.50,
    4: 3.25,
    5: 4.00,
    6: 4.75,
    7: 5.50,
    8: 6.25,
    9: 7.00,
    10: 7.75
  };

  const getTableMultiplier = (stacks) => {
    const s = Math.min(10, Math.max(1, Number(stacks) || 1));
    return stackMultiplierMap[s] || (1.0 + (s - 1) * 0.75);
  };

  // 2. 單筆法定分鐘計算
  const getTripStatutoryMins = (trip, mode = 'table') => {
    const dur = Number(trip.duration) || 0;
    const stacks = Math.min(10, Math.max(1, Number(trip.stacks) || 1));
    if (mode === 'independent') {
      return dur * stacks;
    }
    return dur * getTableMultiplier(stacks);
  };

  // 3. 有效費率驗證 (rate 清空或負值自動回退為 245)
  const getEffectiveRate = (rate) => {
    const r = Number(rate);
    return Number.isFinite(r) && r > 0 ? r : 245;
  };

  // 4. 計算單筆訂單結構化結果
  const calcTrip = (trip, ctx = {}) => {
    const mode = ctx.statutoryMode || 'table';
    const rate = getEffectiveRate(ctx.rate);
    const statMins = getTripStatutoryMins(trip, mode);
    const statHours = statMins / 60;
    const legal = statHours * rate;
    const basePay = Number(trip.basePay) || 0;
    const gap = legal - basePay;
    const subsidy = Math.max(0, gap);

    return {
      ...trip,
      statMins,
      statHours,
      legal,
      gap,
      subsidy,
      basePay,
      physicalMins: Number(trip.duration) || 0
    };
  };

  // 5. 計算全單彙總數據
  const calcSummary = (trips, ctx = {}) => {
    const list = Array.isArray(trips) ? trips : [];
    const effectiveRate = getEffectiveRate(ctx.rate);
    const mode = ctx.statutoryMode || 'table';

    let totalPhysicalMins = 0;
    let totalStatutoryMins = 0;
    let totalOrdersCount = 0;
    let totalBasePay = 0;
    let totalTips = 0;
    let totalIncentives = 0;
    let totalDistance = 0;

    for (const trip of list) {
      const dur = Number(trip.duration) || 0;
      const stacks = Math.min(10, Math.max(1, Number(trip.stacks) || 1));
      const bp = Number(trip.basePay) || 0;
      const tips = Number(trip.tips) || 0;
      const inc = Number(trip.incentives) || 0;
      const dist = Number(trip.distance) || 0;

      totalPhysicalMins += dur;
      totalStatutoryMins += getTripStatutoryMins(trip, mode);
      totalOrdersCount += stacks;
      totalBasePay += bp;
      totalTips += tips;
      totalIncentives += inc;
      totalDistance += dist;
    }

    const totalPhysicalHours = totalPhysicalMins / 60;
    const totalStatutoryHours = totalStatutoryMins / 60;
    const totalLegal = totalStatutoryHours * effectiveRate;
    const subsidy = Math.max(0, totalLegal - totalBasePay);
    const totalIncome = totalBasePay + subsidy + totalTips + totalIncentives;

    return {
      totalPhysicalMins,
      totalPhysicalHours,
      totalStatutoryMins,
      totalStatutoryHours,
      totalOrdersCount,
      totalLegal,
      totalBasePay,
      subsidy,
      totalIncome,
      effectiveRate,
      totalTips,
      totalIncentives,
      totalDistance
    };
  };

  const api = {
    getTableMultiplier,
    getTripStatutoryMins,
    getEffectiveRate,
    calcTrip,
    calcSummary
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { calc: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
