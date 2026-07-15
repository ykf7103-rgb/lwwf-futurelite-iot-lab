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

- 實體 FutureLite、Soil、A／B 按鍵及 LED 現場驗收。

## 正式部署驗證

- 正式網址：`https://lwwf-futurelite-iot-lab.pages.dev/`
- Cloudflare deployment：`9ad7ab1a-c724-4587-84c3-d6da431338b3`
- HTTP：200
- GitHub：`https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab`
- Live Playwright：desktop Chromium 4 tests passed；390px mobile Chromium 4 tests passed。
- Live MQTT：Broker self-test、status、Soil raw、A 鍵事件、matching ACK、6 秒離線及手動斷線／重連通過。
- Live console／page error：0。
- Live horizontal overflow：0。
