# FutureLite AI 雙向 MQTT 測試台

供 FutureLite AI、Sugar Soil Moisture（Port1／P1）及 Sugar LED（Port2／P2）進行短期 PoC 的瀏覽器測試台。

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

## 測試次序

1. 等候「MQTT Broker」顯示已連線。
2. 按「Broker 自我測試」，確認網站收到自己的 self-test，而 FutureLite 仍顯示離線。
3. 在 FutureLite AI 執行已核對 API 的 `02_mqtt_bridge_test.py`。
4. 確認 Soil raw 每約 2 秒更新，A／B 事件計數正確。
5. 發送 LED 開／關指令，以實體 LED 改變及相同 command ID 的 ACK 作唯一成功標準。

## 安全限制

這是公開 Broker，只可傳送非敏感測試資料。不可傳送姓名、學生資料、SSID、密碼、IP、Token、API Key 或裝置憑證。網站不控制風扇或馬達。正式產品應改用私人 Broker、每板獨立 credential、topic ACL 及後端 Broker 連線。
