# Site Goal

## 目標

建立並部署一個可在瀏覽器直接使用的 FutureLite AI 雙向 MQTT 測試台，讓教師確認：

1. 瀏覽器可連接公開測試 Broker 並完成 self-test。
2. FutureLite AI 的 Soil raw、A／B 按鍵事件可即時顯示。
3. 網站 LED 開／關指令只有在收到相同 command ID 的 ACK 後才算成功。
4. 斷線、重連、壞 JSON、逾時及非 matching ACK 不會令介面崩潰或產生假成功。

## 可驗收條件

- [x] 已鎖定 Word 指引中的 Broker、topic 與訊息合約。
- [x] Broker 自我測試成功；不會誤把 FutureLite 狀態改為在線。
- [x] Soil raw 保留最近 60 點並以折線圖顯示。
- [x] A／B 事件計數、最後事件及時間正確。
- [x] LED 指令具唯一 ID、等待、matching ACK、5 秒逾時及 latency。
- [x] 6 秒沒有裝置訊息便顯示離線；重連後毋須刷新。
- [x] 原始 MQTT log 可摺疊，顯示方向、topic、payload 及 parse error。
- [x] 手動斷線／重新連線及 component unmount 清理正常。
- [x] `window.__TOOL_DEBUG__` 安全且可供 QA 讀取。
- [x] unit tests、typecheck、lint、build、Playwright 桌面／手機測試通過。
- [x] Cloudflare 正式網址已部署並完成 live URL 驗證。
