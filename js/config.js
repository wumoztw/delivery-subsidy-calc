/**
 * 外送專法與疊單收益精算系統 - 核心組態與常數
 * 支援瀏覽器原生 (window.DeliveryConfig) 與 Node.js (CommonJS) 雙環境
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DeliveryConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 本地儲存金鑰
  const STORAGE_KEY = 'delivery_subsidy_calc_v3';
  const LEGACY_STORAGE_KEY = 'delivery_subsidy_calc_v2';

  // 外送員保障時薪 = 當時最低工資時薪 × 1.25
  const RATE_FACTOR = 1.25;

  /**
   * 最低工資時薪歷程（依生效日排序）。每年秋天公告新數字後，在最後加一列即可。
   * - 2025：190（月薪 28,590）
   * - 2026：196（月薪 29,500）
   * - 2027：205（月薪 30,900，最低工資審議會 2026/09/24 決議，明年 1/1 生效）
   */
  const MIN_WAGE_SCHEDULE = [
    { from: '2025-01-01', hourly: 190 },
    { from: '2026-01-01', hourly: 196 },
    { from: '2027-01-01', hourly: 205 }
  ];

  // 找不到可用日期時的回退費率（2026 年：196 × 1.25）
  const DEFAULT_RATE = 245;

  function toLocalDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** 取得某日適用的最低工資時薪（早於表上第一筆時用第一筆）。 */
  function getMinWageForDate(date) {
    const key = toLocalDateKey(date == null ? new Date() : date);
    if (!key) return MIN_WAGE_SCHEDULE[MIN_WAGE_SCHEDULE.length - 1].hourly;
    let hourly = MIN_WAGE_SCHEDULE[0].hourly;
    for (const row of MIN_WAGE_SCHEDULE) {
      if (key >= row.from) hourly = row.hourly;
    }
    return hourly;
  }

  /** 取得某日適用的外送保障時薪（最低工資 × 1.25）。 */
  function getStatutoryRateForDate(date) {
    return getMinWageForDate(date) * RATE_FACTOR;
  }

  // 經驗倍率表 (每多一疊 +0.75x，10 疊為上限)
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

  // 載具作戰參數與成本模型
  const vehicleConfigMap = {
    walk: {
      name: '步行',
      icon: '🚶',
      speed: '4-5 km/h',
      costPerKm: 0,
      costPerHour: 0,
      maxDist: 0.8,
      redDist: 1.2,
      desc: '極短距高密度、零油耗 100% 淨賺'
    },
    bike: {
      name: '腳踏車',
      icon: '🚲',
      speed: '12-18 km/h',
      costPerKm: 0.15,
      costPerHour: 2,
      maxDist: 2.5,
      redDist: 3.2,
      desc: '2.5km 內生活圈雙疊/三疊，輕齒比慢騎持久拉工時'
    },
    motorcycle: {
      name: '機車',
      icon: '🛵',
      speed: '40-50 km/h',
      costPerKm: 1.5,
      costPerHour: 22,
      maxDist: 5.0,
      redDist: 6.0,
      desc: '拒接長距單發，鎖定大商圈 3 疊高速吞吐'
    }
  };

  return {
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    RATE_FACTOR,
    MIN_WAGE_SCHEDULE,
    DEFAULT_RATE,
    toLocalDateKey,
    getMinWageForDate,
    getStatutoryRateForDate,
    stackMultiplierMap,
    vehicleConfigMap
  };
});
