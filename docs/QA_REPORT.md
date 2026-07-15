# QA REPORT

日期：2026-07-14

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

## 界線

自動 MQTT harness 只驗證網站與公開 Broker 的訊息合約，並不代表實體 FutureLite、Soil 或 LED 已完成現場測試。實體驗收仍須依 Word 指引執行。

## 待執行

- Cloudflare live URL desktop／mobile／MQTT self-test 驗證。
