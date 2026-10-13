const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../js/calc.js');
const parser = require('../js/parser.js');
const tone = require('../js/tone.js');
const config = require('../js/config.js');
const statement = require('../js/statement.js');

describe('逐單起迄時間精算', () => {
  it('解析區間、跨午夜與錯誤格式', () => {
    assert.deepEqual(calc.parseOrderTimes('14:05-14:32, 14:10～14:40').map((o) => o.mins), [27, 30]);
    assert.deepEqual(calc.parseOrderTimes('23:50-00:20').map((o) => o.mins), [30]);
    assert.deepEqual(calc.parseOrderTimes('14:05-14:05'), []);
    assert.deepEqual(calc.parseOrderTimes('25:00-25:30'), []);
    assert.deepEqual(calc.parseOrderTimes(''), []);
  });

  it('聯集只算一次重疊', () => {
    assert.equal(calc.unionMins(calc.parseOrderTimes('14:05-14:32, 14:10-14:40')), 35);
    assert.equal(calc.unionMins(calc.parseOrderTimes('14:00-14:10, 14:30-14:40')), 20);
    assert.equal(calc.unionMins(calc.parseOrderTimes('23:50-00:20, 23:55-00:30')), 40);
  });

  it('獨立累加模式用逐單加總，倍率表模式不受影響', () => {
    const trip = { duration: 35, stacks: 2, basePay: 140, orderTimes: '14:05-14:32, 14:10-14:40' };
    const ind = calc.calcTrip(trip, { statutoryMode: 'independent', rate: 245 });
    assert.equal(ind.exact, true);
    assert.equal(ind.statMins, 57); // 27 + 30，而非近似的 35 × 2 = 70
    assert.equal(ind.legal, (57 / 60) * 245);
    const tbl = calc.calcTrip(trip, { statutoryMode: 'table', rate: 245 });
    assert.equal(tbl.exact, false);
    assert.equal(tbl.statMins, 35 * 1.75);
  });

  it('沒填整趟時間時用聯集當實際耗時；格式錯誤退回近似', () => {
    const c = calc.calcTrip({ duration: 0, stacks: 2, orderTimes: '14:05-14:32, 14:10-14:40' }, { statutoryMode: 'independent', rate: 245 });
    assert.equal(c.physicalMins, 35);
    const bad = calc.calcTrip({ duration: 20, stacks: 2, orderTimes: '亂打' }, { statutoryMode: 'independent', rate: 245 });
    assert.equal(bad.exact, false);
    assert.equal(bad.statMins, 40);
  });

  it('整期彙總統計精算趟數', () => {
    const s = calc.calcSummary([
      { duration: 35, stacks: 2, orderTimes: '14:05-14:32, 14:10-14:40' },
      { duration: 20, stacks: 1 }
    ], { statutoryMode: 'independent', rate: 245 });
    assert.equal(s.exactCount, 1);
    assert.equal(s.totalStatutoryMins, 57 + 20);
  });
});

describe('解析器抓逐單時間', () => {
  it('區間寫法（含上午/下午）並自動設定疊單數', () => {
    const t = parser.parseDeliveryText('服務時間 35 分鐘\n第1單 14:05-14:32\n第2單 下午 2:10 ~ 下午 2:40\n行程費用 NT$140');
    assert.equal(t.orderTimes, '14:05-14:32, 14:10-14:40');
    assert.equal(t.stacks, 2);
    assert.equal(t.found.orderTimes, true);
    assert.equal(t.duration, 35);
  });

  it('接單／送達分行寫法依序配對；數量不符時放棄', () => {
    assert.equal(parser.extractOrderTimes(['接單 14:05', '送達 14:32', '接單 14:10', '已送達 14:40']), '14:05-14:32, 14:10-14:40');
    assert.equal(parser.extractOrderTimes(['接單 14:05', '接單 14:10', '送達 14:40']), '');
  });

  it('沒有時間時維持原行為', () => {
    const t = parser.parseDeliveryText('行程費用 NT$80\n服務時間 15 分鐘');
    assert.equal(t.orderTimes, '');
    assert.equal(t.stacks, 1);
  });
});

