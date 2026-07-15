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
- 2026-07-15：第三次現場 Broker 實測只收到 `status` seq 378–383；網站發出的唯一 `cmd/led` 指令亦確實到達 Broker，但主板沒有任何 ACK。
- 2026-07-15：發現成功的 `status` topic 長度剛好為 32，而失敗的 `cmd/led`、`event/button`、`telemetry/soil` 分別為 33、38、40；這個邊界與現場所有通道結果完全一致。
- 2026-07-15：正式板端合約改用不超過 32 字元的短 topic：`status`、`soil`、`btn`、`led`、`ack`；網站保留舊 Soil／button topic 接收兼容。
- 2026-07-15：板端參考程式升級為 `2026.07.15-r3-short-topic`，加入 topic 長度閘門及 status／soil 之間 150ms 發布間隔；伴虎提示改為只作最小局部修正，避免再次重寫整個程式。
- 2026-07-15：短 topic 版本 `npm run qa` 通過；3 個 Vitest 檔案共 10 tests passed；`npm run qa:visual` desktop／390px mobile 共 8 tests passed。
- 2026-07-15：Cloudflare Pages production deployment `42da41bc-32b9-4478-8945-f106b6a61651` 完成，來源 commit `d716b23`；正式網址短 topic 版本 desktop／390px mobile 共 8 tests passed。
- 2026-07-15：USB 實機識別成功：FutureLite ESP32 同時掛載為 `COM4` 及 `E:`；已直接讀取、備份及修正板內 `03_futurelite_full_console.py`，沒有讀取或記錄 Wi-Fi 密碼檔內容。
- 2026-07-15：實機根因確認為 `getMessage()` 缺少指定 `led` topic，以及 status／Soil 緊接發布時第二則 QoS 0 訊息容易遺失；板內現正執行 `USB-R5`，改為每秒輪流發布一則 status 或 Soil。
- 2026-07-15：公開 Broker 實機驗收成功：連續收到 `USB-R5` status seq 221／223／225、Soil raw 3588／3625，LED 開及 LED 關均在相同 command ID 第二次發送時收到 matching ACK，最後狀態為 LED 關。
- 2026-07-15：網站加入同 command ID 每秒自動重試、5 秒 ACK 上限；本機 `npm run qa` 通過 10 tests，`npm run qa:visual` desktop／390px mobile 共 8 tests passed，測試會刻意忽略首個 LED 指令以驗證重試。
- 2026-07-15：Cloudflare Pages production deployment `bd361091-0a6f-4e79-8b79-42232e298f9b` 完成，來源 commit `c068674`，正式網址 HTTP 200。
- 2026-07-15：USB-R5 正式網址 desktop／390px mobile 共 8 tests passed；即時 MQTT、Soil raw、LED matching ACK、Broker 自我測試、斷線重連、console、debug 及 overflow 全部通過。
- 2026-07-15：重新開機後 Wi-Fi／MQTT 失效的根因是板端只檢查連線，沒有呼叫 FutureOS 儲存設定的 `try_auto_connect()`；已升級為 `USB-R6-AUTO-WIFI`，啟動及斷線時均會自動重連，沒有讀取或顯示 SSID／密碼。
- 2026-07-15：USB 啟動檔已整理為唯一正式 `code.py`；7 個舊測試／診斷／備份程式改為 `.bak`，不再混入 `.py` 啟動清單，原檔全部保留。
- 2026-07-15：R6 重新啟動實測收到 status seq 7／9 及 Soil seq 8 raw 3597；LED 開在第 2 次重試 ACK，LED 關在第 3 次重試 ACK，最後維持關閉。
- 2026-07-15：板內 `E:\code.py` 與 GitHub 正式源碼 SHA-256 完全相同：`57B9C21DEBF4117E50A6EE7D8314E8D92F7DCA1C134723DB97A4F4072DC7570D`。
- 2026-07-15：完成 `docs/SECURE_MOTOR_CONTROL_RESEARCH.md`；首選另建 Cloudflare Access＋Tunnel＋Windows USB COM4 Gateway 的 `lwwf-futurelite-actuator-lab`，讓 M1／M2 指令不經公開 MQTT，並加入限時、自動停止、急停及 matching ACK。

## 部署前閘門

- `npm run qa`
- `npm run qa:visual`
- 敏感字串掃描
- 正式網址桌面及 390px 手機檢查
- Broker self-test（外部網絡容許時）

## 現場完成狀態

USB 主板與公開 Broker 的自動 Wi-Fi 重連、Soil 上傳、LED 開、LED 關及 matching ACK 已完成實機驗收。板內保留修正前備份；M2 風扇繼續只由實體 B 鍵本機控制，不經公開網站遙控。

## 下一步

FutureLite 重新開機後選「快速執行」→ `code.py`；程式會使用 FutureOS 已儲存的網絡設定自動連接 Wi-Fi 及 MQTT。若板端程式日後被伴虎重新產生，應以 `device/03_futurelite_full_console.py` 的 USB 實機驗證版本為準，不再覆蓋成舊版。
