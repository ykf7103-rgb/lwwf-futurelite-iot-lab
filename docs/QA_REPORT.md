# QA REPORT

日期：2026-07-15

## 本機結果

- `npm run lint`：通過。
- `npm run typecheck`：通過。
- Vitest：3 個測試檔案，8 tests passed。
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

## 界線

自動 MQTT harness 驗證網站與公開 Broker 的完整訊息合約。實體 FutureLite 現場監聽已證實心跳正常，但 Soil 及 LED ACK 尚待伴虎程式更新後再驗收。

## 待執行

- 在伴虎更新並執行 `03_futurelite_full_console.py`。
- 確認網站收到 P1 raw、A／B 各一次，以及連續 10 組 LED 開／關 matching ACK。
- M2 只以 B 鍵本機測試，網站不提供風扇／馬達控制。

## 正式部署驗證

- 正式網址：`https://lwwf-futurelite-iot-lab.pages.dev/`
- Cloudflare deployment：`74b78748-3a4f-4b49-904c-54c6c4d506f4`
- HTTP：200
- GitHub：`https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab`
- Live Playwright：desktop Chromium 4 tests passed；390px mobile Chromium 4 tests passed。
- Live MQTT：Broker self-test、status、Soil raw、A 鍵事件、matching ACK、6 秒離線及手動斷線／重連通過。
- Live console／page error：0。
- Live horizontal overflow：0。
- 2026-07-15 新版 live Playwright：desktop／390px mobile 共 8 tests passed；四通道診斷、Soil raw、A 事件、LED matching ACK、自我測試及斷線重連全部通過。
- 第二輪介面本機 Playwright：desktop／390px mobile 8 tests passed；兩端同步入口、Soil raw 量尺及 LED 重試沒有 overflow、console error、page error 或文字重疊。
