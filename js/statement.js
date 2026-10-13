/**
 * 雙週對帳單：把目前篩選週期的每一趟與合計整理成一份「可留存、可申訴」的對帳單。
 * - buildStatement()：純資料，Node 測試可直接驗證
 * - drawStatementPNG()：瀏覽器用 canvas 畫成圖片（不依賴外部套件，離線也能用）
 * 列印／存 PDF 則由頁面的列印樣式處理（見 css/src.css 的 .print-statement）。
 */
(function (root) {
  'use strict';

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const money = (v) => `NT$${Math.round(num(v)).toLocaleString('zh-TW')}`;
  const mins = (v) => `${num(v).toFixed(1)} 分`;
  const getCalc = () => (root.DSC && root.DSC.calc) || (typeof require === 'function' ? require('./calc.js') : null);

  function fmtDate(value) {
    if (!value) return '未標日期';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function buildStatement(summary, trips, cycleInfo, ctx, now) {
    const Calc = getCalc();
    const opts = ctx || {};
    const list = (Array.isArray(trips) ? trips : []).slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const rows = list.map((t) => {
      const c = Calc.calcTrip(t, opts);
      return {
        date: fmtDate(t.date),
        merchant: t.merchant || '',
        stacks: Math.max(1, Math.round(num(t.stacks)) || 1),
        physicalMins: c.physicalMins,
        statMins: c.statMins,
        exact: Boolean(c.exact),
        orderTimes: c.exact ? String(t.orderTimes || '') : '',
        rate: c.rate,
        legal: c.legal,
        basePay: c.basePay,
        tips: num(t.tips) + num(t.incentives)
      };
    });
    const s = summary || {};
    const rates = Array.isArray(s.ratesUsed) ? s.ratesUsed : [];
    const rateText = s.mixedRates && rates.length > 1
      ? `NT$${rates[0]}～${rates[rates.length - 1]}／時（跨年度依日期）`
      : `NT$${Number(num(s.effectiveRate).toFixed(2))}／時`;
    const modeLabel = opts.statutoryMode === 'independent' ? '獨立累加（對帳）' : '經驗倍率表（產值估計）';
    const notes = [];
    if (opts.statutoryMode !== 'independent') {
      notes.push('本單以「經驗倍率表」估算法定工時，僅供參考；對帳或申訴請改用「獨立累加」模式。');
    } else if (num(s.exactCount) < rows.length) {
      notes.push(`共 ${rows.length - num(s.exactCount)} 趟沒有逐單起迄時間，以「整趟時間 × 疊單數」近似，重疊路段可能高估。`);
    }
    notes.push('基本報酬＝行程費用＋基本報酬加成；小費與活動獎勵不計入差額比較。');
    const generated = now instanceof Date ? now : new Date();
    return {
      title: '外送專法雙週對帳單',
      cycleLabel: (cycleInfo && cycleInfo.cycleLabel) || '本期',
      generatedAt: `${generated.getFullYear()}/${String(generated.getMonth() + 1).padStart(2, '0')}/${String(generated.getDate()).padStart(2, '0')}`,
      rateText,
      modeLabel,
      rows,
      exactCount: num(s.exactCount),
      totals: {
        trips: rows.length,
        orders: num(s.totalOrdersCount),
        physicalMins: num(s.totalPhysicalMins),
        statMins: num(s.totalStatutoryMins),
        legal: num(s.totalLegal),
        basePay: num(s.totalBasePay),
        subsidy: num(s.subsidy),
        tips: num(s.totalTips) + num(s.totalIncentives),
        income: num(s.totalIncome)
      },
      notes
    };
  }

  /** 純文字版（複製、存檔、附在申訴信件裡）。 */
  function statementToText(st) {
    const L = [];
    L.push(`${st.title}｜${st.cycleLabel}`);
    L.push(`製表日 ${st.generatedAt}｜保障時薪 ${st.rateText}｜工時模式 ${st.modeLabel}`);
    L.push('');
    L.push('日期時間｜商家｜疊｜實際｜法定工時｜保底｜平台基本報酬');
    st.rows.forEach((r) => {
      L.push(`${r.date}｜${r.merchant || '-'}｜${r.stacks}｜${mins(r.physicalMins)}｜${mins(r.statMins)}${r.exact ? '（逐單）' : ''}｜${money(r.legal)}｜${money(r.basePay)}`);
    });
    L.push('');
    const t = st.totals;
    L.push(`合計 ${t.trips} 趟／${t.orders} 單｜實際 ${(t.physicalMins / 60).toFixed(2)} 時｜法定 ${(t.statMins / 60).toFixed(2)} 時`);
    L.push(`法定保底 ${money(t.legal)}｜平台基本報酬 ${money(t.basePay)}｜應補差額 ${money(t.subsidy)}`);
    L.push(`小費＋獎勵 ${money(t.tips)}｜總收入 ${money(t.income)}`);
    st.notes.forEach((n) => L.push(`※ ${n}`));
    return L.join('\n');
  }

  /** 用 canvas 畫對帳單圖片，回傳 Promise<Blob>。 */
  function drawStatementPNG(st, doc) {
    const d = doc || root.document;
    const W = 1080;
    const pad = 56;
    const rowH = 44;
    const headH = 300;
    const footH = 200 + st.notes.length * 34;
    const H = headH + Math.max(1, st.rows.length) * rowH + 60 + footH;
    const scale = 2;
    const cv = d.createElement('canvas');
    cv.width = W * scale;
    cv.height = H * scale;
    const g = cv.getContext('2d');
    g.scale(scale, scale);
    const F = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
    const ink = '#2b2a26', sub = '#6b6658', line = '#d9d2c3', moss = '#4f6b3a', persimmon = '#c8642c';

    g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, W, H);
    g.fillStyle = moss; g.fillRect(0, 0, W, 10);

    g.fillStyle = ink; g.font = `700 40px ${F}`; g.fillText(st.title, pad, 86);
    g.font = `500 26px ${F}`; g.fillStyle = sub; g.fillText(st.cycleLabel, pad, 132);
    g.font = `400 22px ${F}`;
    g.fillText(`製表日 ${st.generatedAt}　保障時薪 ${st.rateText}`, pad, 172);
    g.fillText(`法定工時模式：${st.modeLabel}`, pad, 206);

    // 表頭
    const cols = [
      { k: '日期時間', x: pad, w: 170 },
      { k: '商家', x: pad + 170, w: 250 },
      { k: '疊', x: pad + 420, w: 50, r: true },
      { k: '實際', x: pad + 470, w: 110, r: true },
      { k: '法定工時', x: pad + 580, w: 140, r: true },
      { k: '保底', x: pad + 720, w: 120, r: true },
      { k: '平台報酬', x: pad + 840, w: 128, r: true }
    ];
    let y = headH - 40;
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(pad, y + 14); g.lineTo(W - pad, y + 14); g.stroke();
    g.font = `600 20px ${F}`; g.fillStyle = ink;
    cols.forEach((c) => { g.textAlign = c.r ? 'right' : 'left'; g.fillText(c.k, c.r ? c.x + c.w : c.x, y); });
    y = headH;
    g.font = `400 20px ${F}`;
    const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
    st.rows.forEach((r, i) => {
      if (i % 2 === 1) { g.fillStyle = '#efe9db'; g.fillRect(pad, y - 30, W - pad * 2, rowH); }
      g.fillStyle = ink;
      const vals = [r.date, clip(r.merchant || '－', 11), String(r.stacks), mins(r.physicalMins), `${mins(r.statMins)}${r.exact ? '*' : ''}`, money(r.legal), money(r.basePay)];
      cols.forEach((c, j) => { g.textAlign = c.r ? 'right' : 'left'; g.fillText(vals[j], c.r ? c.x + c.w : c.x, y); });
      y += rowH;
    });
    if (!st.rows.length) { g.textAlign = 'left'; g.fillStyle = sub; g.fillText('本期沒有訂單', pad, y); y += rowH; }
    g.textAlign = 'left';
    g.strokeStyle = line; g.beginPath(); g.moveTo(pad, y - 18); g.lineTo(W - pad, y - 18); g.stroke();

    const t = st.totals;
    y += 30;
    g.fillStyle = ink; g.font = `500 22px ${F}`;
    g.fillText(`合計 ${t.trips} 趟／${t.orders} 單　實際 ${(t.physicalMins / 60).toFixed(2)} 時　法定 ${(t.statMins / 60).toFixed(2)} 時`, pad, y);
    y += 40;
    g.fillText(`法定保底 ${money(t.legal)}　平台基本報酬 ${money(t.basePay)}`, pad, y);
    y += 64;
    g.fillStyle = persimmon; g.font = `700 40px ${F}`;
    g.fillText(`應補差額 ${money(t.subsidy)}`, pad, y);
    g.fillStyle = sub; g.font = `400 22px ${F}`;
    g.textAlign = 'right'; g.fillText(`總收入 ${money(t.income)}（含小費獎勵 ${money(t.tips)}）`, W - pad, y); g.textAlign = 'left';
    y += 48;
    g.font = `400 18px ${F}`;
    if (st.exactCount > 0) { g.fillText('* 依每張單接單～送達起迄逐單加總', pad, y); y += 34; }
    st.notes.forEach((n) => { g.fillText(`※ ${n}`, pad, y); y += 34; });

    return new Promise((resolve) => cv.toBlob((b) => resolve(b), 'image/png'));
  }

  const api = { buildStatement, statementToText, drawStatementPNG };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DSC = Object.assign(root.DSC || {}, { statement: api });
  }
})(typeof window !== 'undefined' ? window : globalThis);
