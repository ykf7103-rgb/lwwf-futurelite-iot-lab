# PROJECT STATUS

更新日期：2026-07-15

## 專案識別

- Site ID：`lwwf-futurelite-iot-lab`
- 顯示名稱：FutureLite AI IoT 現場監控與控制中心
- 對象：教師及 STEAM／電腦科課堂硬件測試
- 本機源碼：`D:\Google drive sync with T7 Shield\LWWF\Claude code\FUTURE LITE`
- 部署方式：Cloudflare Pages 靜態部署
- 正式網址：`https://lwwf-futurelite-iot-lab.pages.dev/`
- GitHub：`https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab`
- Learning Passport：不接駁（本工具不收集學生進度或帳戶資料）

## 現況

- 2026-07-14：已讀取 `FutureLite_AI_Panghu_Codex_Guide_HK.docx`，並鎖定 Prompt D 的完整網站規格。
- 2026-07-14：完成 Vite＋React＋TypeScript＋MQTT.js 操作台、訊息 parser、ACK matching、自我測試、raw log 及安全 debug contract。
- 2026-07-14：`npm run qa` 通過；3 個 Vitest 檔案共 8 tests passed。
- 2026-07-14：Playwright 桌面及 390px 手機共 8 tests passed，包括公開 Broker self-test、telemetry、A 鍵、matching ACK、6 秒離線、斷線重連、console、debug 及 overflow。
- 2026-07-14：Premium tool audit：Ready；npm audit：0 vulnerabilities。
- 2026-07-14：Cloudflare Pages production deployment `9ad7ab1a-c724-4587-84c3-d6da431338b3` 完成，HTTP 200。
- 2026-07-14：正式網址 Playwright desktop／390px mobile 共 8 tests passed；live Broker self-test、telemetry、A 鍵、matching ACK、6 秒離線及斷線重連全部通過。
- 2026-07-15：現場 MQTT 監聽確認 FutureLite 每約兩秒只發布 `status`（seq 118–122），沒有 `telemetry/soil`；發出 LED 開／關測試後亦沒有收到 `ack`。網站舊版顯示在線並非 Soil 或 LED 已完成。
- 2026-07-15：網站重構為四通道診斷介面，分開顯示 status、Soil、A／B event 及 LED ACK，並加入預期 JSON、硬件配置及板端修復提示。
- 2026-07-15：LED 按鈕只在主板在線時啟用；M2 清楚標示為 B 鍵本機控制，不提供公共網站遙控。
- 2026-07-15：新增 `device/03_futurelite_full_console.py` 參考程式及 `docs/PANGHU_FINAL_SYNC_PROMPT.md`，統一 P1 Soil、P2 LED、M2 本機風扇與 MQTT 合約。
- 2026-07-15：`npm run qa` 通過；Vitest 8 tests passed；`npm run qa:visual` 桌面及 390px 手機 8 tests passed，沒有 console error、page error、橫向溢出或文字重疊。
- 2026-07-15：本機 Playwright 改用獨立 QA topic，避免現場主板及桌面／手機並行測試互相污染。
- 2026-07-15：Cloudflare Pages production deployment `1d5084f5-d2c6-420a-9ced-17adc1d051f1` 完成，來源 commit `5553233`，正式網址已更新。
- 2026-07-15：正式網址 desktop／390px mobile 共 8 tests passed；Broker self-test、telemetry、A 事件、matching ACK、斷線重連、debug、console 及 overflow 全部通過。
- 2026-07-15：第二次現場 MQTT 監聽仍只收到 5 則 `status`（seq 116–120），沒有 Soil 或 ACK，確認 FutureLite 仍在執行不完整板端版本。
- 2026-07-15：網站新增「兩端同步」進度、正式板端程式／伴虎提示入口、Soil 0–4095 raw 量尺及 LED 逾時一鍵重試。
- 2026-07-15：板端參考程式升級為 `2026.07.15-r2`，REPL 會輸出 PUB、RX、ACK、SOIL_ERROR；Soil 讀值直接轉為整數，避免非標準數值型別被靜默略過。
- 2026-07-15：第二輪正式網址 desktop／390px mobile 8 tests passed；兩端同步入口、Soil raw 量尺、telemetry、LED matching ACK、斷線重連及安全 debug 全部通過。

## 部署前閘門

- `npm run qa`
- `npm run qa:visual`
- 敏感字串掃描
- 正式網址桌面及 390px 手機檢查
- Broker self-test（外部網絡容許時）

## 現場待完成項目

網站及 MQTT 合約已自動驗收。現場主板仍須在伴虎更新並執行 `03_futurelite_full_console.py`；目前已證實舊板端程式漏發 Soil，亦沒有處理 LED command／ACK，因此尚未聲稱實體 LED 已被網站控制。

## 下一步

在正式網站按「開啟完整板端程式」或把 `docs/PANGHU_FINAL_SYNC_PROMPT.md` 直接貼到伴虎，完整覆蓋並只執行 `03_futurelite_full_console.py`。REPL 必須同時看到 `PUB .../status` 與 `PUB .../telemetry/soil`，網站 LED 指令則要看到 `RX` 及 `ACK`。
