/**
 * 14 天雙週對帳週期，以 Uber Eats 每週一 04:00（本地時間）為週期錨點。
 * 同時支援 CommonJS 與 window.DSC.cycle。
 */
(function (root) {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const ANCHOR = new Date(1970, 0, 5, 4, 0, 0, 0); // 1970-01-05 週一 04:00

  function dateOrdinal(date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
  }

  function addCalendarDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getBiweeklyCycleInfo(currentDate = new Date()) {
    const current = currentDate instanceof Date ? new Date(currentDate) : new Date(currentDate);
    if (Number.isNaN(current.getTime())) throw new TypeError('currentDate 必須是有效日期');

    // 找到目前時間之前（含當下）的最近週一 04:00 週錨點。
    let daysSinceMonday = (current.getDay() + 6) % 7;
    const weeklyStart = new Date(current);
    weeklyStart.setDate(current.getDate() - daysSinceMonday);
    weeklyStart.setHours(4, 0, 0, 0);
    if (weeklyStart > current) {
      daysSinceMonday += 7;
      weeklyStart.setDate(weeklyStart.getDate() - 7);
    }

    const weeksSinceAnchor = Math.floor((dateOrdinal(weeklyStart) - dateOrdinal(ANCHOR)) / 7);
    const cycleIndex = Math.floor(weeksSinceAnchor / 2);
    const cycleStart = addCalendarDays(ANCHOR, cycleIndex * 14);
    const cycleEnd = addCalendarDays(cycleStart, 14); // 結束界線（不含）／下一期起點

    // 以週期錨點切日，因此每一天都是當地時間 04:00 至翌日 04:00。
    const activeDayStart = new Date(current);
    activeDayStart.setHours(4, 0, 0, 0);
    if (current < activeDayStart) activeDayStart.setDate(activeDayStart.getDate() - 1);
    const dayInCycle = Math.max(1, Math.min(14, dateOrdinal(activeDayStart) - dateOrdinal(cycleStart) + 1));

    const formatDate = (date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    return {
      cycleStart,
      cycleEnd,
      dayInCycle,
      daysRemaining: 14 - dayInCycle,
      nextPayoutDate: new Date(cycleEnd),
      cycleLabel: `${formatDate(cycleStart)}–${formatDate(addCalendarDays(cycleEnd, -1))}`
    };
  }

  function getProgressPercentage(currentBasePay, targetLegal) {
    const current = Number(currentBasePay);
    const target = Number(targetLegal);
    if (!Number.isFinite(current) || !Number.isFinite(target)) return 0;
    if (target <= 0) return current >= 0 ? 100 : 0;
    return Math.max(0, Math.min(100, (current / target) * 100));
  }

  const api = { getBiweeklyCycleInfo, getProgressPercentage };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { cycle: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
