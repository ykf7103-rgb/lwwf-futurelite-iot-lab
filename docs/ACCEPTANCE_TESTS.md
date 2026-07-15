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
