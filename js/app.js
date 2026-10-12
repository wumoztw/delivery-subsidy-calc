    const { createApp, ref, computed, watch, onMounted } = Vue;
    const Calc = window.DeliveryCalc;
    const Cfg = window.DeliveryConfig;
    const Cycle = window.DSC.cycle;

    const { STORAGE_KEY, LEGACY_STORAGE_KEY } = Cfg;

    // datetime-local 使用的本地時間字串（YYYY-MM-DDTHH:mm，不含時區，以手機當地時間解讀）
    const toLocalInput = (date) => {
      const d = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(d.getTime())) return '';
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    const nowLocal = () => toLocalInput(new Date());
    const normalizeDate = (value) => (value ? toLocalInput(value) : '');

    // 產生穩定的訂單 id（供 v-for :key 使用，避免刪除/重排時用陣列 index 造成 DOM 錯位）
    let __tripIdCounter = 0;
    const makeTripId = () => {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      __tripIdCounter += 1;
      return `trip-${Date.now()}-${__tripIdCounter}`;
    };
    // 確保單筆訂單物件擁有 id，沒有的話（例如舊資料、CSV 匯入）就補一個
    const ensureTripId = (t) => (t && t.id ? t : { ...t, id: makeTripId() });

    createApp({
      setup() {
        const activeTab = ref('dashboard');
        const rate = ref(Cfg.DEFAULT_RATE);
        const rateMode = ref('auto'); // 'auto'（依訂單日期查最低工資表）| 'custom'
        const statutoryMode = ref('table'); // 'independent' | 'table'
        const trips = ref([]);
        const cycleFilter = ref('current'); // 'current' | 'all' | 'undated' | 週期代碼 YYYY-MM-DD
        const storageStatus = ref('ok'); // 'ok' | 'corrupt' | 'write_failed'
        const newTrip = ref({ duration: '', distance: '', baseFare: '', boostFare: '', basePay: '', tips: '', incentives: '', points: '', stacks: 1, merchant: '', date: nowLocal() });
        
        // 彈窗控制
        const showPasteModal = ref(false);
        const showManualModal = ref(false);
        const pasteText = ref('');

        const copyBtnText = ref('複製完整社團戰報');
        const reportCopyMode = ref('full');
        const customPhysicalHours = ref(null);

        // 全域外送載具模式：步行 (walk) / 腳踏車 (bike) / 機車 (motorcycle)
        const vehicleMode = ref(localStorage.getItem('delivery_calc_vehicle_mode') || 'motorcycle');
        const simVehicleMode = ref(vehicleMode.value);
        const tacticsGuideTab = ref(vehicleMode.value);
        const simOrders = ref(vehicleMode.value === 'motorcycle' ? 3 : 2);
        const simAvgTripMins = ref(vehicleMode.value === 'bike' ? 24 : 18);
        const simPhysicalMins = ref(vehicleMode.value === 'motorcycle' ? 25 : (vehicleMode.value === 'bike' ? 30 : 28));

        const vehicleConfigMap = Cfg.vehicleConfigMap;

        const currentVehicleConfig = computed(() => vehicleConfigMap[vehicleMode.value] || vehicleConfigMap.motorcycle);

        const setGlobalVehicleMode = (mode) => {
          vehicleMode.value = mode;
          simVehicleMode.value = mode;
          tacticsGuideTab.value = mode;
          try {
            localStorage.setItem('delivery_calc_vehicle_mode', mode);
          } catch(e){}
          setVehicleMode(mode);
        };

        const setVehicleMode = (mode) => {
          simVehicleMode.value = mode;
          tacticsGuideTab.value = mode;
          if (mode === 'walk') {
            simOrders.value = 2;
            simAvgTripMins.value = 18;
            simPhysicalMins.value = 28;
          } else if (mode === 'bike') {
            simOrders.value = 2;
            simAvgTripMins.value = 24;
            simPhysicalMins.value = 30;
          } else if (mode === 'motorcycle') {
            simOrders.value = 3;
            simAvgTripMins.value = 18;
            simPhysicalMins.value = 25;
          }
        };

        // 自動同步手動輸入金額
        const syncNewTripBasePay = () => {
          const fare = Number(newTrip.value.baseFare) || 0;
          const boost = Number(newTrip.value.boostFare) || 0;
          if (fare > 0 || boost > 0) {
            newTrip.value.basePay = fare + boost;
          }
        };

        // 自動同步明細卡片內金額
        const syncTripBasePay = (t) => {
          const fare = Number(t.baseFare) || 0;
          const boost = Number(t.boostFare) || 0;
          if (fare > 0 || boost > 0) {
            t.basePay = fare + boost;
          }
        };

        // 從 LocalStorage 載入資料與監聽跨分頁同步
        let persistBlocked = false;

        onMounted(() => {
          let saved = null;
          try {
            saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
            if (saved) {
              const data = JSON.parse(saved);
              if (data.rate && Number(data.rate) > 0) rate.value = Number(data.rate);
              if (data.rateMode === 'auto' || data.rateMode === 'custom') {
                rateMode.value = data.rateMode;
              } else if (data.rate && Number(data.rate) !== Cfg.DEFAULT_RATE) {
                // 舊資料改過費率 → 視為自訂，避免默默換掉使用者的設定
                rateMode.value = 'custom';
              }
              if (data.statutoryMode === 'independent' || data.statutoryMode === 'table') {
                statutoryMode.value = data.statutoryMode;
              }
              if (Array.isArray(data.trips)) {
                trips.value = data.trips.map(t => ensureTripId({
                  ...t,
                  baseFare: t.baseFare !== undefined ? Number(t.baseFare) || 0 : Math.max(0, (Number(t.basePay) || 0) - (Number(t.boostFare) || 0)),
                  boostFare: Number(t.boostFare) || 0,
                  stacks: Math.min(10, Math.max(1, Math.round(Number(t.stacks) || 1))),
                  date: normalizeDate(t.date)
                }));
                // 舊資料都沒有日期時，預設顯示全部，免得本期畫面一片空白
                if (trips.value.length && !trips.value.some((t) => t.date)) cycleFilter.value = 'all';
              }
            }
          } catch (e) {
            console.error('載入 LocalStorage 失敗 (資料損毀防禦已啟動):', e);
            persistBlocked = true;
            storageStatus.value = 'corrupt';
            try {
              if (saved) {
                const backupPrefix = `${STORAGE_KEY}__corrupt_`;
                const history = [];
                for (let i = 0; i < localStorage.length; i += 1) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith(backupPrefix)) history.push(key);
                }
                history.sort((a, b) => Number(a.slice(backupPrefix.length)) - Number(b.slice(backupPrefix.length)));
                while (history.length >= 3) localStorage.removeItem(history.shift());
                localStorage.setItem(`${backupPrefix}${Date.now()}`, saved);
              }
            } catch (err) {}
          }

          // 跨分頁即時資料同步
          window.addEventListener('storage', (event) => {
            if (persistBlocked) return;
            if ((event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) && event.newValue) {
              try {
                const data = JSON.parse(event.newValue);
                if (data.rate && Number(data.rate) > 0) rate.value = Number(data.rate);
                if (data.rateMode === 'auto' || data.rateMode === 'custom') rateMode.value = data.rateMode;
                if (data.statutoryMode === 'independent' || data.statutoryMode === 'table') {
                  statutoryMode.value = data.statutoryMode;
                }
                if (Array.isArray(data.trips)) trips.value = data.trips.map(ensureTripId);
              } catch (e) {}
            }
          });
        });

        // 自動保存至 LocalStorage（防抖 400ms：避免逐筆訂單打字時每個按鍵都整包序列化）
        let saveToStorageTimer = null;
        const persistToStorage = () => {
          if (persistBlocked) return false;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: rate.value, rateMode: rateMode.value, statutoryMode: statutoryMode.value, trips: trips.value }));
            storageStatus.value = 'ok';
            return true;
          } catch (e) {
            console.error('儲存失敗:', e);
            storageStatus.value = 'write_failed';
            return false;
          }
        };
        watch([rate, rateMode, statutoryMode, trips], () => {
          clearTimeout(saveToStorageTimer);
          saveToStorageTimer = setTimeout(persistToStorage, 400);
        }, { deep: true });

        // 頁面關閉/切背景前，若還有排隊中的儲存立即補寫一次，避免防抖期間資料遺失
        window.addEventListener('beforeunload', () => {
          if (saveToStorageTimer) { clearTimeout(saveToStorageTimer); persistToStorage(); }
        });
        window.addEventListener('pagehide', () => {
          if (saveToStorageTimer) { clearTimeout(saveToStorageTimer); persistToStorage(); }
        });
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden' && saveToStorageTimer) {
            clearTimeout(saveToStorageTimer);
            persistToStorage();
          }
        });

        // 新增單筆
        const addTrip = () => {
          if (!newTrip.value.duration) return;
          const bFare = Number(newTrip.value.baseFare) || 0;
          const bBoost = Number(newTrip.value.boostFare) || 0;
          const bPay = Number(newTrip.value.basePay) || (bFare + bBoost);

          trips.value.push({
            id: makeTripId(),
            duration: Number(newTrip.value.duration) || 0,
            distance: Number(newTrip.value.distance) || 0,
            baseFare: bFare || (bPay ? Math.max(0, bPay - bBoost) : 0),
            boostFare: bBoost,
            basePay: bPay,
            tips: Number(newTrip.value.tips) || 0,
            incentives: Number(newTrip.value.incentives) || 0,
            points: Number(newTrip.value.points) || 0,
            stacks: Number(newTrip.value.stacks) || 1,
            merchant: newTrip.value.merchant || '',
            date: normalizeDate(newTrip.value.date) || nowLocal()
          });
          newTrip.value = { duration: '', distance: '', baseFare: '', boostFare: '', basePay: '', tips: '', incentives: '', points: '', stacks: 1, merchant: '', date: nowLocal() };
        };

        const addTripFromModal = () => {
          addTrip();
          showManualModal.value = false;
        };

        // 開啟秒貼彈窗
        const openPasteModal = () => {
          pasteText.value = '';
          showPasteModal.value = true;
        };

        // 從剪貼簿直接讀取
        const readClipboard = async () => {
          try {
            if (navigator.clipboard && navigator.clipboard.readText) {
              const text = await navigator.clipboard.readText();
              if (text) {
                pasteText.value = text;
              } else {
                alert('剪貼簿目前為空，請先複製文字。');
              }
            } else {
              alert('您的瀏覽器未開放自動讀取剪貼簿權限，請直接在文字框內長按貼上。');
            }
          } catch (err) {
            console.warn('讀取剪貼簿失敗:', err);
            alert('請直接在下方文字框長按「貼上」即可！');
          }
        };

        // 切換疊單數 (1 -> 2 -> 3 -> 1)
        const cycleStacks = (t) => {
          const current = t.stacks || 1;
          t.stacks = current >= 10 ? 1 : current + 1;
        };

        // ── 計算一律交給 js/calc.js（測試保護的同一套程式） ──
        const calcOpts = computed(() => ({
          rate: rate.value,
          rateMode: rateMode.value,
          statutoryMode: statutoryMode.value,
          vehicleMode: vehicleMode.value
        }));
        const getStackMultiplier = (stacks) => Calc.getStackMultiplier(stacks, statutoryMode.value);
        const statutoryModeLabel = computed(() =>
          statutoryMode.value === 'independent'
            ? '獨立累加（物理分鐘 × 疊單數，對帳近似）'
            : '經驗倍率表（1 / 1.75 / 2.50…）'
        );
        const getTripStatutoryMins = (t) => Calc.getTripStatutoryMins(t, calcOpts.value);
        const tripLegal = (t) => Math.round(Calc.calcTrip(t, calcOpts.value).legal);
        const getTierLabel = (t) => Calc.getTierLabel(t, calcOpts.value);
        const getTierBadgeClass = (t) => Calc.getTierBadgeClass(t, calcOpts.value);

        // ── 費率顯示 ──
        const rateScheduleHint = Cfg.MIN_WAGE_SCHEDULE
          .map((r) => `${r.from.slice(0, 4)} 起：最低工資 ${r.hourly} → 保障 ${r.hourly * Cfg.RATE_FACTOR}`)
          .join('\n');

        // ── 對帳週期 ──
        const currentCycleInfo = computed(() => Cycle.getBiweeklyCycleInfo());
        const currentCycleKey = computed(() => Cycle.getCycleKey(new Date()));
        const cycleGroups = computed(() => Cycle.groupTripsByCycle(trips.value));
        const pastCycleOptions = computed(() => cycleGroups.value.cycles.filter((c) => c.key !== currentCycleKey.value));
        const visibleTrips = computed(() => {
          const f = cycleFilter.value;
          if (f === 'all') return trips.value;
          if (f === 'undated') return trips.value.filter((t) => !Cycle.getCycleKey(t.date));
          const key = f === 'current' ? currentCycleKey.value : f;
          return trips.value.filter((t) => Cycle.getCycleKey(t.date) === key);
        });
        const selectedCycleInfo = computed(() => {
          const f = cycleFilter.value;
          if (f === 'current') return currentCycleInfo.value;
          if (f === 'all' || f === 'undated') return { cycleLabel: f === 'all' ? '全部訂單' : '未標日期訂單', dayInCycle: null };
          return Cycle.getCycleInfoByKey(f) || currentCycleInfo.value;
        });
        const cycleFilterLabel = computed(() => {
          const f = cycleFilter.value;
          if (f === 'current') return `本期 第 ${currentCycleInfo.value.dayInCycle} / 14 天`;
          return selectedCycleInfo.value.cycleLabel;
        });

        const removeTrip = (t) => {
          const i = trips.value.indexOf(t);
          if (i >= 0) trips.value.splice(i, 1);
        };
        const clearVisibleTrips = () => {
          const n = visibleTrips.value.length;
          if (!n || !window.confirm(`確定刪除目前畫面上的 ${n} 筆訂單？`)) return;
          const drop = new Set(visibleTrips.value);
          trips.value = trips.value.filter((t) => !drop.has(t));
        };

        // CSV 匯入
        const handleFileUpload = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const formatted = results.data.map(row => {
                const dur = parseFloat(row.duration_mins || row.duration || row['服務時間_分鐘'] || row['服務時間'] || 0);
                const dist = parseFloat(row.distance || row.km || row['距離_公里'] || row['距離'] || 0);
                const bFare = parseFloat(row.base_fare || row['基本行程費用_NT'] || row['基本行程費用'] || 0);
                const bBoost = parseFloat(row.boost_fare || row.boostFare || row['加成_NT'] || row['基本報酬加成_NT'] || 0);
                let bPay = parseFloat(row.base_pay || row.basePay || row['行程費用_NT'] || row['基本報酬_NT'] || row['行程費用_合計_NT'] || 0);
                if (!bPay && (bFare || bBoost)) bPay = bFare + bBoost;

                return {
                  id: makeTripId(),
                  duration: dur,
                  distance: dist,
                  baseFare: bFare || (bPay ? Math.max(0, bPay - bBoost) : 0),
                  boostFare: bBoost,
                  basePay: bPay,
                  tips: parseFloat(row.tips || row['小費_NT'] || row['顧客小費_NT'] || row['小費'] || 0),
                  incentives: parseFloat(row.incentives || row['活動獎勵_NT'] || row['獎勵'] || 0),
                  points: parseFloat(row.points || row['點數'] || 0),
                  stacks: parseInt(row.stacks || row['疊單數'] || 1, 10),
                  merchant: row.merchant || row['商家'] || '',
                  date: normalizeDate(row.date || row['日期時間'] || row['日期'] || '')
                };
              }).filter(t => t.duration > 0 || t.basePay > 0);
              
              trips.value.push(...formatted);
              alert(`成功匯入 ${formatted.length} 筆訂單明細！`);
            }
          });
          e.target.value = '';
        };

        // CSV 匯出
        const exportCSV = () => {
          if (trips.value.length === 0) {
            alert('目前無訂單資料可供匯出！');
            return;
          }
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
          const csvData = trips.value.map((t, idx) => ({
            '序號': idx + 1,
            '日期時間': t.date || '',
            '產生日期': dateStr,
            '服務時間_分鐘': t.duration,
            '距離_公里': t.distance || 0,
            '疊單數': t.stacks || 1,
            '基本行程費用_NT': t.baseFare !== undefined ? t.baseFare : Math.max(0, (t.basePay - (t.boostFare||0))),
            '基本報酬加成_NT': t.boostFare || 0,
            '行程費用_合計_NT': t.basePay,
            '顧客小費_NT': t.tips || 0,
            '活動獎勵_NT': t.incentives || 0,
            '點數': t.points || 0,
            '戰力等級': getTierLabel(t),
            '商家': t.merchant || ''
          }));
          const csvString = '\uFEFF' + Papa.unparse(csvData);
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `外送專法跑單明細_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1500);
        };

        // 委託獨立測試模組 js/parser.js 解析（若離線未載入則提供兜底）
        const parseDeliveryText = (rawText) => {
          if (window.DSC && window.DSC.parser && typeof window.DSC.parser.parseDeliveryText === 'function') {
            return window.DSC.parser.parseDeliveryText(rawText);
          }
          // 兜底簡易解析
          return {
            duration: 0,
            distance: 0,
            baseFare: 0,
            boostFare: 0,
            basePay: 0,
            tips: 0,
            incentives: 0,
            points: 0,
            stacks: 1,
            merchant: '',
            found: {},
            warnings: []
          };
        };

        // 即時計算秒貼萃取結果
        const parsedPasteTrip = computed(() => parseDeliveryText(pasteText.value));

        const pasteFieldStatus = computed(() => {
          const t = parsedPasteTrip.value;
          const foundMap = t.found || {};
          const catalog = [
            { key: 'duration', label: '服務時間', core: true },
            { key: 'distance', label: '距離', core: true },
            { key: 'basePay', label: '行程費用合計', core: true },
            { key: 'baseFare', label: '基本行程費', core: false },
            { key: 'boostFare', label: '基本報酬加成', core: false },
            { key: 'tips', label: '小費', core: false },
            { key: 'points', label: '點數', core: false },
            { key: 'merchant', label: '商家', core: false }
          ];
          const found = [];
          const missing = [];
          catalog.forEach((f) => {
            const item = { key: f.key, label: f.label };
            if (foundMap[f.key]) found.push(item);
            else missing.push(item);
          });
          const notes = [
            { key: 'stacks', label: '疊單數未從文字判斷，預設 1 疊，請加入後手動切換' }
          ];
          if (!foundMap.incentives) {
            notes.push({ key: 'incentives', label: '活動獎勵目前無法從文字解析' });
          }
          return { found, missing, notes };
        });

        // 確認加入秒貼訂單
        const confirmPasteTrip = () => {
          const t = parsedPasteTrip.value;
          if (t.duration > 0 || t.basePay > 0) {
            const { found, ...tripFields } = t;
            trips.value.push({ ...tripFields, id: makeTripId(), date: nowLocal() });
            showPasteModal.value = false;
            pasteText.value = '';
            alert('已成功秒貼並加入訂單清單！');
          } else {
            alert('未能辨識出有效數據，請確認貼上的文字包含時間或費用。');
          }
        };

        // 載入預設示範數據
        const loadSampleData = () => {
          trips.value = [
            { id: makeTripId(), duration: 14.2, distance: 2.1, baseFare: 60, boostFare: 12, basePay: 72, tips: 35, incentives: 0, points: 2, stacks: 1, merchant: '熱門便當店 (示範單)' , date: nowLocal() },
            { id: makeTripId(), duration: 21.5, distance: 2.4, baseFare: 93, boostFare: 22, basePay: 115, tips: 0, incentives: 0, points: 4, stacks: 2, merchant: '連鎖鍋物 (示範雙疊)' , date: nowLocal() },
            { id: makeTripId(), duration: 28.0, distance: 3.2, baseFare: 127, boostFare: 28, basePay: 155, tips: 40, incentives: 20, points: 6, stacks: 3, merchant: '百貨美食街 (示範三疊)' , date: nowLocal() },
            { id: makeTripId(), duration: 12.0, distance: 1.3, baseFare: 50, boostFare: 0, basePay: 50, tips: 15, incentives: 0, points: 2, stacks: 1, merchant: '人氣手搖茶 (示範單)' , date: nowLocal() }
          ];
          alert('已載入示範跑單數據（含基本行程費、加成與小費拆解）！');
        };

                // 將畫面結算資料交由共用戰報模組產生，避免 UI 與報表各自計算。
        const getReportSummary = () => summary.value;
        const getReportTrips = () => visibleTrips.value;
        const getReportCycle = () => selectedCycleInfo.value;
        const getReportContext = () => calcOpts.value;

        const generateFullReportText = () => {
          const report = window.DSC && window.DSC.report;
          if (!report) return '戰報模組尚未載入。';
          return report.generateFullReport(getReportSummary(), getReportTrips(), getReportCycle(), getReportContext());
        };

        // 一鍵複製所選戰報格式
        const copyReport = () => {
          if (visibleTrips.value.length === 0) {
            alert('目前篩選的週期沒有訂單資料！');
            return;
          }
          const report = window.DSC && window.DSC.report;
          if (!report) {
            alert('戰報模組尚未載入，請重新整理頁面。');
            return;
          }
          const args = [getReportSummary(), getReportTrips(), getReportCycle(), getReportContext()];
          const text = reportCopyMode.value === 'short'
            ? report.generateShortPost(...args)
            : reportCopyMode.value === 'complaint'
              ? report.generateLaborComplaintDraft(...args)
              : report.generateFullReport(...args);
          const label = reportCopyMode.value === 'short' ? '短貼' : reportCopyMode.value === 'complaint' ? '申訴草稿' : '完整社團戰報';
          navigator.clipboard.writeText(text).then(() => {
            copyBtnText.value = `✅ 已複製${label}！`;
            setTimeout(() => { copyBtnText.value = '複製完整社團戰報'; }, 2500);
          });
        };

        // 一鍵下載完整戰報 (.md)
        const downloadReport = () => {
          if (visibleTrips.value.length === 0) {
            alert('目前篩選的週期沒有訂單可供下載戰報！');
            return;
          }
          const text = generateFullReportText();
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const blob = new Blob(['\uFEFF' + text], { type: 'text/markdown;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `外送專法綜合結算戰報_${dateStr}.md`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1500);
        };

        // 計算屬性：整期彙總（只算目前篩選的週期）
        const summary = computed(() => Calc.calcSummary(visibleTrips.value, calcOpts.value));
        const totalPhysicalMins = computed(() => summary.value.totalPhysicalMins);
        const totalPhysicalHours = computed(() => summary.value.totalPhysicalHours);
        const totalStatutoryMins = computed(() => summary.value.totalStatutoryMins);
        const totalStatutoryHours = computed(() => summary.value.totalStatutoryHours);
        const totalOrdersCount = computed(() => summary.value.totalOrdersCount);
        const effectiveRate = computed(() => summary.value.effectiveRate);
        const totalLegal = computed(() => summary.value.totalLegal);
        const totalBasePay = computed(() => summary.value.totalBasePay);
        const totalBoostFare = computed(() => summary.value.totalBoostFare);
        const totalTips = computed(() => summary.value.totalTips);
        const totalIncentives = computed(() => summary.value.totalIncentives);
        const totalPoints = computed(() => summary.value.totalPoints);
        const totalDistance = computed(() => summary.value.totalDistance);
        const avgBasePay = computed(() => summary.value.avgBasePay);
        const avgDistance = computed(() => summary.value.avgDistance);
        const avgBoostRate = computed(() => summary.value.avgBoostRate);
        const subsidy = computed(() => summary.value.subsidy);
        const totalIncome = computed(() => summary.value.totalIncome);
        const totalVehicleCost = computed(() => summary.value.totalVehicleCost);
        const netTotalIncome = computed(() => summary.value.netTotalIncome);
        const netHourlyRate = computed(() => summary.value.netHourlyRate);
        const perKmIncome = computed(() => summary.value.perKmIncome);
        const perKmBase = computed(() => summary.value.perKmBase);
        const tipPercentage = computed(() => summary.value.tipPercentage);
        const stackingMultiplier = computed(() => summary.value.stackingMultiplier);
        const realHourlyRate = computed(() => summary.value.realHourlyRate);
        const displayRateText = computed(() => {
          const sm = summary.value;
          if (sm.mixedRates) return `${Number(sm.ratesUsed[0].toFixed(2))}～${Number(sm.ratesUsed[sm.ratesUsed.length - 1].toFixed(2))}`;
          const r = sm.totalStatutoryHours > 0 ? sm.effectiveRate : Calc.getTripRate({ date: nowLocal() }, calcOpts.value);
          return String(Number(r.toFixed(2)));
        });

        // 收入組成圓餅圖 computed（純 SVG stroke-dasharray 甜甜圈圖）
        const pieSlices = computed(() => {
          const C = 2 * Math.PI * 70; // 圓周長 ≈ 439.82
          const base       = Number(totalBasePay.value)   || 0;
          const sub        = Math.max(0, Number(subsidy.value)) || 0;
          const tips       = Number(totalTips.value)       || 0;
          const incentives = Number(totalIncentives.value) || 0;
          const total = base + sub + tips + incentives;
          if (total <= 0) return [];

          const raw = [
            { label: '基本車資', value: base,       color: '#34d399' },
            { label: '差額補貼', value: sub,        color: '#fbbf24' },
            { label: '平台獎勵', value: incentives, color: '#38bdf8' },
            { label: '顧客小費', value: tips,       color: '#f472b6' },
          ].filter(item => item.value > 0); // 過濾掉 0 值項目，避免空切片

          let cumulative = 0;
          return raw.map(item => {
            const pct  = (item.value / total) * 100;
            const dash = (item.value / total) * C;
            const gap  = C - dash;
            const offset = -cumulative;
            cumulative += dash;
            return { ...item, pct, dash, gap, offset };
          });
        });


        // ── 每單診斷、整體建議、戰力統計 ──
        const tripInsights = computed(() => Calc.computeTripInsights(visibleTrips.value, calcOpts.value));
        const globalInsights = computed(() => Calc.computeGlobalInsights(visibleTrips.value, calcOpts.value, summary.value));
        const tierStats = computed(() => Calc.computeTierStats(visibleTrips.value, calcOpts.value));

        const tipHitRate = computed(() => {
          const list = visibleTrips.value;
          if (list.length === 0) return 0;
          return (list.filter((t) => (t.tips || 0) > 0).length / list.length) * 100;
        });

        const avgTipAmount = computed(() => {
          const list = visibleTrips.value;
          return list.length ? totalTips.value / list.length : 0;
        });

        // 模擬器計算（含 3 種載具成本與純淨時薪計算）
        const simMultiplier = computed(() => {
          const totalSimMins = simOrders.value * simAvgTripMins.value;
          if (simPhysicalMins.value <= 0) return 1.0;
          return totalSimMins / simPhysicalMins.value;
        });

        const simRealHourlyWage = computed(() => {
          return simMultiplier.value * Calc.getTripRate({ date: nowLocal() }, calcOpts.value);
        });

        const simVehicleCostPerHour = computed(() => {
          return (vehicleConfigMap[simVehicleMode.value] || vehicleConfigMap.motorcycle).costPerHour;
        });

        const simNetHourlyWage = computed(() => {
          return Math.max(0, simRealHourlyWage.value - simVehicleCostPerHour.value);
        });

        return {
          activeTab, rate, rateMode, rateScheduleHint, displayRateText, statutoryMode, statutoryModeLabel, trips, visibleTrips, newTrip, storageStatus,
          cycleFilter, cycleFilterLabel, cycleGroups, pastCycleOptions, currentCycleInfo, removeTrip, clearVisibleTrips, tripLegal,
          showPasteModal, showManualModal, pasteText, parsedPasteTrip, pasteFieldStatus,
          copyBtnText, reportCopyMode, customPhysicalHours,
          vehicleMode, setGlobalVehicleMode, currentVehicleConfig, totalVehicleCost, netTotalIncome, netHourlyRate, simVehicleMode, setVehicleMode, tacticsGuideTab, simOrders, simAvgTripMins, simPhysicalMins, simMultiplier, simRealHourlyWage, simVehicleCostPerHour, simNetHourlyWage,
          totalPhysicalMins, totalPhysicalHours, totalStatutoryMins, totalStatutoryHours, totalOrdersCount,
          totalLegal, totalBasePay, totalBoostFare, totalTips, totalIncentives,
          totalPoints, totalDistance, avgBasePay, avgDistance, avgBoostRate,
          perKmIncome, perKmBase, tipPercentage,
          subsidy, totalIncome, stackingMultiplier, realHourlyRate, pieSlices,
          tripInsights, globalInsights,
          tierStats, tipHitRate, avgTipAmount,
          syncNewTripBasePay, syncTripBasePay,
          addTrip, addTripFromModal, openPasteModal, readClipboard, confirmPasteTrip,
          cycleStacks, getTripStatutoryMins, getStackMultiplier, getTierLabel, getTierBadgeClass,
          handleFileUpload, exportCSV, loadSampleData, copyReport, downloadReport, generateFullReportText
        };
      }
    }).mount('#app');

    // PWA：註冊離線快取（file:// 直接開檔時瀏覽器不支援，略過即可）
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service Worker 註冊失敗：', err));
      });
    }
