# FUTURE LITE 專案指令

- 正式源碼：本資料夾。
- 網站名稱：FutureLite AI 雙向 MQTT 測試台。
- Site ID：`lwwf-futurelite-iot-lab`。
- 對象：教師、STEAM／電腦科課堂及硬件測試人員。
- 堆疊：Vite、React、TypeScript、MQTT.js；不加入登入、AI、資料庫或學生資料。
- 固定測試 Broker：`wss://broker.emqx.io:8084/mqtt`；只可傳測試數值、按鍵事件及 LED 指令。
- 固定 topic prefix：`hksteam/demo/fla-7q4m9c2p`。
- 不把 Soil raw 顯示成百分比。
- 風扇／馬達不得由此網站控制。
- 所有學生及教師可見文字使用香港繁體中文書面語。
- 每次正式部署前必須通過 `npm run qa` 及 `npm run qa:visual`，並更新 `PROJECT_STATUS.md` 與 `docs/QA_REPORT.md`。
- `window.__TOOL_DEBUG__` 不得包含 token、password、API key、prompt、provider 或學生個人資料。
