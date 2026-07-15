# QA REPORT

日期：2026-07-15

## 本機結果

- `npm run lint`：通過。
- `npm run typecheck`：通過。
- Vitest：3 個測試檔案，10 tests passed，包括所有板端 topic 不超過 32 字元及舊 telemetry topic 接收兼容。
- Vite production build：通過。
- npm audit：0 vulnerabilities。
- Premium tool audit：Ready for premium claim；docs、debug、gates 均齊備。
- Playwright：desktop Chromium 及 390px mobile 合共 8 tests passed。
- 視覺：沒有橫向溢出、console error、page error、破圖或文字重疊。
- MQTT：公開 Broker self-test 成功，FutureLite 狀態維持離線。
- MQTT harness：status、Soil raw 1876、A 鍵事件、LED matching ACK 及 6 秒離線流程通過。
- Debug：`window.__TOOL_DEBUG__` 不含 password、token、API key、provider、proxy 或 prompt。
- 通道診斷：只有 status 時會明確顯示 Soil 缺失；合法 telemetry 後即時轉為正常。
- QA 隔離：本機 Playwright 使用 `hksteam/demo/fla-7q4m9c2p/qa`，桌面及手機依次執行，避免共用公開 topic 造成重複事件。

## 2026-07-15 現場 MQTT 證據

- 連續 12 秒監聽 `hksteam/demo/fla-7q4m9c2p/#`，只收到 seq 118–122 的 `status`，約每兩秒一則。
- 同一時段沒有收到 `telemetry/soil`。
- 發出唯一 ID 的 LED 開及 LED 關指令後，八秒內沒有收到任何 `ack`。
- 結論：網站接收及顯示邏輯正常；目前缺口在板端常駐程式沒有 Soil publish，亦沒有完成 cmd/led → P2 → matching ACK。
- 第二次 12 秒監聽仍只收到 5 則 `status`（seq 116–120），再次確認現場未執行正式完整板端版本。
- 第三次 15 秒監聽 `hksteam/#` 只收到 6 則 `hksteam/demo/fla-7q4m9c2p/status`（seq 378–383），沒有 Soil、button 或 ACK。
- 獨立 MQTT client 發出 `hksteam/demo/fla-7q4m9c2p/cmd/led` 後，Broker 即時回見該指令，但八秒內主板沒有 ACK；證明網站／Broker 發送路徑正常，主板訂閱沒有收到舊長 topic。
- Topic 長度對照：成功 status 32；失敗 cmd/led 33、event/button 38、telemetry/soil 40。新版正式合約已改為 soil 30、btn 29、led 29，ack 29。

## 界線

自動 MQTT harness 已用短 topic 驗證網站與公開 Broker 的完整訊息合約。其後已透過 USB 直接修正及重新啟動實體 FutureLite，Soil 與 LED matching ACK 均已完成現場驗收。

## 實體 FutureLite USB 驗收

- USB：ESP32 `VID_303A PID_4002`，序列埠 `COM4`，USB 磁碟 `E:`。
- 已建立板內修正前備份，正式程式為 `03_futurelite_full_console.py`；Wi-Fi 密碼檔內容沒有被讀取或寫入紀錄。
- 運行版本：`USB-R5`；status 與 Soil 改為每秒輪流發布一則，每個通道約兩秒更新一次。
- 實測心跳：seq 221、223、225，全部含 `ver: USB-R5`。
- 實測 Soil：seq 222 raw 3588；seq 224 raw 3625。
- LED 開：同 ID 自動重發第 2 次後收到 `ok: true, on: true` ACK。
- LED 關：同 ID 自動重發第 2 次後收到 `ok: true, on: false` ACK；測試結束保持關閉。
- M2 只以 B 鍵本機控制，網站不提供風扇／馬達控制。

## 2026-07-15 短 Topic 回歸測試

- `npm run qa`：通過；lint、typecheck、10 unit tests、production build 全部成功。
- `npm run qa:visual`：desktop Chromium 4 tests、390px mobile Chromium 4 tests，合共 8 passed。
- 真實公開 Broker harness：短 `soil`、`btn`、`led`、`ack` 全流程成功。
- QoS 0 漏訊息回歸：harness 故意忽略首個 LED 指令；網站在 1 秒後以相同 command ID 重發並成功收到 ACK。
- UI：桌面及手機沒有 console error、page error、橫向溢出或文字重疊。

## 正式部署驗證

- 正式網址：`https://lwwf-futurelite-iot-lab.pages.dev/`
- Cloudflare deployment：`bd361091-0a6f-4e79-8b79-42232e298f9b`
- Source commit：`c068674`
- HTTP：200
- GitHub：`https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab`
- Live Playwright：desktop Chromium 4 tests passed；390px mobile Chromium 4 tests passed。
- Live MQTT：Broker self-test、status、Soil raw、A 鍵事件、matching ACK、6 秒離線及手動斷線／重連通過。
- Live console／page error：0。
- Live horizontal overflow：0。
- 2026-07-15 新版 live Playwright：desktop／390px mobile 共 8 tests passed；四通道診斷、Soil raw、A 事件、LED matching ACK、自我測試及斷線重連全部通過。
- 第二輪介面本機 Playwright：desktop／390px mobile 8 tests passed；兩端同步入口、Soil raw 量尺及 LED 重試沒有 overflow、console error、page error 或文字重疊。
- 第二輪正式網址 Playwright：desktop／390px mobile 8 tests passed；telemetry、A 事件、LED matching ACK、自我測試、斷線重連、外部程式連結及 Soil 量尺全部通過。
- 短 topic 正式網址 Playwright：desktop／390px mobile 共 8 tests passed；公開 Broker self-test、短 `soil`、`btn`、`led`、matching `ack`、手動斷線／重連及安全 debug 全部通過。
- USB-R5 自動重試正式版 Playwright：desktop／390px mobile 共 8 tests passed；正式網址 HTTP 200，載入新版 bundle，實體主板在線期間 Soil 及 LED matching ACK 流程通過。
