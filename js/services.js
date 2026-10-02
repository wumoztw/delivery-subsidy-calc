/**
 * 外送專法與疊單收益精算系統 - 服務與 I/O 引擎 (Services)
 * 包含：剪貼簿秒貼正則解析、雙 AI 視覺辨識 (NVIDIA Nemotron & OpenRouter Llama 3.2 Vision)、
 * 本機 Canvas 銳化 + Tesseract.js 離線 OCR、CSV 匯入匯出與 Markdown 戰報生成
 * 支援瀏覽器原生 (window.DeliveryServices) 與 Node.js (CommonJS) 雙環境
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DeliveryServices = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 正則字元模糊修復與正規化（處理 OCR 誤判常見符號）
  function cleanAndNormalizeText(raw) {
    if (!raw) return '';
    let str = raw;
    str = str.replace(/[：]/g, ':').replace(/[,，]/g, '.');
    str = str.replace(/分鍾/g, '分鐘').replace(/秒鐘/g, '秒').replace(/公裏/g, '公里');
    str = str.replace(/已賺取|已賺|賺取|獲得點數|賺得/g, '已賺取');
    str = str.replace(/基本行程費|基本車資|基本行程/g, '基本行程費用');
    str = str.replace(/基本加成|報酬加成|基本報酬/g, '基本報酬加成');
    str = str.replace(/本趟行程的預估費用為|本趟行程預估費用為/g, '行程費用');
    return str;
  }

  // 升級版純文字解析器（支援秒貼與 OCR，容錯率最高）
  function parseDeliveryText(rawText) {
    const text = cleanAndNormalizeText(rawText);
    let duration = 0;
    let distance = 0;
    let baseFare = 0;
    let boostFare = 0;
    let basePay = 0;
    let tips = 0;
    let incentives = 0;
    let points = 0;
    let stacks = 1;
    let merchant = '';

    // 1. 匹配時間 (分+秒 或 純分鐘 或 mm:ss)
    const minSecMatch = text.match(/(\d+)\s*(?:分鐘|分|mins?)\s*(\d+)\s*(?:秒|secs?)/i);
    const colonTimeMatch = text.match(/(?:時間|歷時|耗時)?\s*(\d{1,2}):(\d{2})/);

    if (minSecMatch) {
      const mins = parseInt(minSecMatch[1], 10);
      const secs = parseInt(minSecMatch[2], 10);
      duration = parseFloat((mins + (secs / 60)).toFixed(2));
    } else if (colonTimeMatch) {
      const mins = parseInt(colonTimeMatch[1], 10);
      const secs = parseInt(colonTimeMatch[2], 10);
      duration = parseFloat((mins + (secs / 60)).toFixed(2));
    } else {
      const minOnlyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:分鐘|分|mins?)/i);
      if (minOnlyMatch) {
        duration = parseFloat(minOnlyMatch[1]);
      }
    }

    // 2. 匹配距離 (公里)
    const distMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:公里|公里路程|km)/i);
    if (distMatch) {
      distance = parseFloat(distMatch[1]);
    }

    // 3. 匹配小費
    const tipMatch = text.match(/(?:包含小費|顧客小費|額外小費|小費)[^\d$NT]*[\$NT\s]*(\d+(?:\.\d+)?)/i);
    if (tipMatch) {
      tips = parseFloat(tipMatch[1]);
    }

    // 4. 匹配基本行程費用 (淨基本費)
    const baseFareMatch = text.match(/基本行程費用[^\d$NT]*[\$NT\s]*(\d+(?:\.\d+)?)/i);
    if (baseFareMatch) {
      baseFare = parseFloat(baseFareMatch[1]);
    }

    // 5. 匹配基本報酬加成
    const boostMatch = text.match(/基本報酬加成[^\d$NT]*[\$NT\s]*(\d+(?:\.\d+)?)/i);
    if (boostMatch) {
      boostFare = parseFloat(boostMatch[1]);
    }

    // 6. 匹配行程費用 (總計)
    const fareMatch = text.match(/(?:行程費用|基本報酬|車資|本趟行程總計)[^\d$NT]*[\$NT\s]*(\d+(?:\.\d+)?)/i);
    if (fareMatch) {
      basePay = parseFloat(fareMatch[1]);
    } else {
      const generalAmounts = text.match(/(?:\$|NT\$)\s*(\d+(?:\.\d+)?)/g);
      if (generalAmounts && generalAmounts.length > 0) {
        basePay = parseFloat(generalAmounts[0].replace(/[^\d.]/g, ''));
      }
    }

    if (!baseFare && basePay) {
      baseFare = Math.max(0, basePay - boostFare);
    }
    if (!basePay && baseFare) {
      basePay = baseFare + boostFare;
    }

    // 7. 匹配 Uber Pro 點數（疊單數固定預設為 1 單，由外送員手動切換）
    const ptsMatch = text.match(/(?:已賺取|賺取|獲得|點數)\s*(\d+)\s*點/i) || text.match(/(\d+)\s*點/i);
    if (ptsMatch) {
      points = parseInt(ptsMatch[1], 10);
    }
    stacks = 1;

    // 8. 匹配商家名稱
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let l of lines) {
      if (l.includes('館') || l.includes('店') || l.includes('鍋') || l.includes('餐') || l.includes('茶') || l.includes('堂') || l.includes('門市')) {
        merchant = l.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 16);
        break;
      }
    }

    return { duration, distance, baseFare, boostFare, basePay, tips, incentives, points, stacks, merchant };
  }

  function parseDurationToMins(rawVal, minsVal, secsVal) {
    const mins = Number(minsVal) || 0;
    const secs = Number(secsVal) || 0;
    if (mins > 0 || secs > 0) {
      return parseFloat((mins + (secs / 60)).toFixed(2));
    }

    if (typeof rawVal === 'number' && !isNaN(rawVal)) {
      return parseFloat(rawVal.toFixed(2));
    }

    const str = String(rawVal || '');
    const minSec = str.match(/(\d+)\s*(?:分鐘|分|m|mins?)\s*(\d+)\s*(?:秒|s|secs?)/i);
    if (minSec) {
      return parseFloat((parseInt(minSec[1], 10) + (parseInt(minSec[2], 10) / 60)).toFixed(2));
    }
    const colon = str.match(/(\d{1,2}):(\d{2})/);
    if (colon) {
      return parseFloat((parseInt(colon[1], 10) + (parseInt(colon[2], 10) / 60)).toFixed(2));
    }
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    return numMatch ? parseFloat(parseFloat(numMatch[1]).toFixed(2)) : 0;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 圖片壓縮與尺寸縮放轉為 Base64 (支援瀏覽器端)
  function imageFileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        return reject(new Error('FileReader not available in current environment'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 本機 Canvas 銳化與降噪預處理 (供 Tesseract.js 離線 OCR 使用)
  function preprocessImageForOCR(file) {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // 轉灰階與對比度增強
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              // 簡單二值化/高對比處理
              const val = gray > 140 ? 255 : (gray < 80 ? 0 : gray);
              data[i] = val;
              data[i + 1] = val;
              data[i + 2] = val;
            }
            ctx.putImageData(imgData, 0, 0);
            canvas.toBlob((blob) => {
              resolve(blob || file);
            }, 'image/jpeg', 0.9);
          } catch (err) {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }

  // 呼叫 OpenRouter 視覺模型
  async function callOpenRouterNemotron(base64Data, apiKey) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': (typeof window !== 'undefined' && window.location.origin) || 'https://github.com/wumoztw/delivery-subsidy-calc',
        'X-Title': 'UberEats Delivery Subsidy Calc'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
        messages: [
          { role: 'system', content: '你是專業的 Uber Eats / Foodpanda 帳單截圖資料提取助理。只能輸出純 JSON，不得有任何 markdown、程式碼框、解說文字。' },
          {
            role: 'user',
            content: [
              { type: 'text', text: '從截圖中提取以下欄位，輸出純 JSON（欄位不存在填0或空字串）：\n{"duration_minutes":整數,"duration_seconds":整數,"raw_duration":"原始時間文字","distance":浮點數,"baseFare":數字,"boostFare":數字,"basePay":數字,"tips":數字,"points":整數,"stacks":整數,"merchant":"商家名稱"}' },
              { type: 'image_url', image_url: { url: base64Data } }
            ]
          }
        ],
        temperature: 0.05,
        response_format: { type: 'json_object' }
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      const err = new Error(`OpenRouter (${response.status}): ${errText}`);
      err.status = response.status;
      err.isRateLimit = (response.status === 429);
      throw err;
    }
    const resData = await response.json();
    return resData.choices?.[0]?.message?.content || '';
  }

  // 呼叫 NVIDIA NIM 視覺模型
  async function callNvidiaNim(base64Data, apiKey) {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-12b-v2-vl',
        messages: [
          { role: 'system', content: '你是專業的 Uber Eats / Foodpanda 帳單截圖資料提取助理。只能輸出純 JSON，不得有任何 markdown、程式碼框、解說文字。' },
          {
            role: 'user',
            content: [
              { type: 'text', text: '從截圖中提取以下欄位，輸出純 JSON（欄位不存在填0或空字串）：\n{"duration_minutes":整數,"duration_seconds":整數,"raw_duration":"原始時間文字","distance":浮點數,"baseFare":數字,"boostFare":數字,"basePay":數字,"tips":數字,"points":整數,"stacks":整數,"merchant":"商家名稱"}' },
              { type: 'image_url', image_url: { url: base64Data } }
            ]
          }
        ],
        temperature: 0.05
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      const err = new Error(`NVIDIA NIM (${response.status}): ${errText}`);
      err.status = response.status;
      err.isRateLimit = (response.status === 429 || response.status === 504);
      throw err;
    }
    const resData = await response.json();
    return resData.choices?.[0]?.message?.content || '';
  }

  // 結構化解析 AI 輸出的 JSON 回應
  function parseAIResponse(rawContent) {
    if (!rawContent) return null;
    try {
      let clean = String(rawContent).trim();
      if (clean.includes('```')) {
        clean = clean.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      }
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        clean = clean.slice(firstBrace, lastBrace + 1);
      }
      const data = JSON.parse(clean);
      const duration = parseDurationToMins(data.raw_duration, data.duration_minutes, data.duration_seconds);
      const distance = Number(data.distance) || 0;
      const basePay = Number(data.basePay) || 0;
      const boostFare = Number(data.boostFare) || 0;
      const baseFare = data.baseFare !== undefined ? Number(data.baseFare) : Math.max(0, basePay - boostFare);
      const tips = Number(data.tips) || 0;
      const incentives = Number(data.incentives) || 0;
      const points = Number(data.points) || (Number(data.stacks) >= 2 ? Number(data.stacks) * 2 : 2);
      const stacks = Math.min(10, Math.max(1, Number(data.stacks) || 1));
      const merchant = String(data.merchant || '').trim().slice(0, 20);

      return { duration, distance, baseFare, boostFare, basePay, tips, incentives, points, stacks, merchant };
    } catch (err) {
      return parseDeliveryText(rawContent);
    }
  }

  // 產生完整綜合戰報 Markdown 文字
  function generateFullReportText(params) {
    const {
      trips,
      totalOrdersCount,
      currentVehicleConfig,
      totalPhysicalHours,
      totalPhysicalMins,
      totalStatutoryHours,
      stackingMultiplier,
      totalDistance,
      avgDistance,
      rate,
      totalLegal,
      totalBasePay,
      totalBoostFare,
      subsidy,
      totalIncome,
      totalTips,
      totalIncentives,
      totalVehicleCost,
      netTotalIncome,
      netHourlyRate,
      realHourlyRate,
      totalPoints,
      perKmIncome,
      tierStats,
      globalInsights,
      tripInsights
    } = params;

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;

    let report = `============================================================
【外送專法綜合結算與戰略診斷戰報】
產生日期：${dateStr}
分析樣本：${trips.length} 趟訂單 (共 ${totalOrdersCount} 單)
============================================================

📊 【一、兩週週期收益結算總評】
------------------------------------------------------------
• 外送載具模式：${currentVehicleConfig.name} (${currentVehicleConfig.speed})
• 累計訂單總數：${trips.length} 趟 (共 ${totalOrdersCount} 單)
• 物理服務總工時：${totalPhysicalHours.toFixed(2)} 小時 (${totalPhysicalMins.toFixed(1)} 分鐘)
• 法定申報總工時 (T_total)：${totalStatutoryHours.toFixed(2)} 小時 (疊單工時放大率 ${stackingMultiplier.toFixed(2)}x)
• 累計總跑單里程：${totalDistance.toFixed(2)} km (均趟 ${avgDistance.toFixed(2)} km)
• 法定保障時薪費率 (P_rate)：NT$ ${rate} / 小時
• 法定最低應得保障 (Total_legal)：NT$ ${Math.round(totalLegal).toLocaleString()}
• 實領行程費用總額 (R_base)：NT$ ${Math.round(totalBasePay).toLocaleString()} (含基本加成 NT$${Math.round(totalBoostFare)})
------------------------------------------------------------
💰 預估差額補貼款 (ΔR)：NT$ ${Math.round(subsidy).toLocaleString()}
💵 兩週實質總收入 (毛額)：NT$ ${Math.round(totalIncome).toLocaleString()} (含小費 NT$${Math.round(totalTips)}、獎勵 NT$${Math.round(totalIncentives)})
⛽ 預估載具營運成本：NT$ ${Math.round(totalVehicleCost).toLocaleString()} (每公里 NT$${currentVehicleConfig.costPerKm})
💎 實質落袋純淨利：NT$ ${Math.round(netTotalIncome).toLocaleString()}
⚡ 實質落袋純時薪：NT$ ${netHourlyRate.toFixed(1)} / 物理小時 (毛時薪 NT$${realHourlyRate.toFixed(1)})
⭐ 累計點數：${totalPoints} 點
📈 每公里實質產值：NT$ ${perKmIncome.toFixed(1)} / km
🏆 戰力評級分佈：SSR級 ${tierStats.ssr} 單 / SR級 ${tierStats.sr} 單 / 正常 ${tierStats.normal} 單 / 需改善 ${tierStats.warning} 單

============================================================
🧠 【二、週期戰略診斷與改善方針】
============================================================
`;

    if (!globalInsights || globalInsights.length === 0) {
      report += `（目前資料量正常，無異常警示）\n\n`;
    } else {
      globalInsights.forEach((item, idx) => {
        report += `【${idx + 1}】${item.icon} ${item.title}\n說明：${item.desc}\n\n`;
      });
    }

    report += `============================================================
🔍 【三、每單逐筆診斷報告與改進建議】
============================================================
`;

    (tripInsights || []).forEach((ins) => {
      report += `------------------------------------------------------------
[單 #${ins.idx + 1}] ${ins.t.merchant || '未填商家'}
• 派單型態：${ins.stacks} 疊單 | 里程：${ins.dist.toFixed(1)} km | 服務時間：${ins.dur} 分鐘
• 戰力評級：[${ins.grade}] | 工時放大倍率：${ins.efficiency.toFixed(2)}x
• 法定最低保障：NT$ ${Math.round(ins.legal)} | 表定車資：NT$ ${ins.basePay} | 差額補貼：+NT$ ${Math.round(ins.subsidy)}
• 診斷分析與建議：\n`;

      if (ins.warnings.length === 0 && ins.tips.length === 0) {
        report += `  - 數據表現平穩，符合常態標準。\n`;
      } else {
        ins.warnings.forEach(w => {
          report += `  - ⚠️ [警示/改善] ${w.text}\n`;
        });
        ins.tips.forEach(tip => {
          report += `  - 🌟 [優勢/保持] ${tip.text}\n`;
        });
      }
      report += `\n`;
    });

    report += `============================================================
產生自：外送專法與疊單收益精算系統 · ${dateStr}
============================================================\n`;

    return report;
  }

  return {
    cleanAndNormalizeText,
    parseDeliveryText,
    parseDurationToMins,
    imageFileToBase64,
    preprocessImageForOCR,
    callOpenRouterNemotron,
    callNvidiaNim,
    parseAIResponse,
    generateFullReportText,
    sleep
  };
});
