const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const config = require('../js/config.js');
const calc = require('../js/calc.js');
const cycle = require('../js/cycle.js');
const report = require('../js/report.js');

describe('最低工資費率表', () => {
  it('依日期取保障時薪（最低工資 × 1.25）', () => {
    assert.equal(config.getStatutoryRateForDate('2025-06-01T12:00'), 237.5);
    assert.equal(config.getStatutoryRateForDate('2026-10-12T12:00'), 245);
    assert.equal(config.getStatutoryRateForDate('2026-12-31T23:59'), 245);
    // 2027 尚未加入表中前，沿用最後一筆（245）
    assert.equal(config.getStatutoryRateForDate('2027-01-01T00:30'), 245);
    // 早於表上第一筆時沿用第一筆
    assert.equal(config.getStatutoryRateForDate('2020-01-01T12:00'), 237.5);
  });

  it('auto 模式逐筆套用各自日期的費率，跨年會標示 mixedRates', () => {
    const trips = [
      { duration: 60, stacks: 1, basePay: 0, date: '2024-12-31T20:00' },
      { duration: 60, stacks: 1, basePay: 0, date: '2026-01-02T20:00' }
    ];
    const s = calc.calcSummary(trips, { rateMode: 'auto' });
    assert.equal(s.totalLegal, 237.5 + 245);
    assert.equal(s.mixedRates, true);
    assert.deepEqual(s.ratesUsed, [237.5, 245]);
    assert.equal(s.effectiveRate, (237.5 + 245) / 2);
  });

  it('custom 模式忽略日期、全部用自訂費率', () => {
    const trips = [{ duration: 60, stacks: 1, basePay: 0, date: '2027-03-01T10:00' }];
    assert.equal(calc.calcSummary(trips, { rateMode: 'custom', rate: 300 }).totalLegal, 300);
  });
});

describe('統一計算引擎（網頁與測試共用）', () => {
  const trips = [
    { duration: 30, distance: 2, stacks: 1, basePay: 80, tips: 20 },
    { duration: 40, distance: 3, stacks: 2, basePay: 150, incentives: 10 }
  ];

  it('兩種法定工時模式都正確', () => {
    const table = calc.calcSummary(trips, { rate: 245, statutoryMode: 'table' });
    const indep = calc.calcSummary(trips, { rate: 245, statutoryMode: 'independent' });
    assert.equal(table.totalStatutoryMins, 30 + 40 * 1.75);
    assert.equal(indep.totalStatutoryMins, 30 + 40 * 2);
  });

  it('載具成本與淨時薪', () => {
    const s = calc.calcSummary(trips, { rate: 245, vehicleMode: 'motorcycle' });
    assert.equal(s.totalVehicleCost, 5 * 1.5);
    assert.ok(Math.abs(s.netHourlyRate - (s.totalIncome - 7.5) / (70 / 60)) < 1e-9);
  });

  it('戰力標籤、診斷、統計在 independent 模式也可運作且無 NaN', () => {
    const opts = { rate: 245, statutoryMode: 'independent', vehicleMode: 'bike' };
    const ins = calc.computeTripInsights(trips, opts);
    assert.equal(ins.length, 2);
    ins.forEach((i) => assert.ok(Number.isFinite(i.legal) && Number.isFinite(i.kmRate)));
    // 單發單升級提示用該模式的倍率：雙疊多賺 = 30 分 × (2-1) / 60 × 245
    assert.match(ins[0].warnings.find((w) => w.type === 'stack').text, /雙疊可多賺 NT\$123/);
    const stats = calc.computeTierStats(trips, opts);
    assert.equal(stats.ssr + stats.sr + stats.normal + stats.warning, 2);
    assert.ok(calc.computeGlobalInsights(trips, opts).length >= 1);
  });

  it('舊式位置參數呼叫仍相容', () => {
    assert.equal(typeof calc.getTierLabel(trips[0], 'walk', 245), 'string');
    assert.equal(calc.computeSummary(trips, 245, 'bike').totalVehicleCost, 5 * 0.15);
  });
});

describe('戰報逐筆差額', () => {
  it('逐筆差額不再固定為 0', () => {
    const trips = [{ duration: 60, stacks: 1, basePay: 200 }];
    const s = calc.calcSummary(trips, { rate: 245 });
    const text = report.generateFullReport(s, trips, { cycleLabel: 'X' }, { rate: 245 });
    assert.match(text, /差額NT\$45/);
  });
});

describe('週期歸屬', () => {
  it('週一 04:00 前算上一期', () => {
    assert.equal(cycle.getCycleKey('2026-10-12T09:00'), '2026-10-12');
    assert.equal(cycle.getCycleKey('2026-10-12T03:59'), '2026-09-28');
    assert.equal(cycle.getCycleKey(''), null);
  });

  it('依週期分組，新到舊排序，並計算未標日期', () => {
    const g = cycle.groupTripsByCycle([
      { date: '2026-09-30T12:00' },
      { date: '2026-10-13T12:00' },
      { date: '2026-10-14T12:00' },
      {}
    ]);
    assert.deepEqual(g.cycles.map((c) => [c.key, c.count]), [['2026-10-12', 2], ['2026-09-28', 1]]);
    assert.equal(g.undated, 1);
    assert.equal(g.cycles[0].label, '2026/10/12–2026/10/25');
  });
});
