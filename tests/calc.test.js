const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getTableMultiplier,
  getTripStatutoryMins,
  getEffectiveRate,
  calcTrip,
  calcSummary
} = require('../js/calc.js');

describe('外送專法計算引擎測試 (Calc Test Suite)', () => {
  it('測試 1: 經驗倍率表與邊界防護', () => {
    assert.equal(getTableMultiplier(1), 1.00);
    assert.equal(getTableMultiplier(2), 1.75);
    assert.equal(getTableMultiplier(3), 2.50);
    assert.equal(getTableMultiplier(10), 7.75);
    assert.equal(getTableMultiplier(0), 1.00);
    assert.equal(getTableMultiplier(15), 7.75);
  });

  it('測試 2: 法定費率回退機制 (rate 清空或負值自動回退為 245)', () => {
    assert.equal(getEffectiveRate(245), 245);
    assert.equal(getEffectiveRate(250), 250);
    assert.equal(getEffectiveRate(null), 245);
    assert.equal(getEffectiveRate(undefined), 245);
    assert.equal(getEffectiveRate(''), 245);
    assert.equal(getEffectiveRate(0), 245);
    assert.equal(getEffectiveRate(-10), 245);
  });

  it('測試 3: 單筆 60 分鐘、1 單、basePay 200、rate 245 => legal 245, subsidy 45', () => {
    const trip = { duration: 60, stacks: 1, basePay: 200 };
    const res = calcTrip(trip, { rate: 245, statutoryMode: 'table' });
    assert.equal(res.statMins, 60);
    assert.equal(res.legal, 245);
    assert.equal(res.basePay, 200);
    assert.equal(res.physicalMins, 60);
    assert.equal(res.subsidy, 45);
  });

  it('測試 4: 單筆 60 分鐘、2 疊（table 模式）=> statMins 105, legal 428.75', () => {
    const trip = { duration: 60, stacks: 2, basePay: 300 };
    const res = calcTrip(trip, { rate: 245, statutoryMode: 'table' });
    assert.equal(res.statMins, 105);
    assert.equal(res.legal, 428.75);
  });

  it('測試 5: 單筆 60 分鐘、2 疊（independent 模式）=> statMins 120, legal 490', () => {
    const trip = { duration: 60, stacks: 2, basePay: 300 };
    const res = calcTrip(trip, { rate: 245, statutoryMode: 'independent' });
    assert.equal(res.statMins, 120);
    assert.equal(res.legal, 490);
  });

  it('測試 6: 驗證空陣列彙總（不拋錯、全為 0、無 NaN）', () => {
    const summary = calcSummary([], { rate: 245, statutoryMode: 'table' });
    assert.equal(summary.totalPhysicalMins, 0);
    assert.equal(summary.totalPhysicalHours, 0);
    assert.equal(summary.totalStatutoryMins, 0);
    assert.equal(summary.totalStatutoryHours, 0);
    assert.equal(summary.totalOrdersCount, 0);
    assert.equal(summary.totalLegal, 0);
    assert.equal(summary.totalBasePay, 0);
    assert.equal(summary.subsidy, 0);
    assert.equal(summary.totalIncome, 0);
    assert.equal(summary.effectiveRate, 245);
    
    Object.values(summary).forEach(val => {
      if (typeof val === 'number') {
        assert.equal(Number.isNaN(val), false);
      }
    });
  });

  it('測試 7: 驗證 rate 清空時 summary 自動回退為 245 且無 NaN', () => {
    const trips = [{ duration: 60, stacks: 1, basePay: 200 }];
    const summary = calcSummary(trips, { rate: '', statutoryMode: 'table' });
    assert.equal(summary.effectiveRate, 245);
    assert.equal(summary.totalLegal, 245);
    assert.equal(summary.subsidy, 45);
    Object.values(summary).forEach(val => {
      if (typeof val === 'number') {
        assert.equal(Number.isNaN(val), false);
      }
    });
  });
});
