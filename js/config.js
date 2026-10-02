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

  // 專法預設保障時薪費率 (基本工資 $196 * 1.25 = $245/h)
  const DEFAULT_RATE = 245;

  // 專法法定累加工時倍率對照表 (每多一疊 +0.75x，10疊為上限)
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
    DEFAULT_RATE,
    stackMultiplierMap,
    vehicleConfigMap
  };
});
