# 驗收測試

1. Broker 連線後按 self-test，結果成功且 FutureLite 仍為離線。
2. status、soil 或 button 合法訊息會更新裝置最後訊息時間。
3. 6 秒沒有裝置訊息便顯示離線。
4. Soil 只保留最近 60 點，不顯示百分比。
5. A／B 事件分開計數，最後事件有時間。
6. LED 指令 ID 唯一；只接受相同 ID 的 ACK。
7. 5 秒沒有 matching ACK 顯示逾時。
8. 壞 JSON 留在 raw log 並顯示 parse error，頁面不崩潰。
9. 手動斷線及重連正常；卸載時 unsubscribe 並 end client。
10. 桌面及 390px 手機沒有重疊、破圖或橫向溢出。
11. debug contract 不含敏感資料。
12. 主板只有 status 而沒有 soil 時，介面明確顯示「主板在線，但 Soil 通道沒有資料」。
13. LED 指令逾時後顯示板端 subscribe／ACK 修復提示。
14. 本機 Playwright 使用獨立 QA topic，避免現場主板或並行測試污染結果。
15. 收到 Soil raw 後顯示 0–4095 量尺標記；無資料時不虛構數值。
16. 兩端同步區的正式板端程式及伴虎提示連結可開啟。
17. LED 逾時後可重發，且產生新的 command ID。
