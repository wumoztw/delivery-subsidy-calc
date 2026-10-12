/**
 * 外送專法與疊單收益精算系統 - 核心計算引擎 (Calc Engine)
 *
 * 網頁（js/app.js）與測試都只透過這個模組計算，確保「畫面上的數字」就是「測試保護的數字」。
 *
 * 共用選項 opts：
 *   - statutoryMode: 'table'（經驗倍率表，預設）| 'independent'（服務時間 × 疊單數）
 *   - rateMode:      'custom'（用 opts.rate，預設）| 'auto'（依每筆訂單日期查最低工資表 × 1.25）
 *   - rate:          自訂保障時薪；清空或非正數時回退 DEFAULT_RATE
 *   - vehicleMode:   'motorcycle'（預設）| 'bike' | 'walk'
 *   - now:           auto 模式下，沒有日期的訂單使用的日期（預設今天）
 *
 * 支援瀏覽器原生 (window.DeliveryCalc / window.DSC.calc) 與 Node.js (CommonJS) 雙環境。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    if (!root.DeliveryConfig) throw new Error('calc.js 需要先載入 config.js');
    root.DeliveryCalc = factory(root.DeliveryConfig);
    root.DSC = Object.assign(root.DSC || {}, { calc: root.DeliveryCalc });
  }
})(typeof self !== 'undefined' ? self : this, function (config) {
  'use strict';

  const { stackMultiplierMap, DEFAULT_RATE, vehicleConfigMap, getStatutoryRateForDate } = config;

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const clampStacks = (stacks) => Math.min(10, Math.max(1, Math.round(num(stacks)) || 1));

  /** 正規化選項；相容舊呼叫法 fn(trips, rate, vehicleMode)。 */
  function normalizeOpts(options, legacyVehicle) {
    const opts = options !== null && typeof options === 'object' ? options : { rate: options };
    return {
      rate: opts.rate,
      rateMode: opts.rateMode === 'auto' ? 'auto' : 'custom',
      statutoryMode: opts.statutoryMode === 'independent' ? 'independent' : 'table',
      vehicleMode: opts.vehicleMode || legacyVehicle || 'motorcycle',
      now: opts.now
    };
  }

  function getVehicleConfig(mode) {
    return vehicleConfigMap[mode] || vehicleConfigMap.motorcycle;
  }

  function getEffectiveRate(rate) {
    const r = Number(rate);
    return Number.isFinite(r) && r > 0 ? r : DEFAULT_RATE;
  }

  /** 經驗倍率表：1 單 1.00x、2 疊 1.75x、3 疊 2.50x，之後每多 1 疊 +0.75x。 */
  function getTableMultiplier(stacks) {
    const s = clampStacks(stacks);
    return stackMultiplierMap[s] || (1.0 + (s - 1) * 0.75);
  }

  /** 依法定工時模式取得倍率。independent = 疊單數本身。 */
  function getStackMultiplier(stacks, statutoryMode) {
    const s = clampStacks(stacks);
    return statutoryMode === 'independent' ? s : getTableMultiplier(s);
  }

  /** 某筆訂單適用的保障時薪。 */
  function getTripRate(trip, options) {
    const opts = normalizeOpts(options);
    if (opts.rateMode === 'auto') {
      const date = trip && trip.date ? trip.date : (opts.now || new Date());
      return getStatutoryRateForDate(date);
    }
    return getEffectiveRate(opts.rate);
  }

  function getTripStatutoryMins(trip, options) {
    if (!trip) return 0;
    const opts = normalizeOpts(options);
    return num(trip.duration) * getStackMultiplier(trip.stacks, opts.statutoryMode);
  }

  /** 單筆法定工時、保底與差額。 */
  function calcTrip(trip, options) {
    if (!trip) return { statMins: 0, legal: 0, basePay: 0, physicalMins: 0, subsidy: 0, gap: 0, rate: 0, multiplier: 1 };
    const opts = normalizeOpts(options);
    const rate = getTripRate(trip, opts);
    const physicalMins = Math.max(0, num(trip.duration));
    const multiplier = getStackMultiplier(trip.stacks, opts.statutoryMode);
    const statMins = physicalMins * multiplier;
    const legal = (statMins / 60) * rate;
    const basePay = num(trip.basePay);
    const subsidy = Math.max(0, legal - basePay);
    return { statMins, legal, basePay, physicalMins, subsidy, gap: subsidy, rate, multiplier };
  }

  /** 整期彙總：法定工時、保底、差額、收入、載具成本與各種效率指標。 */
  function calcSummary(trips, options, legacyVehicle) {
    const opts = normalizeOpts(options, legacyVehicle);
    const list = Array.isArray(trips) ? trips : [];
    const vCfg = getVehicleConfig(opts.vehicleMode);

    let totalPhysicalMins = 0;
    let totalStatutoryMins = 0;
    let totalOrdersCount = 0;
    let totalLegal = 0;
    let totalBasePay = 0;
    let totalBoostFare = 0;
    let totalTips = 0;
    let totalIncentives = 0;
    let totalPoints = 0;
    let totalDistance = 0;
    const ratesUsed = new Set();

    for (const t of list) {
      const c = calcTrip(t, opts);
      totalPhysicalMins += c.physicalMins;
      totalStatutoryMins += c.statMins;
      totalOrdersCount += clampStacks(t.stacks);
      totalLegal += c.legal;
      totalBasePay += c.basePay;
      totalBoostFare += num(t.boostFare);
      totalTips += num(t.tips);
      totalIncentives += num(t.incentives);
      totalPoints += num(t.points);
      totalDistance += num(t.distance);
      ratesUsed.add(c.rate);
    }

    const totalPhysicalHours = totalPhysicalMins / 60;
    const totalStatutoryHours = totalStatutoryMins / 60;
    // 有效費率：跨年混到兩種費率時取加權平均，單一費率時即該費率
    const effectiveRate = totalStatutoryHours > 0
      ? totalLegal / totalStatutoryHours
      : getTripRate(null, opts);

    const subsidy = Math.max(0, totalLegal - totalBasePay);
    const totalIncome = totalBasePay + subsidy + totalTips + totalIncentives;
    const totalVehicleCost = totalDistance * vCfg.costPerKm;
    const netTotalIncome = Math.max(0, totalIncome - totalVehicleCost);
    const stackingMultiplier = totalPhysicalHours > 0 ? totalStatutoryHours / totalPhysicalHours : 1.0;

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
      avgBasePay: list.length ? totalBasePay / list.length : 0,
      avgDistance: list.length ? totalDistance / list.length : 0,
      avgBoostRate: totalBasePay > 0 ? (totalBoostFare / totalBasePay) * 100 : 0,
      subsidy,
      totalIncome,
      totalVehicleCost,
      netTotalIncome,
      netHourlyRate: totalPhysicalHours > 0 ? netTotalIncome / totalPhysicalHours : 0,
      perKmIncome: totalDistance > 0 ? totalIncome / totalDistance : 0,
      perKmBase: totalDistance > 0 ? totalBasePay / totalDistance : 0,
      tipPercentage: totalIncome > 0 ? (totalTips / totalIncome) * 100 : 0,
      stackingMultiplier,
      realHourlyRate: stackingMultiplier * effectiveRate,
      effectiveRate,
      mixedRates: ratesUsed.size > 1,
      ratesUsed: [...ratesUsed].sort((a, b) => a - b)
    };
  }

  // 舊名稱保留（等同 calcSummary）
  const computeSummary = calcSummary;

  /** 單筆戰力等級標籤（含多疊密度豁免）。 */
  function getTierLabel(trip, options, legacyRate) {
    if (!trip) return '⚡ 標準單';
    const opts = typeof options === 'string'
      ? normalizeOpts({ rate: legacyRate, vehicleMode: options })
      : normalizeOpts(options);
    const dur = num(trip.duration);
    const dist = num(trip.distance);
    const stacks = clampStacks(trip.stacks);
    const { legal } = calcTrip(trip, opts);
    const kmRate = dist > 0 ? legal / dist : 0;
    const avgDistPerStack = dist / stacks;
    const isMultiStack = stacks >= 2;
    const mode = opts.vehicleMode;

    if (mode === 'walk') {
      if (isMultiStack && avgDistPerStack <= 0.8) return stacks >= 3 ? '👑 SSR 步行群單神單' : '🌟 SSR 步行黃金疊單';
      if (stacks === 1 && (dist > 1.0 || dur >= 30)) return '🚫 步行超距雷單';
      if (avgDistPerStack > 0.8) return '⚠️ 步行偏遠單';
      if (dist <= 0.8 && dur <= 20) return '🎯 SR 步行短單';
      return '⚡ 標準單';
    }
    if (mode === 'bike') {
      if (isMultiStack && avgDistPerStack <= 2.5) return (stacks >= 4 || kmRate >= 80) ? '👑 SSR 5疊奇蹟神單' : '🌟 SSR 腳踏車黃金疊單';
      if (stacks === 1 && (dist >= 3.2 || dur >= 35)) return '🚫 腳踏車超距雷單';
      if (avgDistPerStack > 2.5) return '⚠️ 腳踏車偏遠單';
      if (dist <= 2.5 && dur <= 22) return '🎯 SR 腳踏車單';
      return '⚡ 標準單';
    }
    if (isMultiStack && avgDistPerStack <= 3.5) return (stacks >= 4 || kmRate >= 70) ? '👑 SSR 機車高速群單' : '🌟 SSR 機車黃金疊單';
    if (stacks === 1 && (dist >= 3.5 || dur >= 35)) return '🚫 長距單發雷單';
    if (avgDistPerStack > 4.0) return '⚠️ 跨區長距單';
    if (dist <= 3.0 && dur <= 20) return '🎯 SR 商圈快單';
    return '⚡ 標準單';
  }

  function isWarningLabel(label) {
    return label.includes('雷單') || label.includes('遠距') || label.includes('偏遠') || label.includes('跨區');
  }

  function getTierBadgeClass(trip, options, legacyRate) {
    const label = getTierLabel(trip, options, legacyRate);
    if (label.includes('SSR')) return 'bg-ochre-200/20 text-ochre-500 border border-ochre-200/40';
    if (label.includes('SR')) return 'bg-jade-500/20 text-jade-200 border border-jade-500/40';
    if (label.includes('雷單')) return 'bg-crimson-200/20 text-crimson-500 border border-crimson-200/40';
    if (isWarningLabel(label)) return 'bg-ochre-200/10 text-ochre-500 border border-ochre-200/20';
    return 'bg-ink-200 text-ink-800 border border-ink-300';
  }

  /** 每單智慧診斷（依載具與多疊密度）。 */
  function computeTripInsights(trips, options, legacyRate) {
    const list = Array.isArray(trips) ? trips : [];
    const opts = typeof options === 'string'
      ? normalizeOpts({ rate: legacyRate, vehicleMode: options })
      : normalizeOpts(options);
    const mode = opts.vehicleMode;
    const vCfg = getVehicleConfig(mode);

    return list.map((t, idx) => {
      const dur = num(t.duration);
      const dist = num(t.distance);
      const stacks = clampStacks(t.stacks);
      const c = calcTrip(t, opts);
      const { statMins, legal, basePay, subsidy, rate } = c;
      const efficiency = dur > 0 ? statMins / dur : 1;
      const kmRate = dist > 0 ? legal / dist : 0;
      const tripCost = dist * vCfg.costPerKm;
      const netPay = Math.max(0, legal - tripCost);
      const tips = [];
      const warnings = [];

      const avgDistPerStack = dist / stacks;
      const isMultiStack = stacks >= 2;
      const isHighDensityStack = isMultiStack && (
        (mode === 'walk' && avgDistPerStack <= 0.8) ||
        (mode === 'bike' && avgDistPerStack <= 2.5) ||
        (mode !== 'walk' && mode !== 'bike' && avgDistPerStack <= 3.5)
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
        if (isHighDensityStack) {
          tips.push({ type: 'stack_god', icon: '🌟', text: `[SSR 機車高速多疊] ${stacks} 疊工時並聯！平均每單僅 ${avgDistPerStack.toFixed(2)}km (總距 ${dist.toFixed(1)}km)，每公里法定產值 NT$${kmRate.toFixed(0)}，高速吞吐最佳神單！` });
        } else if (stacks === 1 && dist > 3.5) {
          warnings.push({ type: 'dist_bad', icon: '🚫', text: `單發單超過 ${dist.toFixed(1)}km 是標準雷單（回程空車耗油無收入），果斷轉單！` });
        } else if (dist > 6.0 && avgDistPerStack > 3.5) {
          warnings.push({ type: 'dist_bad', icon: '⚠️', text: `總距離 ${dist.toFixed(1)}km 跨區過遠 (均單 ${avgDistPerStack.toFixed(1)}km)，需確認終點是否鄰近下一商圈` });
        } else if (stacks >= 2 && dist <= 5.5) {
          tips.push({ type: 'good_dist', icon: '🚀', text: `機車高速多疊單（${dist.toFixed(1)}km），工時並聯效益極佳！` });
        }
      }

      // 疊單升級潛力：用目前模式的倍率試算
      if (stacks === 1) {
        const gain2 = (dur * getStackMultiplier(2, opts.statutoryMode) / 60) * rate - legal;
        const gain3 = (dur * getStackMultiplier(3, opts.statutoryMode) / 60) * rate - legal;
        warnings.push({ type: 'stack', icon: '⚡', text: `單發單，若升級為雙疊可多賺 NT$${Math.round(gain2)}，三疊可多賺 NT$${Math.round(gain3)}` });
      }

      if (dist > 0 && kmRate >= 80 && !tips.some((x) => x.type === 'stack_god')) {
        tips.push({ type: 'km_good', icon: '💎', text: `每公里法定產值 NT$${kmRate.toFixed(0)}，超高效率！` });
      }

      let grade = 'C';
      let gradeColor = 'text-ink-700';
      const SSR = () => { grade = 'SSR'; gradeColor = 'text-yellow-300'; };
      const A = () => { grade = 'A'; gradeColor = 'text-jade-500'; };
      const B = () => { grade = 'B'; gradeColor = 'text-mist-400'; };
      const D = () => { grade = 'D'; gradeColor = 'text-crimson-500'; };
      if (mode === 'walk') {
        if (isHighDensityStack || (stacks >= 2 && dist <= 0.8)) SSR();
        else if (dist <= 0.8) A();
        else if (dist <= 1.2 || avgDistPerStack <= 1.0) B();
        else D();
      } else if (mode === 'bike') {
        if (isHighDensityStack || (stacks >= 2 && dist <= 2.5)) SSR();
        else if (dist <= 2.5 || avgDistPerStack <= 2.0) A();
        else if (dist <= 3.2 || avgDistPerStack <= 2.8) B();
        else D();
      } else {
        if (isHighDensityStack || (stacks >= 3 && dist <= 5.5) || (stacks >= 2 && dist <= 3.0)) SSR();
        else if (stacks >= 2 && dist <= 5.5) A();
        else if (dist <= 3.5 || avgDistPerStack <= 3.0) B();
        else D();
      }

      return { idx, t, dur, dist, stacks, basePay, statMins, legal, subsidy, rate, efficiency, kmRate, tripCost, netPay, tips, warnings, grade, gradeColor };
    });
  }

  /** 整體週期戰略建議。summary 可傳入已算好的 calcSummary 結果以免重算。 */
  function computeGlobalInsights(trips, options, summaryOrCost, legacyNetHourly) {
    const list = Array.isArray(trips) ? trips : [];
    if (!list.length) return [];
    const opts = typeof options === 'string' ? normalizeOpts({ vehicleMode: options }) : normalizeOpts(options);
    const summary = summaryOrCost && typeof summaryOrCost === 'object'
      ? summaryOrCost
      : Object.assign(calcSummary(list, opts), typeof summaryOrCost === 'number'
        ? { totalVehicleCost: summaryOrCost, netHourlyRate: num(legacyNetHourly) }
        : {});
    const mode = opts.vehicleMode;
    const vCfg = getVehicleConfig(mode);
    const insights = computeTripInsights(list, opts);
    const results = [];

    const totalCount = insights.length;
    const singleCount = insights.filter((i) => i.stacks === 1).length;
    const farCount = insights.filter((i) => i.dist > vCfg.maxDist && i.stacks === 1).length;
    const redCount = insights.filter((i) => i.dist > vCfg.redDist && (i.dist / i.stacks) > vCfg.maxDist).length;
    const singleRatio = singleCount / totalCount;
    const avgEff = insights.reduce((s, i) => s + i.efficiency, 0) / totalCount;
    const cost = Math.round(num(summary.totalVehicleCost));

    if (mode === 'walk') {
      results.push({ level: 'info', icon: '🚶', title: '目前為【步行外送模式】', desc: '最佳半徑 ≤ 800m。本週期載具成本 NT$0 元，所有保底收入 100% 轉為純利。' });
      if (redCount > 0) results.push({ level: 'danger', icon: '🚨', title: `${redCount} 張超出步行極限（>1.2km）`, desc: '步行超過 1.2km 耗時過長且空車回程體力負擔沉重，建議嚴格設定 800m 內短單。' });
    } else if (mode === 'bike') {
      results.push({ level: 'info', icon: '🚲', title: '目前為【腳踏車模式】', desc: `最佳半徑 1.0~2.5km。預估週期營運成本約 NT$${cost} 元。` });
      if (farCount > 0) results.push({ level: 'warning', icon: '⚠️', title: `${farCount} 張訂單超出 2.5km`, desc: '腳踏車超過 2.5km 會降低每小時雙疊率，建議專注 2.5km 內生活圈。' });
    } else {
      results.push({ level: 'info', icon: '🛵', title: '目前為【機車外送模式】', desc: `時速 40~50km/h。預估週期油耗車損成本約 NT$${cost} 元（每公里 NT$${vCfg.costPerKm}）。` });
      if (insights.some((i) => i.stacks === 1 && i.dist > 3.0)) {
        results.push({ level: 'danger', icon: '🚫', title: '偵測到長距單發雷單！', desc: '機車單發單超過 3km 會因為空車折返導致時薪下滑，務必果斷拒接/轉單！' });
      }
    }

    if (singleRatio > 0.5) {
      results.push({ level: 'danger', icon: '🚨', title: '單發單比例過高', desc: `本週期 ${singleCount}/${totalCount} 張為單發單（${Math.round(singleRatio * 100)}%），壓低整體時薪。建議優先等待疊單。` });
    }
    if (avgEff >= 1.8) {
      results.push({ level: 'success', icon: '🏆', title: '整體疊單效率優秀', desc: `平均工時放大倍數 ${avgEff.toFixed(2)}x，實質淨時薪達 NT$${num(summary.netHourlyRate).toFixed(1)}/時！` });
    }
    return results;
  }

  function computeTierStats(trips, options, legacyRate) {
    const list = Array.isArray(trips) ? trips : [];
    let ssr = 0, sr = 0, normal = 0, warning = 0;
    for (const t of list) {
      const l = getTierLabel(t, options, legacyRate);
      if (l.includes('SSR')) ssr++;
      else if (l.includes('SR')) sr++;
      else if (isWarningLabel(l)) warning++;
      else normal++;
    }
    return { ssr, sr, normal, warning };
  }

  /**
   * 跑單時薪模擬：以「一批」為單位推算每小時與整期收入。
   * 法定工時沿用與主計算器相同的 calcTrip（服務時間 × 疊單倍率，跟著 statutoryMode / 費率走）。
   *
   * params:
   *   stacks           每批疊單數
   *   avgServiceMins   每單平均服務時間（不可超過 physicalMins）
   *   physicalMins     一批從出發到全部送達的實際耗時
   *   idleMins         批與批之間的空檔（等派單、空車回商圈）
   *   distanceKm       一批總里程（計算載具成本）
   *   basePayPerOrder  每單平台基本車資；tipsPerOrder 每單平均小費＋獎勵
   *   hoursPerDay / daysPerCycle  整期推估（預設 6 小時 × 12 天）
   *   date             試算日期（auto 費率用）
   */
  function simulateSession(params, options) {
    const opts = normalizeOpts(options);
    const p = params || {};
    const vCfg = getVehicleConfig(opts.vehicleMode);
    const stacks = clampStacks(p.stacks);
    const physicalMins = Math.max(1, num(p.physicalMins));
    const rawService = Math.max(0, num(p.avgServiceMins));
    const avgServiceMins = Math.min(rawService, physicalMins);
    const idleMins = Math.max(0, num(p.idleMins));
    const distanceKm = Math.max(0, num(p.distanceKm));
    const hoursPerDay = Math.max(0, p.hoursPerDay == null ? 6 : num(p.hoursPerDay));
    const daysPerCycle = Math.max(0, p.daysPerCycle == null ? 12 : num(p.daysPerCycle));

    const warnings = [];
    if (rawService > physicalMins) {
      warnings.push(`每單服務時間（${rawService} 分）不可能超過整批實際耗時（${physicalMins} 分），已以 ${physicalMins} 分計算。`);
    }

    // 以平均服務時間 × 疊單倍率計算一批的法定工時（與主計算器同一套）
    const batch = calcTrip({ duration: avgServiceMins, stacks, basePay: num(p.basePayPerOrder) * stacks, date: p.date }, opts);
    const basePay = batch.basePay;
    const tips = num(p.tipsPerOrder) * stacks;
    const payout = Math.max(batch.legal, basePay); // 平台車資與保底取高者
    const subsidy = Math.max(0, batch.legal - basePay);
    const cost = distanceKm * vCfg.costPerKm;
    const cycleMins = physicalMins + idleMins;
    const batchesPerHour = 60 / cycleMins;

    const perHour = {
      legal: batch.legal * batchesPerHour,
      basePay: basePay * batchesPerHour,
      subsidy: subsidy * batchesPerHour,
      tips: tips * batchesPerHour,
      gross: (payout + tips) * batchesPerHour,
      cost: cost * batchesPerHour,
      net: (payout + tips - cost) * batchesPerHour
    };

    const cycleHours = hoursPerDay * daysPerCycle;
    // 整期補差額依專法以「整期合計」計算；同一情境重複時與逐批加總相同
    const perCycle = {
      hours: cycleHours,
      batches: batchesPerHour * cycleHours,
      orders: batchesPerHour * cycleHours * stacks,
      legal: perHour.legal * cycleHours,
      basePay: perHour.basePay * cycleHours,
      subsidy: perHour.subsidy * cycleHours,
      tips: perHour.tips * cycleHours,
      cost: perHour.cost * cycleHours,
      net: perHour.net * cycleHours
    };

    return {
      stacks,
      avgServiceMins,
      physicalMins,
      idleMins,
      cycleMins,
      batchesPerHour,
      rate: batch.rate,
      multiplier: batch.multiplier,
      statMinsPerBatch: batch.statMins,
      // 法定工時 ÷ 實際耗時（不含空檔）與 ÷ 總時間（含空檔）
      leverageOnRoad: batch.statMins / physicalMins,
      leverageOverall: batch.statMins / cycleMins,
      legalPerBatch: batch.legal,
      basePayPerBatch: basePay,
      subsidyPerBatch: subsidy,
      payoutPerBatch: payout,
      tipsPerBatch: tips,
      costPerBatch: cost,
      perHour,
      perCycle,
      warnings
    };
  }

  return {
    simulateSession,
    normalizeOpts,
    getVehicleConfig,
    getEffectiveRate,
    getTableMultiplier,
    getStackMultiplier,
    getTripRate,
    getTripStatutoryMins,
    calcTrip,
    calcSummary,
    computeSummary,
    getTierLabel,
    getTierBadgeClass,
    computeTripInsights,
    computeGlobalInsights,
    computeTierStats
  };
});