describe('建議文字語氣', () => {
  it('正式語氣替換口語詞，輕鬆語氣原樣', () => {
    const raw = '🌟 SSR 機車黃金疊單';
    assert.equal(tone.applyTone(raw, 'casual'), raw);
    assert.equal(tone.applyTone(raw, 'formal'), '🌟 特優 機車黃金疊單');
    assert.equal(tone.applyTone('SSR', 'formal'), '特優');
    assert.equal(tone.applyTone('A', 'formal'), 'A');
    const w = tone.formalize('單發單超過 4.0km 是標準雷單（回程空車耗油無收入），果斷轉單！');
    assert.ok(!/雷單|果斷|！/.test(w), w);
    assert.ok(w.includes('低效率訂單'));
  });
});

describe('費率表年度提醒', () => {
  it('10 月不提醒、11 月缺明年提醒、跨年缺今年警告', () => {
    assert.equal(config.checkRateSchedule(new Date(2026, 9, 13)), null);
    assert.deepEqual(config.checkRateSchedule(new Date(2026, 10, 1)), { level: 'upcoming', year: 2027 });
    const m = config.checkRateSchedule(new Date(2027, 0, 5));
    assert.equal(m.level, 'missing');
    assert.equal(m.lastHourly, 196);
  });
});

describe('目標時薪反推', () => {
  const params = { avgServiceMins: 18, physicalMins: 25, idleMins: 10, distanceKm: 7, basePayPerOrder: 60, tipsPerOrder: 8 };
  const opts = { statutoryMode: 'table', rate: 245, vehicleMode: 'motorcycle' };

  it('每列與模擬器一致，最少疊數為第一個達標者', () => {
    const r = calc.solveTargetHourly(400, params, opts, 5);
    assert.equal(r.rows.length, 5);
    r.rows.forEach((row) => {
      const sim = calc.simulateSession({ ...params, stacks: row.stacks }, opts);
      assert.equal(row.netPerHour, sim.perHour.net);
    });
    const first = r.rows.find((x) => x.reached);
    assert.equal(r.minStacks, first ? first.stacks : null);
  });

  it('里程上限代回去剛好等於目標', () => {
    const r = calc.solveTargetHourly(400, params, opts, 5);
    const row = r.rows.find((x) => x.maxKm !== null && x.maxKm !== Infinity);
    assert.ok(row);
    const sim = calc.simulateSession({ ...params, stacks: row.stacks, distanceKm: row.maxKm }, opts);
    assert.ok(Math.abs(sim.perHour.net - 400) < 1e-6);
  });

  it('步行沒有里程成本時不限里程；目標太高時達不到', () => {
    const walk = calc.solveTargetHourly(100, params, { ...opts, vehicleMode: 'walk' }, 3);
    assert.equal(walk.rows[0].maxKm, Infinity);
    const huge = calc.solveTargetHourly(99999, params, opts, 3);
    assert.equal(huge.minStacks, null);
    assert.equal(huge.rows[0].maxKm, null);
  });
});

describe('雙週對帳單', () => {
  it('列與合計和計算引擎一致，並註明近似', () => {
    const trips = [
      { date: '2026-10-06T12:00', duration: 35, stacks: 2, basePay: 140, merchant: 'A', orderTimes: '12:00-12:27, 12:05-12:35' },
      { date: '2026-10-05T18:00', duration: 20, stacks: 1, basePay: 60, merchant: 'B' }
    ];
    const opts = { statutoryMode: 'independent', rate: 245 };
    const sum = calc.calcSummary(trips, opts);
    const st = statement.buildStatement(sum, trips, { cycleLabel: '測試期' }, opts, new Date(2026, 9, 13));
    assert.equal(st.rows.length, 2);
    assert.equal(st.rows[0].merchant, 'B'); // 依日期排序
    assert.equal(st.rows[1].exact, true);
    assert.equal(st.totals.subsidy, sum.subsidy);
    assert.equal(st.generatedAt, '2026/10/13');
    assert.ok(st.notes.some((n) => n.includes('1 趟沒有逐單')));
    const text = statement.statementToText(st);
    assert.ok(text.includes('應補差額'));
    assert.ok(text.includes('測試期'));
  });

  it('倍率表模式提醒僅供參考', () => {
    const st = statement.buildStatement(calc.calcSummary([], { statutoryMode: 'table' }), [], {}, { statutoryMode: 'table' });
    assert.ok(st.notes[0].includes('僅供參考'));
  });
});
