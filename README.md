# 外送專法與疊單收益精算系統

![license](https://img.shields.io/badge/license-MIT-green)
![tests](https://img.shields.io/badge/tests-59%20passing-brightgreen)
![Vue](https://img.shields.io/badge/Vue-3.5-42b883)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![PWA](https://img.shields.io/badge/PWA-offline--first-5a0fc8)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-4285f4)

專為台灣外送夥伴（Uber Eats / Foodpanda）打造的**外送專法與實質時薪差額補貼精算系統**，依勞動部外送專法規範，精算雙週週期的保底差額、疊單實質時薪，並提供每日全球外送情報。

👉 **立即使用：<https://wumoztw.github.io/delivery-subsidy-calc/>**

## 核心願景

- 讓外送夥伴自己算得清楚：法定保底、補發差額、疊單到底值不值得，一目了然。
- **100% 本機離線運算（PWA）**：所有訂單資料只存在你的裝置（localStorage），絕不上傳任何伺服器，保護隱私。

## 主要功能

- ⚡ **雙週週期精算與時薪保底**
  - 法定最低保障時薪（最低工資 × 1.25）自動換算，內建歷年最低工資表，依訂單日期自動套用，跨年也正確。
  - 補發差額：$\Delta R = \max(0, \text{Total}_{\text{legal}} - R_{\text{base}})$。
  - 每筆訂單記日期時間，自動歸入雙週帳期（週一 04:00 切期），可切換本期、歷史各期、未標日期或全部。
  - 法定工時模式可切換：**獨立累加（對帳）**（逐單起迄分鐘加總）或**經驗倍率表**（1 疊 1.00x、2 疊 1.75x、3 疊 2.50x，每多 1 疊 +0.75x，用來估產值）。
- 🛵 **外送載具與疊單作戰模擬**
  - 機車／腳踏車／步行三模式並排比較，方案 A/B 對照。
  - 以「一批」為單位，計入批間空檔、里程成本、平台車資與小費，推算每小時實拿與整期補差額。
  - 雙單工時放大精算、空檔成本分析，並可反推目標時薪（1～5 疊各自能拿多少、最少幾疊達標、一批里程上限）。
- 📰 **全球外送情報（新功能）**
  - 每日定時透過 GitHub Actions 抓取全球 Uber 與 Foodpanda 新聞。
  - 由 **Google Gemini 3.1 Flash Lite** 自動篩選 5 則產業與勞權要聞，在地化轉譯為台灣華語，並附原文出處。
- 📋 **外送明細智慧解析**
  - App 文字剪貼簿秒貼，預覽標示「已抓到／漏欄」；疊單數不會自動推算，預設 1 疊，需手動切換。
  - CSV 批量匯入／匯出（繁中 UTF-8 含 BOM），以及手動快速記帳。
  - 費用拆解：基本行程費用、基本報酬加成、行程小計、顧客小費、活動獎勵。
- 📊 **三合一社群戰報生成**
  - 一鍵產生社團分享短貼、申訴草稿與完整雙週對帳單。
  - 對帳單可存成圖片、列印／存 PDF、複製文字。
  - 正式／輕鬆語氣切換（只改顯示文字，不影響計算）。

另提供費率表年度提醒：11、12 月尚無明年最低工資、或跨年後沒有今年費率時，頁面會提示更新 `js/config.js`。

## 技術架構

| 層面 | 內容 |
| --- | --- |
| 前端 | Vue 3.5 多元件架構（`js/components/*.js` 字串模板元件，狀態由 `js/app.js` 以 `provide('dsc')` 提供）、Tailwind CSS（日系戶外手帳美學）、純原生 SVG 向量圖示系統（`js/icons.js`，Tabler/Lucide 俐落風格） |
| 計算核心 | 一律走 `js/calc.js`；`cycle.js`（週期歸屬）、`parser.js`（文字解析）、`statement.js`（對帳單）、`tone.js`（語氣）、`report.js`（戰報） |
| 離線優先 | Service Worker（PWA，可加入手機主畫面）、以 `CACHE_VERSION` 為準的 Cache-Busting 自動快取更新 |
| 自動化（無伺服器） | GitHub Actions 定時工作流（每日台灣時間 06:00）＋ Python 抓取腳本 `scripts/fetch_news.py` ＋ Gemini 3.1 Flash Lite API，結果寫入 `data/daily_news.json` |
| 測試 | 內建 59 項純本機 Node.js 單元測試，涵蓋計算引擎、週期歸屬、文字解析 |

## 快速上手與本機開發

線上版直接開啟即可使用：<https://wumoztw.github.io/delivery-subsidy-calc/>

```bash
npm ci          # 安裝依賴
npm test        # 執行 59 項單元測試（node --test）
npm run build   # 複製 vendor 並編譯 Tailwind CSS
```

修改樣式時可用 `npm run watch:css`。更動 `sw.js` 的 `APP_SHELL` 清單或想強制全部重抓時，把 `CACHE_VERSION` 加一。

### 自架每日新聞抓取

1. Fork 本專案。
2. 到 repo 的 **Settings → Secrets and variables → Actions**，新增 secret `GEMINI_API_KEY`（於 Google AI Studio 申請）。
3. 在 Actions 分頁啟用 `Daily Delivery News`，可手動 `Run workflow` 測試；之後每日自動更新 `data/daily_news.json`。

本機測試：`pip install -r scripts/requirements.txt && GEMINI_API_KEY=xxx python scripts/fetch_news.py`。

## 授權條款

本專案以 [MIT License](https://opensource.org/licenses/MIT) 釋出。

## 免責聲明

本工具所有結果皆為依公開規範與使用者輸入資料所做的**估算**，不構成法律、稅務或任何正式認定；實際補貼與保障以主管機關規定及平台實際結算為準。全球外送情報由 AI 自動篩選與轉譯，可能有疏漏或誤譯，請以原文出處為準。本專案與 Uber、Foodpanda 及勞動部無任何隸屬或合作關係。
