/**
 * 建議文字語氣切換
 * - casual（輕鬆）：原本的跑單口吻（SSR 神單、雷單、果斷拒接…），自己看最順
 * - formal（正式）：給同行、主管或做成內容分享時用，改成中性描述
 * 只改「顯示」的文字；計算與分級判斷（例如統計 SSR 數量）仍用原字串，不受影響。
 * 支援瀏覽器 (window.DSC.tone) 與 Node.js (CommonJS)。
 */
(function (root) {
  'use strict';

  // 依序取代；較長、較具體的詞放前面，避免被短詞先吃掉
  const RULES = [
    // 等級名稱：SSR → 特優、SR → 優良（不用 A/B，避免和評分卡的 A、B 級撞名）
    [/\[SSR ([^\]]+)\]\s*/g, '【$1】'],
    [/^SSR$/, '特優'],
    [/SSR\s*級?\s*/g, '特優 '],
    [/\bSR\s*/g, '優良 '],
    [/奇蹟神單|群單神單|最佳神單|免油錢純落袋神單|神單/g, '高效率訂單'],
    [/超距雷單|單發雷單|標準雷單|雷單/g, '低效率訂單'],
    [/果斷拒接\/轉單|果斷拒接|果斷轉單/g, '建議婉拒或轉單'],
    [/一律拒接/g, '建議不接'],
    [/務必/g, '建議'],
    [/工時並聯/g, '工時各自計算'],
    [/完美吃滿專法工時倍率/g, '充分利用專法工時計算'],
    [/高速吞吐/g, '高效率配送'],
    [/作戰/g, '配送'],
    [/戰力/g, '效率'],
    [/戰報/g, '報表'],
    [/超高效率/g, '效率良好'],
    [/極佳/g, '良好'],
    [/嚴重超出/g, '超出'],
    [/100% 淨賺|100% 轉為純利/g, '無油耗成本'],
    [/純淨賺|淨賺/g, '無油耗成本'],
    [/！/g, '。'],
    [/!(?=\s|$)/g, '。']
  ];

  function formalize(text) {
    if (text == null) return text;
    let out = String(text);
    for (const [re, rep] of RULES) out = out.replace(re, rep);
    return out.replace(/。。+/g, '。').replace(/\s{2,}/g, ' ');
  }

  /** 依語氣回傳文字；tone 不是 'formal' 時原樣回傳。 */
  function applyTone(text, tone) {
    return tone === 'formal' ? formalize(text) : text;
  }

  const api = { formalize, applyTone };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { tone: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
