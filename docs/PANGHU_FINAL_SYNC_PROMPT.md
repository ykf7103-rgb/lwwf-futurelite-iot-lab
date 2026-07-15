# 伴虎最終同步提示（r5 USB 實機驗證版）

目前主板已經由 Codex 經 USB 直接修正及實機驗收；只有日後板端檔案被覆蓋或需要還原時，才把以下整段貼到 FutureLite 伴虎。

```text
請打開板上目前正在運行、畫面顯示 LIVE MONITOR 的 Python 程式，先讀取完整原始碼，再作「最小局部修正」。

重要：不要重寫整個程式，不要建立另一個版本，不要改動已成功的 Wi-Fi、MQTT 連線、P1 Soil、P2 LED、M2 風扇、A/B/M 按鍵或屏幕功能。只修改 MQTT topic 常數、輪流發布排程及 topic 長度檢查。

外部 Broker 已實測：
- 32 字元的 hksteam/demo/fla-7q4m9c2p/status 可以成功發布。
- 33 字元的舊 LED command、38 字元的舊 button、40 字元的舊 soil 全部沒有到達主板或 Broker。
- 主板畫面 Soil P1 有數值，證明感測器正常。
- 主板 RX 一直是 0，證明舊 LED command 沒有被主板收到。

固定 Prefix（不可更改）：
hksteam/demo/fla-7q4m9c2p

請逐字改成以下正式短 topic：
- TOPIC_STATUS = PREFIX + "/status"
- TOPIC_SOIL = PREFIX + "/soil"
- TOPIC_BUTTON = PREFIX + "/btn"
- TOPIC_LED_COMMAND = PREFIX + "/led"
- TOPIC_ACK = PREFIX + "/ack"

必須刪除／取代程式內所有以下舊 topic 字串，不可再用：
- /telemetry/soil
- /event/button
- /cmd/led

必須保留以下完整雙向邏輯：
1. 使用同一個 WIFI() 物件執行 mqttConnect、subscribe、getMessage、publish。
2. mqttConnect 成功但回傳 None 是正常；只以有沒有 Exception 判斷。
3. 連線後執行 wifi.subscribe(TOPIC_LED_COMMAND)。
4. 永久主迴圈非阻塞執行 wifi.getMessage(TOPIC_LED_COMMAND)。
5. 每秒只 publish 一則訊息：status 與 soil 輪流發布；不可在同一次函數內緊接發布兩則訊息。
6. Soil payload：{"raw":P1實際整數值,"seq":遞增整數}。
7. A/B payload：{"button":"A或B","seq":遞增整數}。
8. 收到 LED payload：{"id":"...","on":true或false} 後，實際控制 P2。
9. 完成後 publish ACK：{"id":"原本相同id","ok":true,"on":實際狀態}。
10. Wi-Fi／MQTT 重連後必須重新 subscribe。
11. 設定 PROGRAM_VERSION = "2026.07.15-r5-usb-verified"，並在 status 加入 "ver": PROGRAM_VERSION。

在 mqttConnect 成功後加入以下靜態檢查；任何板端 topic 超過 32 字元便停止並清楚報錯：

for topic in (TOPIC_STATUS, TOPIC_SOIL, TOPIC_BUTTON, TOPIC_LED_COMMAND, TOPIC_ACK):
    print("TOPIC", len(topic), topic)
    if len(topic) > 32:
        raise ValueError("topic too long: " + topic)

硬件及安全設定保持不變：
- P1：Soil raw，只顯示原始值，不轉百分比。
- P2：LED，可由實體 A 及網站控制。
- M2：風扇只由實體 B 鍵本機控制；不可新增 cmd/fan，不可透過公共 MQTT 遙控。
- 程式停止、網絡錯誤或重連時，M2 必須 OFF。
- 不讀取、顯示或傳送 SSID、密碼、IP、Token、API key 或裝置憑證。
- 不修改 boot.py、main.py、wifi.txt、lib 或任何系統檔案。

完成後先做靜態檢查，確認程式內確實有：
- publish(TOPIC_STATUS, ...)
- publish(TOPIC_SOIL, ...)
- subscribe(TOPIC_LED_COMMAND)
- getMessage(TOPIC_LED_COMMAND)
- publish(TOPIC_ACK, ...)
- 每秒 status／soil 輪流發布，沒有 150ms 連發
- 所有板端 topic 長度不超過 32
- ACK 使用收到的相同 command id
- 永久 while 迴圈

只儲存原本正在運行的 Python 檔案，不要自動 Run。完成後只回覆：
「短 topic 修正已儲存，請手動 Stop 舊程式後再 Run。」
```

## 現場操作及驗收

1. 在伴虎先按 Stop，確認舊程式停止。
2. 儲存修正檔，重新 Run；不要同時運行兩個 MQTT 程式。
3. REPL 必須列出：status 32、soil 30、btn 29、led 29、ack 29。
4. 正式網站在六秒內顯示 Soil raw。
5. 按 A／B 各一次，網站計數各增加一次。
6. 網站按 LED 開／關；主板 `RX` 必須增加，P2 實體燈改變，網站收到相同 ID 的 ACK。
7. M2 風扇只以 B 鍵在現場測試。

唯一正式參考程式：
`https://raw.githubusercontent.com/ykf7103-rgb/lwwf-futurelite-iot-lab/main/device/03_futurelite_full_console.py`
