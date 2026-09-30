const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { getBiweeklyCycleInfo, getProgressPercentage } = require('../js/cycle.js');

describe('14 天雙週對帳週期', () => {
  it('各日期時間均落在 1~14 天，且週期回傳有效日期', () => {
    for (let offset = 0; offset < 35; offset += 1) {
      for (const hour of [0, 3, 4, 12, 23]) {
        const date = new Date(2026, 8, 28 + offset, hour, 30);
        const info = getBiweeklyCycleInfo(date);
        assert.ok(info.dayInCycle >= 1 && info.dayInCycle <= 14);
        assert.ok(info.daysRemaining >= 0 && info.daysRemaining <= 13);
        for (const key of ['cycleStart', 'cycleEnd', 'nextPayoutDate']) {
          assert.ok(info[key] instanceof Date);
          assert.ok(Number.isFinite(info[key].getTime()));
        }
        assert.equal(info.cycleStart.getDay(), 1);
        assert.equal(info.cycleStart.getHours(), 4);
        assert.equal(info.cycleEnd.getDate(), new Date(info.cycleStart.getFullYear(), info.cycleStart.getMonth(), info.cycleStart.getDate() + 14).getDate());
        assert.equal(info.nextPayoutDate.getTime(), info.cycleEnd.getTime());
      }
    }
  });

  it('週一 04:00 為新週期日界線，週期長 14 日', () => {
    const beforeBoundary = getBiweeklyCycleInfo(new Date(2026, 8, 28, 3, 59));
    const atBoundary = getBiweeklyCycleInfo(new Date(2026, 8, 28, 4, 0));
    assert.equal(beforeBoundary.dayInCycle, 14);
    assert.equal(atBoundary.dayInCycle, 1);
    assert.equal(atBoundary.cycleStart.getTime() - beforeBoundary.cycleStart.getTime(), 14 * 24 * 60 * 60 * 1000);
  });

  it('保底達成率限制於 0~100%', () => {
    assert.equal(getProgressPercentage(50, 200), 25);
    assert.equal(getProgressPercentage(250, 200), 100);
    assert.equal(getProgressPercentage(-1, 200), 0);
    assert.equal(getProgressPercentage(0, 0), 100);
  });
});
