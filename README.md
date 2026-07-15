# FutureLite AI IoT 現場監控與控制中心

供 FutureLite AI、Sugar Soil Moisture（Port1／P1）及 Sugar LED（Port2／P2）進行短期 PoC 的瀏覽器測試台。

- 正式網站：<https://lwwf-futurelite-iot-lab.pages.dev/>
- GitHub：<https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab>

## 啟動

```powershell
npm install
npm run dev
```

開啟終端顯示的網址，通常是 `http://localhost:5173`。

## 驗證

```powershell
npm run qa
npm run qa:visual
```

## 固定 MQTT 設定

- Browser URL：`wss://broker.emqx.io:8084/mqtt`
- MQTT version：3.1.1（`protocolVersion: 4`）
- Topic prefix：`hksteam/demo/fla-7q4m9c2p`
- QoS：0
- Retain：false
- FutureLite 離線判斷：6 秒
- ACK 逾時：5 秒
- LED 指令重試：每 1 秒以同一 command ID 重發，直至收到 ACK 或達 5 秒上限

### FutureLite 短 Topic 合約

現場實測顯示 `uwifi` 只成功處理長度不超過 32 字元的板端 topic，因此正式合約使用以下短名稱：

- 心跳：`hksteam/demo/fla-7q4m9c2p/status`（32）
- Soil raw：`hksteam/demo/fla-7q4m9c2p/soil`（30）
- A／B 事件：`hksteam/demo/fla-7q4m9c2p/btn`（29）
- LED 指令：`hksteam/demo/fla-7q4m9c2p/led`（29）
- ACK：`hksteam/demo/fla-7q4m9c2p/ack`（29）

網站仍可接收舊版 `telemetry/soil` 及 `event/button`，但所有新板端程式必須使用短 topic；網站 LED 指令只發到短 topic `led`。

## 測試次序

1. 等候「MQTT Broker」顯示已連線。
2. 按「Broker 自我測試」，確認網站收到自己的 self-test，而 FutureLite 仍顯示離線。
3. 在 FutureLite AI 執行 `03_futurelite_full_console.py`；已透過 USB 實機驗證的正式版本位於 `device/`，伴虎同步提示位於 `docs/PANGHU_FINAL_SYNC_PROMPT.md`。
4. 確認短 topic `soil` 的 raw 每約 2 秒更新，短 topic `btn` 的 A／B 事件計數正確。
5. 發送 LED 開／關指令；網站會自動重試，以實體 LED 改變及相同 command ID 的 ACK 作唯一成功標準。

網站的通道診斷會分開顯示 status、Soil、A／B event 及 LED ACK；「FutureLite 在線」只代表最近收到板端訊息，不等於所有通道已完成。

網站「兩端同步」區直接連到 GitHub 唯一正式板端程式及伴虎更新提示；請完整覆蓋舊檔，不要只把新片段貼入舊主迴圈。

## 安全限制

這是公開 Broker，只可傳送非敏感測試資料。不可傳送姓名、學生資料、SSID、密碼、IP、Token、API Key 或裝置憑證。網站不控制風扇或馬達。正式產品應改用私人 Broker、每板獨立 credential、topic ACL 及後端 Broker 連線。
