const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calcSummary } = require('../js/calc.js');
const { generateShortPost, generateFullReport, generateLaborComplaintDraft } = require('../js/report.js');

describe('三合一社群戰報產生器', () => {
  const trips = [
    { duration: 30, stacks: 1, basePay: 100, tips: 20 },
    { duration: 40, stacks: 2, basePay: 180, incentives: 10 }
  ];
  const summary = calcSummary(trips, { rate: 245, statutoryMode: 'table' });
  const cycle = { cycleLabel: '2026/09/28–2026/10/11', dayInCycle: 4 };

  it('短貼包含訂單與保底差額資訊且不超過 280 字', () => {
    const post = generateShortPost(summary, trips, cycle);
    assert.ok(post.length > 0);
    assert.ok(Array.from(post).length <= 280);
    assert.match(post, /保底/);
    assert.match(post, /補差額/);
    assert.match(post, /時薪/);
    assert.match(post, /NT\$/);
  });

  it('長篇戰報包含明細、保底與補差額金額', () => {
    const report = generateFullReport(summary, trips, cycle);
    assert.ok(report.length > 0);
    assert.match(report, /法定最低保底/);
    assert.match(report, /預估應補差額/);
    assert.match(report, /NT\$/);
    assert.match(report, /逐筆對帳/);
  });

  it('independent 模式逐筆 legal 加總與戰報表頭一致', () => {
    const independentTrips = [
      { duration: 60, stacks: 2, basePay: 50 },
      { duration: 60, stacks: 1, basePay: 60 }
    ];
    const independentSummary = calcSummary(independentTrips, { rate: 60, statutoryMode: 'independent' });
    const report = generateFullReport(independentSummary, independentTrips, cycle, { rate: 60, statutoryMode: 'independent' });
    const headerLegal = Number(report.match(/法定最低保底：NT\$([\d,]+)/)[1].replace(/,/g, ''));
    const details = [...report.matchAll(/保底NT\$([\d,]+)/g)];
    const detailLegal = details.reduce((sum, match) => sum + Number(match[1].replace(/,/g, '')), 0);
    assert.equal(headerLegal, 180);
    assert.equal(detailLegal, headerLegal);
  });

  it('申訴草稿列出 245/h 底線、總工時與應補差額', () => {
    const draft = generateLaborComplaintDraft(summary, trips, cycle);
    assert.ok(draft.length > 0);
    assert.match(draft, /245\/h/);
    assert.ok(draft.includes('《外送員權益保障及外送平臺管理法》第 5 條'));
    assert.match(draft, /實際跑單總工時/);
    assert.match(draft, /初估尚應補足差額/);
    assert.match(draft, /NT\$/);
  });
});
