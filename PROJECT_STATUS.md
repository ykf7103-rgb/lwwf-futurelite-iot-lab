# PROJECT STATUS

更新日期：2026-07-14

## 專案識別

- Site ID：`lwwf-futurelite-iot-lab`
- 顯示名稱：FutureLite AI 雙向 MQTT 測試台
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

## 部署前閘門

- `npm run qa`
- `npm run qa:visual`
- 敏感字串掃描
- 正式網址桌面及 390px 手機檢查
- Broker self-test（外部網絡容許時）

## 現場唯一未代測項目

實體 FutureLite、Soil、LED 及胖虎板端程式須由使用者按 Word 指引在現場執行。本輪已完成網站及 Broker 端的自動驗收，但沒有聲稱實體 LED 已被遠端控制。

## 下一步

現場完成 Prompt E 後，依 Word 指引連續測試至少 10 組 LED 開／關及 matching ACK。
