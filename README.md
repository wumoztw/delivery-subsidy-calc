# 外送專法與疊單收益精算系統 (Delivery Subsidy & Stacking Value Engine)

一套基於台灣勞動部外送專法規範、專為外送夥伴（Uber Eats）打造的**兩週週期差額補貼精算**與**疊單實質時薪產值推算系統**。支援原況文字秒貼解析、CSV 匯入/匯出備份、LocalStorage 本地無痕保存與即時作戰模擬。

---

## 🚀 系統功能特色

1. **專法差額精算**：
   - 自動累計總服務工時（$T_{\text{total}}$）。
   - 根據法定保障費率（最低工資 × 1.25，依訂單日期自動或自訂）精算最低應得保底（$\text{Total}_{\text{legal}}$）。
   - 計算補發差額（$\Delta R = \max(0, \text{Total}_{\text{legal}} - R_{\text{base}})$）。
2. **法定工時模式可切換**（會寫入 localStorage）：
   - **獨立累加（對帳）**：法定分鐘 ＝ 本趟記錄的服務時間 × 疊單數。因目前每筆只存「整趟」時間、沒有每張單的接單／送達起迄，這是獨立計時的近似，重疊路段可能被高估。
   - **經驗倍率表**：1 疊 1.00x、2 疊 1.75x、3 疊 2.50x，之後每多 1 疊 +0.75x。用來估產值，**不是**逐單獨立加總。
3. **原況文字剪貼簿秒貼**：
   - 貼上 App 文字後解析時間、距離、費用等欄位。
   - 預覽會標示「已抓到／漏欄」；疊單數**不會**從點數自動推算，預設 1 疊，需在明細手動切換。
4. **費用明細拆解**：基本行程費用、基本報酬加成、行程小計、顧客小費、活動獎勵。
5. **疊單工時放大與實質產值模型**。
6. **CSV 匯入／匯出**（繁中 UTF-8 含 BOM，含「日期時間」欄）。
7. **localStorage 自動儲存**，並可一鍵複製結算戰報。
8. **雙週週期歸屬**：每筆訂單記日期時間，自動歸入 Uber Eats 雙週週期（週一 04:00 切期），可切換查看本期、歷史各期、未標日期或全部。
9. **費率依日期自動**：內建最低工資歷程表，跨年那一期也算得對。
10. **PWA 離線可用**：可加入手機主畫面，訊號不穩時照常開啟。
11. **跑單時薪模擬器**：以「一批」為單位，計入批間空檔、里程成本、平台車資與小費，推算每小時實拿與整期補差額；可用自己的紀錄帶入、三種載具並排、方案 A/B 比較。與主計算器共用 `calc.simulateSession`，跟著工時模式與費率走。

---

## 📐 核心結算公式

### 1. 單筆法定工時

依頂部「法定工時模式」：

- 獨立累加（對帳近似）：$T_{\text{statutory},i} = T_{\text{duration},i} \times \text{stacks}_i$
- 經驗倍率表：$T_{\text{statutory},i} = T_{\text{duration},i} \times m(\text{stacks}_i)$，其中 $m(1)=1$，$m(n)=1+0.75(n-1)$

### 2. 法定基本外送總額

$$\text{Total}_{\text{legal}} = \left(\sum_i T_{\text{statutory},i} / 60\right) \times P_{\text{rate}}$$

- 保障費率 $P_{\text{rate}}$：當年最低工資時薪 × 1.25（2026：\$245）。預設「依日期自動」逐筆套用，也可改為自訂固定值。跨年度的週期會依各趟日期分別計算。

### 3. 基本報酬差額

$$\Delta R = \max(0, \text{Total}_{\text{legal}} - R_{\text{base}})$$

- $R_{\text{base}}$：行程費用 + 基本報酬加成。
- 顧客小費、活動獎勵不計入 $R_{\text{base}}$。

---

## ⚡ 跑單實質時薪產值模型

