const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseDeliveryText, toHalfWidth, parseAmountIn } = require('../js/parser.js');

describe('外送剪貼簿解析引擎測試 (Parser Test Suite)', () => {
  it('測試 1: 標準樣本 A（基本費 + 加成 + 合計 + 小費 + 分秒 + 距離）', () => {
    const raw = `
      基本行程費用 60
      基本報酬加成 12
      行程費用 72
      顧客小費 35
      服務時間 14 分鐘 12 秒
      距離 2.1 公里
    `;
    const res = parseDeliveryText(raw);
    assert.equal(res.baseFare, 60);
    assert.equal(res.boostFare, 12);
    assert.equal(res.basePay, 72);
    assert.equal(res.tips, 35);
    assert.equal(res.durationSec, 852);
    assert.equal(res.duration, 14.2);
    assert.equal(res.distance, 2.1);
    assert.equal(res.found.basePay, true);
    assert.equal(res.found.duration, true);
  });

  it('測試 2: 樣本 B - 標籤無數字防跨行（小費標籤後無金額，不誤抓距離）', () => {
    const raw = `
      本趟行程包含小費
      2.1 公里
    `;
    const res = parseDeliveryText(raw);
    assert.equal(res.tips, 0);
    assert.equal(res.found.tips, false);
    assert.equal(res.distance, 2.1);
  });

  it('測試 3: 千分位金額支援（NT$1,200 不被截斷成 1.2）', () => {
    const raw = `行程費用 NT$1,200`;
    const res = parseDeliveryText(raw);
    assert.equal(res.basePay, 1200);
    assert.equal(res.found.basePay, true);
  });

  it('測試 4: 排除日期與完成事件時刻（完成時間 14:05 不被誤認為歷時）', () => {
    const raw = `完成時間 14:05`;
    const res = parseDeliveryText(raw);
    assert.equal(res.durationSec, null);
    assert.equal(res.duration, 0);
    assert.equal(res.found.duration, false);

    const sampleD = parseDeliveryText('2026/09/30 下午 14:05 完成');
    assert.equal(sampleD.durationSec, null);
  });

  it('測試 4a: 千分位與無逗號四位數完整解析', () => {
    assert.equal(parseAmountIn('NT$1,200'), 1200);
    assert.equal(parseAmountIn('NT$1200'), 1200);
    assert.equal(parseAmountIn('NT$3,000'), 3000);
    assert.equal(parseAmountIn('NT$3000'), 3000);
    assert.equal(parseAmountIn('1234.5'), 1234.5);
    assert.equal(parseDeliveryText('行程費用 1234.5').basePay, 1234.5);
    assert.equal(parseDeliveryText('行程費用 NT$1200').basePay, 1200);
    assert.equal(parseDeliveryText('行程費用 NT$3000').basePay, 3000);
  });

  it('備援金額抓取只接受明確幣別符號', () => {
    const res = parseDeliveryText('訂單編號 12345');
    assert.equal(res.basePay, 0);
    assert.equal(res.found.basePay, false);
  });

  it('備援金額不會把小費或活動獎勵誤認為行程費用', () => {
    const tipOnly = parseDeliveryText('小費 NT$35\n14 分鐘 12 秒');
    assert.equal(tipOnly.basePay, 0);
    assert.equal(tipOnly.found.basePay, false);

    const incentiveOnly = parseDeliveryText('活動獎勵 NT$150\n14 分鐘');
    assert.equal(incentiveOnly.basePay, 0);
    assert.equal(incentiveOnly.found.basePay, false);

    const fallback = parseDeliveryText('訂單資訊 NT$50');
    assert.equal(fallback.basePay, 50);
    assert.equal(fallback.found.basePay, false);
    assert.ok(fallback.warnings.includes('行程費用為推測值（取自含 NT$ 的第一行），請確認'));
  });

  it('測試 5: 基本報酬不被誤認為加成', () => {
    const raw = `基本報酬 NT$72`;
    const res = parseDeliveryText(raw);
    assert.equal(res.basePay, 72);
    assert.equal(res.boostFare, 0);
    assert.equal(res.found.basePay, true);
    assert.equal(res.found.boostFare, false);
  });

  it('測試 6: 全形數字與逗號（小費：NT$１，０００）', () => {
    const raw = `小費：NT$１，０００`;
    const res = parseDeliveryText(raw);
    assert.equal(res.tips, 1000);
    assert.equal(res.found.tips, true);
  });

  it('測試 7: 小時與分鐘複合格式（1 小時 5 分）', () => {
    const raw = `歷時 1 小時 5 分`;
    const res = parseDeliveryText(raw);
    assert.equal(res.durationSec, 3900); // 1*3600 + 5*60 = 3900
    assert.equal(res.duration, 65);
    assert.equal(res.found.duration, true);
  });

  it('測試 8: 服務時間冒號格式（服務時間 12:30）', () => {
    const raw = `服務時間 12:30`;
    const res = parseDeliveryText(raw);
    assert.equal(res.durationSec, 750); // 12*60 + 30 = 750
    assert.equal(res.duration, 12.5);
    assert.equal(res.found.duration, true);
  });

  it('測試 9: 公尺單位換算（800 公尺換算為 0.8 公里）', () => {
    const raw = `路程 800 公尺`;
    const res = parseDeliveryText(raw);
    assert.equal(res.distance, 0.8);
    assert.equal(res.found.distance, true);
  });

  it('測試 10: 空字串或純亂碼不拋錯', () => {
    const res = parseDeliveryText('   \n\t  ');
    assert.equal(res.basePay, 0);
    assert.equal(res.duration, 0);
    assert.equal(res.found.basePay, false);
    assert.equal(res.found.duration, false);
    assert.equal(Array.isArray(res.warnings), true);
  });

  it('測試 11: 金額不平衡合理性警告（基本費 60 + 加成 12 ≠ 合計 99）', () => {
    const raw = `
      基本行程費用 60
      基本報酬加成 12
      行程費用 99
    `;
    const res = parseDeliveryText(raw);
    assert.equal(res.basePay, 99);
    assert.equal(res.warnings.includes('基本費＋加成 ≠ 合計'), true);
  });

  it('測試 12: 連續解析無狀態殘留（冪等性驗證）', () => {
    const raw = `行程費用 NT$85\n距離 3.5 公里`;
    const res1 = parseDeliveryText(raw);
    const res2 = parseDeliveryText(raw);
    assert.deepEqual(res1, res2);
  });
});
