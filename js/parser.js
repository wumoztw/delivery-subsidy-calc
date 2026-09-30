/**
 * delivery-subsidy-calc - Parser Module
 * 容錯式外送文字剪貼簿解析引擎
 * 支援 Node.js 測試 (CommonJS) 與 瀏覽器全域載入 (window.DSC.parser)
 */
(function (root) {
  'use strict';

  // 1. 全形/半形與特殊符號統一正規化
  const toHalfWidth = (s) => {
    if (!s) return '';
    return String(s)
      .replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/\u3000/g, ' ')
      .replace(/[：]/g, ':')
      .replace(/[，]/g, ',')
      .replace(/分鍾/g, '分鐘')
      .replace(/秒鐘/g, '秒')
      .replace(/公裏/g, '公里');
  };

  // 2. 擷取金額數字（支援千分位 NT$1,200、純數字、小數點）
  const parseAmountIn = (str) => {
    if (!str) return null;
    const m = /(?:\$|NT\$|NT)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/i.exec(str);
    if (!m) return null;
    return Number(m[1].replace(/,/g, ''));
  };

  // 3. 欄位匹配規則定義（行內單獨匹配，不跨行亂抓）
  const FIELDS = {
    baseFare: {
      test: (l) => l.includes('基本行程費用') || l.includes('基本車資') || l.includes('基本行程費'),
      label: /基本行程費用|基本車資|基本行程費/
    },
    boostFare: {
      test: (l) => /基本報酬加成|報酬加成|加成/.test(l),
      label: /基本報酬加成|報酬加成|加成/
    },
    basePay: {
      test: (l) =>
        ((/行程費用|本趟行程總計|車資/.test(l) && !/基本行程費用|基本車資|基本行程費/.test(l)) ||
        (l.includes('基本報酬') && !l.includes('加成'))),
      label: /行程費用|本趟行程總計|車資|基本報酬/
    },
    tips: {
      test: (l) => l.includes('小費'),
      label: /包含小費|顧客小費|額外小費|小費/
    },
    incentives: {
      test: (l) => /獎勵|活動獎勵|額外獎勵/.test(l),
      label: /活動獎勵|額外獎勵|獎勵/
    }
  };

  function extractAmount(lines, field) {
    for (const line of lines) {
      if (!field.test(line)) continue;
      const m = field.label.exec(line);
      if (!m) continue;
      const v = parseAmountIn(line.slice(m.index + m[0].length));
      if (v !== null) return v;
    }
    return null;
  }

  // 4. 時間解析：過濾日期/完成時刻，時/分/秒獨立加總為整數秒
  function extractDurationSec(lines) {
    for (const line of lines) {
      // 排除日期時刻時間戳（例：2026/09/30 下午 14:05 完成）
      if (/上午|下午|AM|PM|完成|結束|時刻|\d{4}[\/-]\d{1,2}[\/-]\d{1,2}/i.test(line)) continue;

      const h = /(\d+)\s*(?:小時|hrs?|h)(?![a-z])/i.exec(line);
      const m = /(\d+)\s*(?:分鐘|分|mins?)(?![a-z])/i.exec(line);
      const s = /(\d+)\s*(?:秒|secs?)(?![a-z])/i.exec(line);
      if (h || m || s) {
        return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0) + (s ? +s[1] : 0);
      }

      // 服務時間 12:30 或 耗時 14:05 格式（必須帶有服務時間/歷時/耗時前綴）
      const c = /(?:服務時間|歷時|耗時)\s*[:：]?\s*(\d{1,2}):(\d{2})(?![\d:])/.exec(line);
      if (c) {
        return +c[1] * 60 + +c[2];
      }
    }
    return null;
  }

  // 5. 距離解析：支援公里 (km) 與公尺 (m)
  function extractDistanceKm(lines) {
    for (const line of lines) {
      const km = /(\d+(?:\.\d+)?)\s*(?:公里|公里路程|km)/i.exec(line);
      if (km) return Number(km[1]);

      const m = /(\d+(?:\.\d+)?)\s*(?:公尺|m)(?![a-z])/i.exec(line);
      if (m) return Number(m[1]) / 1000;
    }
    return null;
  }

  // 6. 點數解析
  function extractPoints(lines) {
    for (const line of lines) {
      const pts = /(?:已賺取|賺取|獲得|點數)\s*(\d+)\s*點/i.exec(line) || /(\d+)\s*點/i.exec(line);
      if (pts) return parseInt(pts[1], 10);
    }
    return null;
  }

  // 7. 商家名稱解析：優先取商家/店家標籤，次取餐飲關鍵字
  function extractMerchant(lines) {
    for (const line of lines) {
      const tagged = /(?:商家|店家|餐廳|取餐地點)\s*[:：]?\s*([^\s]+)/.exec(line);
      if (tagged && tagged[1]) {
        return tagged[1].replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 20);
      }
    }
    for (const line of lines) {
      if (/館|店|鍋|餐|茶|堂|門市|坊|堡|廚|麵|飯/.test(line)) {
        const cleaned = line.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 20);
        if (cleaned.length >= 2 && !/基本|行程|小費|獎勵|加成|點數|服務/.test(cleaned)) {
          return cleaned;
        }
      }
    }
    return '';
  }

  // 8. 合理範圍檢查（超出範圍不阻擋，但提供警告清單供 UI 標示）
  function sanityCheck(t) {
    const w = [];
    if (t.durationSec != null && (t.durationSec < 30 || t.durationSec > 4 * 3600)) {
      w.push('服務時間超出 0.5 分~4 小時合理區間');
    }
    if (t.distance != null && (t.distance <= 0 || t.distance > 60)) {
      w.push('距離超出 0~60 km 合理區間');
    }
    if (t.basePay != null && (t.basePay < 10 || t.basePay > 3000)) {
      w.push('行程費用超出 NT$10~3000 合理區間');
    }
    if (
      t.basePay != null &&
      t.baseFare != null &&
      t.boostFare != null &&
      Math.abs(t.baseFare + t.boostFare - t.basePay) > 1
    ) {
      w.push('基本費＋加成 ≠ 合計');
    }
    return w;
  }

  // 9. 主解析函式
  function parseDeliveryText(raw) {
    const normalized = toHalfWidth(raw || '');
    const lines = normalized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const baseFare = extractAmount(lines, FIELDS.baseFare);
    const boostFare = extractAmount(lines, FIELDS.boostFare);
    let basePay = extractAmount(lines, FIELDS.basePay);
    const tips = extractAmount(lines, FIELDS.tips);
    const incentives = extractAmount(lines, FIELDS.incentives);
    const durationSec = extractDurationSec(lines);
    const distance = extractDistanceKm(lines);
    const points = extractPoints(lines);
    const merchant = extractMerchant(lines);

    // 互補推導（當某欄未直接匹配時自動推導）
    const derived = [];
    let finalBaseFare = baseFare;
    if (basePay == null && finalBaseFare != null) {
      basePay = finalBaseFare + (boostFare || 0);
      derived.push('basePay');
    }
    if (finalBaseFare == null && basePay != null) {
      finalBaseFare = Math.max(0, basePay - (boostFare || 0));
      derived.push('baseFare');
    }

    // 備援：若都沒有抓到標籤，嘗試抓取第一個金額作為 basePay
    if (basePay == null) {
      for (const line of lines) {
        if (!/(?:\$|NT\$)/i.test(line)) continue;
        const amt = parseAmountIn(line);
        if (amt !== null && amt >= 10) {
          basePay = amt;
          derived.push('basePayFallback');
          break;
        }
      }
    }

    const duration = durationSec != null ? Number((durationSec / 60).toFixed(2)) : 0;

    const out = {
      durationSec,
      duration,
      distance: distance != null ? distance : 0,
      baseFare: finalBaseFare != null ? finalBaseFare : 0,
      boostFare: boostFare != null ? boostFare : 0,
      basePay: basePay != null ? basePay : 0,
      tips: tips != null ? tips : 0,
      incentives: incentives != null ? incentives : 0,
      points: points != null ? points : 0,
      stacks: 1,
      merchant: merchant || '',
      found: {
        duration: durationSec != null,
        distance: distance != null,
        baseFare: finalBaseFare != null,
        boostFare: boostFare != null,
        basePay: basePay != null,
        tips: tips != null,
        incentives: incentives != null,
        points: points != null,
        merchant: Boolean(merchant)
      },
      derived,
      warnings: []
    };

    out.warnings = sanityCheck(out);
    return out;
  }

  const api = {
    toHalfWidth,
    parseAmountIn,
    parseDeliveryText,
    extractDurationSec,
    extractDistanceKm,
    sanityCheck
  };

  // 模組匯出
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { parser: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
