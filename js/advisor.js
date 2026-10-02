/**
 * 外送專法與疊單收益精算系統 - 智能接單戰術決策引擎 (Tactics Advisor)
 * 即時評估即時派單是否符合「黃金標準」或踩中「拒接紅線」，輸出紅綠燈戰術燈號與時薪產值預測
 * 支援瀏覽器原生 (window.DeliveryAdvisor) 與 Node.js (CommonJS) 雙環境
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const config = require('./config.js');
    const calc = require('./calc.js');
    module.exports = factory(config, calc);
  } else {
    root.DeliveryAdvisor = factory(root.DeliveryConfig, root.DeliveryCalc);
  }
})(typeof self !== 'undefined' ? self : this, function (config, calc) {
  'use strict';

  const { vehicleConfigMap, DEFAULT_RATE } = config;
  const { getStackMultiplier } = calc;

  /**
   * 評估即時訂單作戰指標
   * @param {Object} params
   * @param {string} params.vehicleMode - 載具模式: 'motorcycle' | 'bike' | 'walk'
   * @param {number} params.stacks - 疊單數 (1, 2, 3...)
   * @param {number} params.distanceKm - 預估總里程 (公里)
   * @param {number} params.tripMins - 預估總耗時 (分鐘)
   * @param {number} [params.waitMins=0] - 預估等餐時間 (分鐘)
   * @param {number} [params.basePay=0] - 預估表定車資 (元)
   * @param {number} [params.rate=245] - 專法保障時薪費率
   * @returns {Object} 戰術評估結果
   */
  function evaluateOrderTactics(params) {
    const mode = params.vehicleMode || 'motorcycle';
    const stacks = Math.min(10, Math.max(1, Number(params.stacks) || 1));
    const dist = Math.max(0, Number(params.distanceKm) || 0);
    const dur = Math.max(0, Number(params.tripMins) || 0);
    const wait = Math.max(0, Number(params.waitMins) || 0);
    const basePay = Math.max(0, Number(params.basePay) || 0);
    const rate = Number(params.rate) || DEFAULT_RATE;
    const vCfg = (vehicleConfigMap && vehicleConfigMap[mode]) || vehicleConfigMap.motorcycle;

    // 1. 專法工時與產值試算
    const multiplier = getStackMultiplier(stacks);
    const statutoryMins = dur * multiplier;
    const statutoryHours = statutoryMins / 60;
    const legalGuarantee = statutoryHours * rate;
    const physicalHours = dur > 0 ? (dur / 60) : 0;
    const realHourlyWage = physicalHours > 0 ? (legalGuarantee / physicalHours) : rate * multiplier;

    // 2. 營運耗損與淨額
    const vehicleCost = dist * vCfg.costPerKm;
    const netPay = Math.max(0, legalGuarantee - vehicleCost);
    const netHourlyWage = physicalHours > 0 ? (netPay / physicalHours) : realHourlyWage;
    const kmRate = dist > 0 ? (legalGuarantee / dist) : 0;
    const avgDistPerStack = dist / stacks;

    // 3. 戰術評估指標與紅線判定
    const pros = [];
    const cons = [];
    let isRedLine = false;
    let isGoldStandard = false;
    let score = 70; // 基準分

    // ── 依載具檢定紅線與黃金標準 ──
    if (mode === 'motorcycle') {
      // 機車模式
      if (stacks === 1 && dist > 3.5) {
        isRedLine = true;
        cons.push(`單發單長達 ${dist.toFixed(1)}km（超過 3.5km 拒接紅線），回程空車高耗油低產值！`);
      } else if (stacks === 2 && dist > 3.0) {
        isRedLine = true;
        cons.push(`2 疊單總距 ${dist.toFixed(1)}km（超過 3.0km 拒接紅線），時間拖長抵銷工時倍率！`);
      } else if (stacks >= 3 && dist > 4.5) {
        isRedLine = true;
        cons.push(`3 疊單總距 ${dist.toFixed(1)}km（超過 4.0km 拒接紅線），易出現跨區脫離核心商圈！`);
      }

      // 黃金標準
      if (stacks === 2 && dist <= 2.5 && dur <= 20) {
        isGoldStandard = true;
        pros.push(`符合【2 疊黃金標準】：里程 ≤ 2.5km 且耗時 ≤ 20 分鐘，雙倍工時最佳收割區！`);
      } else if (stacks >= 3 && dist <= 3.5 && dur <= 30) {
        isGoldStandard = true;
        pros.push(`符合【3 疊黃金標準】：里程 ≤ 3.5km 且耗時 ≤ 30 分鐘，高速並聯 2.5x 產值爆表！`);
      }

    } else if (mode === 'bike') {
      // 腳踏車模式
      if (stacks === 1 && dist > 3.0) {
        isRedLine = true;
        cons.push(`單發單長達 ${dist.toFixed(1)}km（超過腳踏車 3.0km 紅線），嚴重消耗肌耐力回程空踩！`);
      } else if (dist > 3.5 && avgDistPerStack > 2.2) {
        isRedLine = true;
        cons.push(`總里程 ${dist.toFixed(1)}km 超出生活圈最佳半徑 (2.5km)，均單 ${avgDistPerStack.toFixed(1)}km 偏遠！`);
      }

      // 黃金標準
      if (stacks >= 2 && dist <= 2.5 && avgDistPerStack <= 1.5) {
        isGoldStandard = true;
        pros.push(`符合【腳踏車黃金生活圈】：均單 ≤ 1.5km 且總距 ≤ 2.5km，輕踩持久拉滿法定工時！`);
      }

    } else {
      // 步行模式
      if (stacks === 1 && dist > 0.8) {
        isRedLine = true;
        cons.push(`單發單超過 0.8km（超出步行極限 800m），徒步往返極易疲勞延遲！`);
      } else if (dist > 1.2 && avgDistPerStack > 0.6) {
        isRedLine = true;
        cons.push(`總距 ${dist.toFixed(1)}km 步行範圍過廣，建議鎖定商場/百貨同棟或隔壁棟群單！`);
      }

      // 黃金標準
      if (dist <= 0.8 && avgDistPerStack <= 0.4) {
        isGoldStandard = true;
        pros.push(`符合【步行極致黃金圈】：商圈 400m~800m 高密度，0油耗純落袋！`);
      }
    }

    // ── 等餐效益判定 ──
    if (stacks >= 2 && wait >= 5 && wait <= 10) {
      pros.push(`等餐 ${wait} 分鐘落在【雙重計時增值黃金區】（專法雙單累加，等餐時間雙倍換算法定薪酬）`);
    } else if (wait > 15) {
      cons.push(`等餐時間長達 ${wait} 分鐘，恐擠壓下一單時限，須評估商家出餐信譽！`);
    }

    // ── 每公里產值檢定 ──
    if (kmRate >= 80) {
      pros.push(`每公里法定產值高達 NT$${kmRate.toFixed(0)}/km，密度極佳！`);
    } else if (kmRate < 40 && dist > 0) {
      cons.push(`每公里法定產值僅 NT$${kmRate.toFixed(0)}/km，跑長距無相應單量補貼！`);
    }

    // ── 評定等級與戰術分數 ──
    let rating = 'NORMAL';
    let badgeText = '⚡ 邊際普通單';
    let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
    let summary = '符合基本派單常態，可正常接單，但需留意時間掌握。';

    if (isRedLine) {
      rating = 'REJECT';
      badgeText = '🚫 強烈建議拒單 (踩中紅線)';
      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      score = Math.max(15, 50 - cons.length * 15);
      summary = '此單踩中長距或低產值紅線！回程空車耗油或嚴重拖延，接單將大幅拉低時薪。';
    } else if (isGoldStandard || (stacks >= 2 && kmRate >= 70 && !cons.length)) {
      rating = 'SSR';
      badgeText = '👑 推薦秒接 (黃金獵單)';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      score = Math.min(100, 88 + (stacks - 1) * 4);
      summary = `完美吃滿專法 ${multiplier.toFixed(2)}x 工時放大效應！預期實質淨時薪高達 NT$${Math.round(netHourlyWage)}/時。`;
    } else if (stacks >= 2 || (dist <= vCfg.maxDist && dur <= 22)) {
      rating = 'SR';
      badgeText = '🌟 優質高效單';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      score = 80;
      summary = `具備良好工時放大或短距週轉效益，推薦積極接單！`;
    }

    return {
      mode,
      stacks,
      dist,
      dur,
      wait,
      basePay,
      rate,
      multiplier,
      statutoryMins,
      statutoryHours,
      legalGuarantee,
      realHourlyWage,
      netHourlyWage,
      vehicleCost,
      netPay,
      kmRate,
      avgDistPerStack,
      rating,
      badgeText,
      badgeColor,
      score,
      summary,
      pros,
      cons
    };
  }

  return {
    evaluateOrderTactics
  };
});