$$Hourly\_Wage_{\text{real}} = \left( \frac{\sum T_{\text{statutory},i}}{\sum T_{\text{duration},i}} \right) \times P_{\text{rate}}$$

此為「倍率 × 法定費率」的產值估計。落袋純時薪另扣載具每公里成本後，再除以物理小時。

以經驗倍率表、$P_{\text{rate}} = \$245$ 為例：

| 派單型態 | 倍率 | 法定保底實質時薪 |
| :--- | :--- | :--- |
| 1 單 | 1.00x | \$245.00 / 小時 |
| 2 疊 | 1.75x | \$428.75 / 小時 |
| 3 疊 | 2.50x | \$612.50 / 小時 |

獨立累加模式則為 1x / 2x / 3x。

---

## 🎯 時薪最大化作戰參數基準

* **2 疊單黃金標準**：總里程 $\le 2.5\text{ km}$，耗時 $\le 20\text{ 分鐘}$，等餐 $5 \sim 8\text{ 分鐘}$。
* **3 疊單黃金標準**：總里程 $\le 3.5\text{ km}$，耗時 $\le 30\text{ 分鐘}$，等餐 $8 \sim 12\text{ 分鐘}$。
* **拒接紅線**：2 疊單超過 $3.0\text{ km}$ 拒接；3 疊單超過 $4.0\text{ km}$ 拒接；送達點脫離核心熱區之訂單一律拒接。

---

## 🛠️ 本地啟動與使用

純靜態網站，無需後端；可安裝到手機桌面（PWA），斷線也能開。

1. 直接用瀏覽器開啟 `index.html`（此方式不會啟用離線快取），或
2. `python3 -m http.server` 後開 `http://localhost:8000`，或部署到 GitHub Pages。

資料只存在本機 `localStorage`（key：`delivery_subsidy_calc_v3`），不會上傳伺服器。

### 開發

```bash
npm install
npm test            # 單元測試（計算引擎、週期、戰報、解析器）
npm run build       # 複製 vendor/ 並重建 css/app.css
npm run watch:css   # 改樣式時即時重建
```

`css/app.css`、`vendor/` 都有提交到 repo，讓直接開檔也能用；CI 會檢查它們與原始碼同步，改了 `index.html` 或 `js/` 的 class 後記得 `npm run build`。

### 專案結構

| 檔案 | 用途 |
| :--- | :--- |
| `index.html` | 頁面模板（Vue 3 in-DOM template） |
| `js/config.js` | 常數：最低工資表、倍率表、載具成本 |
| `js/calc.js` | **唯一的計算引擎**，網頁與測試共用 |
| `js/cycle.js` | 雙週週期：日期歸期、週期清單 |
| `js/parser.js` | App 文字秒貼解析 |
| `js/report.js` | 戰報／申訴草稿產生器 |
| `js/app.js` | Vue 狀態、儲存、匯入匯出、畫面綁定 |
| `css/src.css` + `tailwind.config.js` | 樣式原始檔，建置成 `css/app.css` |
| `sw.js` + `manifest.webmanifest` + `icons/` | PWA 離線與安裝 |

### 每年更新費率

最低工資通常每年秋天公告、隔年 1/1 生效。在 `js/config.js` 的 `MIN_WAGE_SCHEDULE` 最後加一列即可，例如：

```js
{ from: '2028-01-01', hourly: 新時薪 }
```

### 色票命名

自訂色票都改成專案自有名稱，且一律「數字越大越深」，不會與 Tailwind 內建 `slate`、`amber` 等色名的語意衝突：

| 色票 | 用途 |
| :--- | :--- |
| `ink-*` | 底色、框線、文字（0 = 純白 … 950 = 深紺墨） |
| `leaf-*` / `jade-*` | Uber Eats 綠系主色 |
| `mist-*` | 水藍輔助色 |
| `ochre-*` | 補貼／警示金黃 |
| `crimson-*` | 雷單／刪除紅 |
