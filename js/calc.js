/**
 * 外送專法與疊單收益精算系統 - 核心計算引擎 (Calc Engine)
 * 專算法定外送工時累加、保底最低應得、兩週差額補貼、實質時薪產值與單張戰力評級
 * 支援瀏覽器原生 (window.DeliveryCalc) 與 Node.js (CommonJS) 雙環境
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const config = require('./config.js');
    module.exports = factory(config);
  } else {
    root.DeliveryCalc = factory(root.DeliveryConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (config) {
  'use strict';

  const { stackMultiplierMap, DEFAULT_RATE, vehicleConfigMap } = config;

  /**
   * 取得疊單工時倍率
   * @param {number} stacks - 疊單數 (1 ~ 10)
   * @returns {number} 專法工時倍率 (1單=1.0x, 2疊=1.75x, 3疊=2.50x, 每增1疊+0.75x)
   */
  function getStackMultiplier(stacks) {
    const s = Math.min(10, Math.max(1, Number(stacks) || 1));
    return stackMultiplierMap[s] || (1.0 + (s - 1) * 0.75);
  }

  /**
   * 計算單筆法定累加工時 (分鐘)
   * @param {Object} trip - 訂單物件 (duration, stacks)
   * @returns {number} 法定累加工時分鐘數
   */
  function getTripStatutoryMins(trip) {
    if (!trip) return 0;
    const dur = Number(trip.duration) || 0;
    const multiplier = getStackMultiplier(trip.stacks);
    return dur * multiplier;
  }

  /**
   * 計算單筆或多筆總計指標
   */
  function computeSummary(trips, rateVal, vehicleMode) {
    const list = Array.isArray(trips) ? trips : [];
    const rate = Number(rateVal) || DEFAULT_RATE;
    const mode = vehicleMode || 'motorcycle';
    const vCfg = (vehicleConfigMap && vehicleConfigMap[mode]) || vehicleConfigMap.motorcycle;

    const totalPhysicalMins = list.reduce((sum, t) => sum + (Number(t.duration) || 0), 0);
    const totalPhysicalHours = totalPhysicalMins / 60;

    const totalStatutoryMins = list.reduce((sum, t) => sum + getTripStatutoryMins(t), 0);
    const totalStatutoryHours = totalStatutoryMins / 60;

    const totalOrdersCount = list.reduce((sum, t) => sum + (Number(t.stacks) || 1), 0);

    const totalLegal = totalStatutoryHours * rate;
    const totalBasePay = list.reduce((sum, t) => sum + (Number(t.basePay) || 0), 0);
    const totalBoostFare = list.reduce((sum, t) => sum + (Number(t.boostFare) || 0), 0);
    const totalTips = list.reduce((sum, t) => sum + (Number(t.tips) || 0), 0);
    const totalIncentives = list.reduce((sum, t) => sum + (Number(t.incentives) || 0), 0);
    const totalPoints = list.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const totalDistance = list.reduce((sum, t) => sum + (Number(t.distance) || 0), 0);

    const avgBasePay = list.length > 0 ? (totalBasePay / list.length) : 0;
    const avgDistance = list.length > 0 ? (totalDistance / list.length) : 0;
    const avgBoostRate = totalBasePay > 0 ? ((totalBoostFare / totalBasePay) * 100) : 0;

    // 差額補貼款 ΔR = max(0, Total_legal - R_base)
    const subsidy = Math.max(0, totalLegal - totalBasePay);
    // 兩週實質總收入 (毛額)
    const totalIncome = totalBasePay + subsidy + totalTips + totalIncentives;

    // 載具營運成本與實質落袋淨利
    const totalVehicleCost = totalDistance * vCfg.costPerKm;
    const netTotalIncome = Math.max(0, totalIncome - totalVehicleCost);

    const netHourlyRate = totalPhysicalHours > 0 ? (netTotalIncome / totalPhysicalHours) : 0;
    const perKmIncome = totalDistance > 0 ? (totalIncome / totalDistance) : 0;
    const perKmBase = totalDistance > 0 ? (totalBasePay / totalDistance) : 0;
    const tipPercentage = totalIncome > 0 ? ((totalTips / totalIncome) * 100) : 0;

    const stackingMultiplier = totalPhysicalHours > 0 ? (totalStatutoryHours / totalPhysicalHours) : 1.0;
    const realHourlyRate = stackingMultiplier * rate;

    return {
      totalPhysicalMins,
      totalPhysicalHours,
      totalStatutoryMins,
      totalStatutoryHours,
      totalOrdersCount,
      totalLegal,
      totalBasePay,
      totalBoostFare,
      totalTips,
      totalIncentives,
      totalPoints,
      totalDistance,
      avgBasePay,
      avgDistance,
      avgBoostRate,
      subsidy,
      totalIncome,
      totalVehicleCost,
      netTotalIncome,
      netHourlyRate,
      perKmIncome,
      perKmBase,
      tipPercentage,
      stackingMultiplier,
      realHourlyRate
    };
  }

  /**
   * 單筆戰力等級標籤評定（整合第一原理多疊密度豁免演算法）
   */
  function getTierLabel(trip, vehicleMode, rateVal) {
    if (!trip) return '⚡ 標準單';
    const dur = Number(trip.duration) || 0;
    const dist = Number(trip.distance) || 0;
    const stacks = Math.min(10, Math.max(1, Number(trip.stacks) || 1));
    const mode = vehicleMode || 'motorcycle';
    const r = Number(rateVal) || DEFAULT_RATE;

    const multiplier = getStackMultiplier(stacks);
    const statMins = dur * multiplier;
    const legal = (statMins / 60) * r;
    const kmRate = dist > 0 ? (legal / dist) : 0;
    const avgDistPerStack = dist / stacks;
    const isMultiStack = stacks >= 2;

    if (mode === 'walk') {
      if (isMultiStack && avgDistPerStack <= 0.8) {
        return stacks >= 3 ? '👑 SSR 步行群單神單' : '🌟 SSR 步行黃金疊單';
      }
      if (stacks === 1 && (dist > 1.0 || dur >= 30)) return '🚫 步行超距雷單';
      if (avgDistPerStack > 0.8) return '⚠️ 步行偏遠單';
      if (dist <= 0.8 && dur <= 20) return '🎯 SR 步行短單';
      return '⚡ 標準單';
    } else if (mode === 'bike') {
      if (isMultiStack && avgDistPerStack <= 2.5) {
        return (stacks >= 4 || kmRate >= 80) ? '👑 SSR 5疊奇蹟神單' : '🌟 SSR 腳踏車黃金疊單';
      }
      if (stacks === 1 && (dist >= 3.2 || dur >= 35)) return '🚫 腳踏車超距雷單';
      if (avgDistPerStack > 2.5) return '⚠️ 腳踏車偏遠單';
      if (dist <= 2.5 && dur <= 22) return '🎯 SR 腳踏車單';
      return '⚡ 標準單';
    } else {
      if (isMultiStack && avgDistPerStack <= 3.5) {
        return (stacks >= 4 || kmRate >= 70) ? '👑 SSR 機車高速群單' : '🌟 SSR 機車黃金疊單';
      }
      if (stacks === 1 && (dist >= 3.5 || dur >= 35)) return '🚫 長距單發雷單';
      if (avgDistPerStack > 4.0) return '⚠️ 跨區長距單';
      if (dist <= 3.0 && dur <= 20) return '🎯 SR 商圈快單';
      return '⚡ 標準單';
    }
  }

  function getTierBadgeClass(trip, vehicleMode, rateVal) {
    const label = getTierLabel(trip, vehicleMode, rateVal);
    if (label.includes('SSR')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    if (label.includes('SR')) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    if (label.includes('雷單')) return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    if (label.includes('遠距') || label.includes('偏遠') || label.includes('跨區')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  }

  /**
   * 每單智慧診斷明細計算
   */
  function computeTripInsights(trips, vehicleMode, rateVal) {
    const list = Array.isArray(trips) ? trips : [];
    const mode = vehicleMode || 'motorcycle';
    const rate = Number(rateVal) || DEFAULT_RATE;
    const vCfg = (vehicleConfigMap && vehicleConfigMap[mode]) || vehicleConfigMap.motorcycle;

    return list.map((t, idx) => {
      const dur = Number(t.duration) || 0;
      const dist = Number(t.distance) || 0;
      const stacks = Math.min(10, Math.max(1, Number(t.stacks) || 1));
      const basePay = Number(t.basePay) || 0;
      const multiplier = getStackMultiplier(stacks);
      const statMins = dur * multiplier;
      const legal = (statMins / 60) * rate;
      const subsidy = Math.max(0, legal - basePay);
      const efficiency = dur > 0 ? (statMins / dur) : 1;
      const kmRate = dist > 0 ? (legal / dist) : 0;
      const tripCost = dist * vCfg.costPerKm;
      const netPay = Math.max(0, legal - tripCost);

      const tips = [];
      const warnings = [];

      const avgDistPerStack = stacks > 0 ? (dist / stacks) : dist;
      const isMultiStack = stacks >= 2;
      const isHighDensityStack = isMultiStack && (
        (mode === 'walk' && avgDistPerStack <= 0.8) ||
        (mode === 'bike' && avgDistPerStack <= 2.5) ||
        (mode === 'motorcycle' && avgDistPerStack <= 3.5)
      );

      if (mode === 'walk') {
        if (isHighDensityStack) {
          tips.push({ type: 'stack_god', icon: '🌟', text: `[SSR 步行工時放大] ${stacks} 疊工時並聯！平均每單僅 ${avgDistPerStack.toFixed(2)}km (總距 ${dist.toFixed(1)}km)，每公里產值 NT$${kmRate.toFixed(0)}，免油錢純落袋神單！` });
        } else if (stacks === 1 && dist > 1.0) {
          warnings.push({ type: 'dist_bad', icon: '🚫', text: `單發單超過 ${dist.toFixed(1)}km 嚴重超出步行極限(0.8km)，來回消耗過多體力且無單，果斷拒接！` });
        } else if (dist > 1.2 && avgDistPerStack > 0.8) {
          warnings.push({ type: 'dist_warn', icon: '⚠️', text: `總距離 ${dist.toFixed(1)}km 偏長 (均單 ${avgDistPerStack.toFixed(1)}km)，建議鎖定百貨/夜市 800m 內短單` });
        } else if (dist > 0) {
          tips.push({ type: 'good_dist', icon: '🎯', text: `距離 ${dist.toFixed(1)}km 為步行黃金距離，零油耗 100% 淨賺！` });
        }
      } else if (mode === 'bike') {
        if (isHighDensityStack) {
          tips.push({ type: 'stack_god', icon: '🌟', text: `[SSR 腳踏車工時並聯] ${stacks} 疊工時並聯！平均每單僅 ${avgDistPerStack.toFixed(2)}km (總距 ${dist.toFixed(1)}km)，每公里法定產值 NT$${kmRate.toFixed(0)}，完美吃滿專法工時倍率！` });
        } else if (stacks === 1 && dist > 3.0) {
          warnings.push({ type: 'dist_bad', icon: '🚫', text: `單發單超過 ${dist.toFixed(1)}km 超出腳踏車舒適圈(2.5km)，回程耗時費力，建議轉單` });
        } else if (dist > 3.2 && avgDistPerStack > 2.5) {
          warnings.push({ type: 'dist_warn', icon: '⚠️', text: `總距離 ${dist.toFixed(1)}km 偏遠 (均單 ${avgDistPerStack.toFixed(1)}km)，腳踏車建議鎖定 2.5km 內生活圈` });
        } else if (dist > 0 && stacks >= 2) {
          tips.push({ type: 'good_dist', icon: '🚲', text: `距離 ${dist.toFixed(1)}km 搭配雙疊，慢騎拉工時最佳組合！` });
        }
      } else {
        if (isHighDensityStack && stacks >= 3) {
          tips.push({ type: 'stack_god', icon: '🌟', text: `[SSR 機車高速多疊] ${stacks} 疊工時並聯！平均每單僅 ${avgDistPerStack.toFixed(2)}km (總距 ${dist.toFixed(1)}km)，每公里法定產值 NT$${kmRate.toFixed(0)}，高速吞吐最佳神單！` });
        } else if (stacks === 1 && dist > 3.5) {
          warnings.push({ type: 'dist_bad', icon: '🚫', text: `單發單超過 ${dist.toFixed(1)}km 是標準雷單（回程空車耗油無收入），果斷轉單！` });
        } else if (dist > 6.0 && avgDistPerStack > 3.5) {
          warnings.push({ type: 'dist_bad', icon: '⚠️', text: `總距離 ${dist.toFixed(1)}km 跨區過遠 (均單 ${avgDistPerStack.toFixed(1)}km)，需確認終點是否鄰近下一商圈` });
        } else if (stacks >= 2 && dist <= 5.5) {
          tips.push({ type: 'good_dist', icon: '🚀', text: `機車高速多疊單（${dist.toFixed(1)}km），工時並聯效益極佳！` });
        }
      }

      if (stacks === 1) {
        const gain2 = ((dur * 1.75 / 60) * rate) - legal;
        const gain3 = ((dur * 2.50 / 60) * rate) - legal;
        warnings.push({ type: 'stack', icon: '⚡', text: `單發單，若升級為雙疊可多賺 NT$${Math.round(gain2)}，三疊可多賺 NT$${Math.round(gain3)}` });
      }

      if (dist > 0 && kmRate >= 80 && !tips.some(t => t.type === 'stack_god')) {
        tips.push({ type: 'km_good', icon: '💎', text: `每公里法定產值 NT$${kmRate.toFixed(0)}，超高效率！` });
      }

      let grade = 'C';
      let gradeColor = 'text-slate-400';
      if (mode === 'walk') {
        if (isHighDensityStack || (stacks >= 2 && dist <= 0.8)) { grade = 'SSR'; gradeColor = 'text-yellow-300'; }
        else if (dist <= 0.8) { grade = 'A'; gradeColor = 'text-emerald-400'; }
        else if (dist <= 1.2 || avgDistPerStack <= 1.0) { grade = 'B'; gradeColor = 'text-cyan-400'; }
        else { grade = 'D'; gradeColor = 'text-rose-400'; }
      } else if (mode === 'bike') {
        if (isHighDensityStack && (stacks >= 3 || kmRate >= 70)) { grade = 'SSR'; gradeColor = 'text-yellow-300'; }
        else if (isHighDensityStack || (stacks >= 2 && dist <= 2.5)) { grade = 'SSR'; gradeColor = 'text-yellow-300'; }
        else if (dist <= 2.5 || avgDistPerStack <= 2.0) { grade = 'A'; gradeColor = 'text-emerald-400'; }
        else if (dist <= 3.2 || avgDistPerStack <= 2.8) { grade = 'B'; gradeColor = 'text-cyan-400'; }
        else { grade = 'D'; gradeColor = 'text-rose-400'; }
      } else {
        if ((isHighDensityStack && stacks >= 3) || (stacks >= 3 && dist <= 5.5) || (stacks >= 2 && dist <= 3.0)) { grade = 'SSR'; gradeColor = 'text-yellow-300'; }
        else if (isHighDensityStack || (stacks >= 2 && dist <= 5.5)) { grade = 'A'; gradeColor = 'text-emerald-400'; }
        else if (dist <= 3.5 || avgDistPerStack <= 3.0) { grade = 'B'; gradeColor = 'text-cyan-400'; }
        else { grade = 'D'; gradeColor = 'text-rose-400'; }
      }

      return {
        idx,
        t,
        dur,
        dist,
        stacks,
        basePay,
        statMins,
        legal,
        subsidy,
        efficiency,
        kmRate,
        tripCost,
        netPay,
        tips,
        warnings,
        grade,
        gradeColor
      };
    });
  }

  /**
   * 全域戰略建議
   */
  function computeGlobalInsights(trips, vehicleMode, totalVehicleCost, netHourlyRate) {
    const list = Array.isArray(trips) ? trips : [];
    if (!list.length) return [];
    const mode = vehicleMode || 'motorcycle';
    const vCfg = (vehicleConfigMap && vehicleConfigMap[mode]) || vehicleConfigMap.motorcycle;
    const insights = computeTripInsights(list, mode, DEFAULT_RATE);
    const results = [];

    const totalCount = insights.length;
    const singleCount = insights.filter(i => i.stacks === 1).length;
    const farCount = insights.filter(i => i.dist > vCfg.maxDist && i.stacks === 1).length;
    const redCount = insights.filter(i => i.dist > vCfg.redDist && (i.dist / i.stacks) > vCfg.maxDist).length;
    const singleRatio = singleCount / totalCount;
    const avgEff = insights.reduce((s, i) => s + i.efficiency, 0) / totalCount;

    if (mode === 'walk') {
      results.push({ level: 'info', icon: '🚶', title: '目前為【步行外送模式】', desc: '最佳半徑 ≤ 800m。本週期載具成本 NT$0 元，所有保底收入 100% 轉為純利。' });
      if (redCount > 0) {
        results.push({ level: 'danger', icon: '🚨', title: `${redCount} 張超出步行極限（>1.2km）`, desc: '步行超過 1.2km 耗時過長且空車回程體力負擔沉重，建議嚴格設定 800m 內短單。' });
      }
    } else if (mode === 'bike') {
      results.push({ level: 'info', icon: '🚲', title: '目前為【腳踏車模式】', desc: `最佳半徑 1.0~2.5km。預估週期營運成本約 NT$${Math.round(totalVehicleCost || 0)} 元。` });
      if (farCount > 0) {
        results.push({ level: 'warning', icon: '⚠️', title: `${farCount} 張訂單超出 2.5km`, desc: '腳踏車超過 2.5km 會降低每小時雙疊率，建議專注 2.5km 內生活圈。' });
      }
    } else {
      results.push({ level: 'info', icon: '🛵', title: '目前為【機車外送模式】', desc: `時速 40~50km/h。預估週期油耗車損成本約 NT$${Math.round(totalVehicleCost || 0)} 元（每公里 NT$1.5）。` });
      if (singleCount > 0 && insights.some(i => i.stacks === 1 && i.dist > 3.0)) {
        results.push({ level: 'danger', icon: '🚫', title: '偵測到長距單發雷單！', desc: '機車單發單超過 3km 會因為空車折返導致時薪跌破 $180，務必果斷拒接/轉單！' });
      }
    }

    if (singleRatio > 0.5) {
      results.push({ level: 'danger', icon: '🚨', title: '單發單比例過高', desc: `本週期 ${singleCount}/${totalCount} 張為單發單（${Math.round(singleRatio*100)}%），壓低整體時薪。建議優先等待疊單。` });
    }

    if (avgEff >= 1.8) {
      results.push({ level: 'success', icon: '🏆', title: '整體疊單效率優秀', desc: `平均工時放大倍數 ${avgEff.toFixed(2)}x，實質淨時薪達 NT$${(netHourlyRate || 0).toFixed(1)}/時！` });
    }

    return results;
  }

  /**
   * 戰力等級分佈統計
   */
  function computeTierStats(trips, vehicleMode, rateVal) {
    const list = Array.isArray(trips) ? trips : [];
    let ssr = 0, sr = 0, normal = 0, warning = 0;
    for (let t of list) {
      const l = getTierLabel(t, vehicleMode, rateVal);
      if (l.includes('SSR')) ssr++;
      else if (l.includes('SR')) sr++;
      else if (l.includes('雷單') || l.includes('遠距') || l.includes('偏遠') || l.includes('跨區')) warning++;
      else normal++;
    }
    return { ssr, sr, normal, warning };
  }

  return {
    getStackMultiplier,
    getTripStatutoryMins,
    computeSummary,
    getTierLabel,
    getTierBadgeClass,
    computeTripInsights,
    computeGlobalInsights,
    computeTierStats
  };
});
