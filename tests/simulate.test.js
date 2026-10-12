const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { simulateSession } = require('../js/calc.js');

const base = { stacks: 2, avgServiceMins: 20, physicalMins: 30, idleMins: 10, distanceKm: 4, basePayPerOrder: 50, tipsPerOrder: 0, hoursPerDay: 5, daysPerCycle: 10 };

describe('跑單時薪模擬器', () => {
  it('跟著法定工時模式走（與主計算器一致）', () => {
    const table = simulateSession(base, { rate: 240, statutoryMode: 'table' });
    const indep = simulateSession(base, { rate: 240, statutoryMode: 'independent' });
    assert.equal(table.statMinsPerBatch, 20 * 1.75);
    assert.equal(indep.statMinsPerBatch, 20 * 2);
  });

  it('空檔計入：每小時批數 = 60 ÷ (整批 + 空檔)', () => {
    const r = simulateSession(base, { rate: 240, statutoryMode: 'independent' });
    assert.equal(r.batchesPerHour, 1.5);
    assert.equal(r.leverageOnRoad, 40 / 30);
    assert.equal(r.leverageOverall, 1);
    assert.equal(r.perHour.legal, 160 * 1.5);
  });

  it('實拿 = max(車資, 保底) + 小費 − 里程成本', () => {
    const r = simulateSession({ ...base, tipsPerOrder: 10 }, { rate: 240, statutoryMode: 'independent', vehicleMode: 'motorcycle' });
    // 保底 160 > 車資 100 → 160；小費 20；成本 4km × 1.5 = 6
    assert.equal(r.perHour.net, (160 + 20 - 6) * 1.5);
    assert.equal(r.subsidyPerBatch, 60);
    const rich = simulateSession({ ...base, basePayPerOrder: 200 }, { rate: 240, statutoryMode: 'independent' });
    assert.equal(rich.subsidyPerBatch, 0);
    assert.equal(rich.payoutPerBatch, 400);
  });

  it('服務時間超過整批耗時時夾住並警告', () => {
    const r = simulateSession({ ...base, stacks: 1, avgServiceMins: 60, physicalMins: 25 }, { rate: 245 });
    assert.equal(r.avgServiceMins, 25);
    assert.equal(r.warnings.length, 1);
    assert.ok(r.leverageOnRoad <= 1);
  });

  it('整期推估 = 每小時 × 小時 × 天數', () => {
    const r = simulateSession(base, { rate: 240, statutoryMode: 'independent' });
    assert.equal(r.perCycle.hours, 50);
    assert.equal(r.perCycle.subsidy, r.perHour.subsidy * 50);
    assert.equal(r.perCycle.orders, 1.5 * 50 * 2);
  });
});
