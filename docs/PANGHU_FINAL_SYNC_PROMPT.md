# 伴虎最終同步提示

把以下整段直接貼到 FutureLite 伴虎：

```text
請修正現有 03_futurelite_full_console.py，完成網站與 FutureLite 的最終同步版本。

目前已由外部 MQTT 監聽確認：
- status 每約兩秒正常發布
- A／B event 曾經正常發布
- telemetry/soil 完全沒有發布
- 網站發布 cmd/led 後，FutureLite 沒有回傳 ack
- mqttConnect() 成功時回傳 NoneType；不可用回傳值判斷成敗

請先讀取現有已成功的 WiFi／DNS／TCP1883／MQTT／SUB／PUB 診斷程式，以及現有 03_futurelite_full_console.py。沿用已成功 API，然後完整取代 03_futurelite_full_console.py 的主迴圈。不要修改 boot.py、main.py、wifi.txt、lib 或其他程式。

固定設定：
- Broker：broker.emqx.io，TCP 1883，帳戶及密碼留空
- Prefix：hksteam/demo/fla-7q4m9c2p
- status：hksteam/demo/fla-7q4m9c2p/status
- soil：hksteam/demo/fla-7q4m9c2p/telemetry/soil
- button：hksteam/demo/fla-7q4m9c2p/event/button
- LED command：hksteam/demo/fla-7q4m9c2p/cmd/led
- ACK：hksteam/demo/fla-7q4m9c2p/ack

必須使用同一個 WIFI() 物件完成 mqttConnect、subscribe、getMessage 和 publish。

硬件：
- P1：MeowPin('P1','ANALOG')，使用 getAnalog() 讀取 Soil raw
- P2：MeowPin('P2','OUT')，LED
- M2：Motor()，只由實體 B 鍵本機開關，速度 50
- A：本機切換 P2 LED，並發布 A event
- B：本機切換 M2 風扇，並發布 B event
- M：切換三頁屏幕，不發布 MQTT

永久主迴圈必須同時執行：
1. 每約兩秒發布 {"online":true,"seq":數字}
2. 每約兩秒另外發布 {"raw":P1原始數值,"seq":數字}
3. 非阻塞檢查 cmd/led
4. 收到 {"id":"...","on":true或false} 後控制 P2
5. 必須用完全相同 id 發布 {"id":"...","ok":true,"on":true或false}
6. 同一 id 不可重複控制，但可以再次回覆相同 ACK
7. getMessage() 回傳 None 只代表暫時沒有新指令
8. 主迴圈 sleep 50～100ms，不可因等待指令停止 Soil 上報
9. WiFi／MQTT 異常後停止 M2、等待三秒、重新連線及重新 subscribe

屏幕三頁：
- 即時監控：WiFi、MQTT、Soil P1、LED P2、FAN M2、A/B 次數、seq、RX/TX
- 連線診斷：WiFi、DNS、TCP1883、MQTT、SUB、PUB、重連次數、最後錯誤
- 網站指令：最後 LED ON/OFF、command ID 最後八字、ACK、RX/TX、多久前

安全要求：
- M2 開機預設 OFF，網絡錯誤或程式停止時立即 OFF
- 不建立 cmd/fan，不讓公開網站遙控風扇，不發布風扇狀態
- 不讀取、顯示或傳送 SSID、密碼、IP、Token 或裝置憑證
- Soil 必須保持 raw，不可換算百分比

完成前請自行靜態檢查以下條件確實存在於程式：
- publish(TOPIC_STATUS, ...)
- publish(TOPIC_SOIL, ...)
- subscribe(TOPIC_LED_COMMAND)
- getMessage(TOPIC_LED_COMMAND)
- publish(TOPIC_ACK, ...)
- ACK 使用收到的相同 command id
- 永久 while 迴圈

只儲存 03_futurelite_full_console.py，不要自動執行。完成後回覆：
「03_futurelite_full_console.py 已同步 Soil 與 LED ACK，請手動執行。」
```

## 現場驗收

1. 只執行 `03_futurelite_full_console.py`。
2. 首頁 `Seq` 應持續增加，Soil P1 不可顯示 `--`。
3. 網站在六秒內顯示主板在線及 Soil 原始數值。
4. A／B 各按一次，網站計數各增加一次。
5. 網站按 LED 開及 LED 關，P2 實體燈改變，網站顯示「硬件已確認」。
6. M2 風扇只以 B 鍵本機測試。
