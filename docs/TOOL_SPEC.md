# 工具規格

## 課堂工作

讓教師在進入完整 IoT 課堂前，分開驗證「瀏覽器 ↔ Broker」及「FutureLite ↔ Broker ↔ 瀏覽器」兩條通訊鏈，並以實體 LED 加 matching ACK 證明雙向控制成功。

## 主要介面

- Broker 狀態與手動連線控制
- FutureLite 在線／離線狀態
- Soil raw 大字數值及最近 60 點折線圖
- A／B 按鍵事件計數及最後事件
- LED 開／關指令與 matching ACK 詳情
- Broker self-test
- 可摺疊原始 MQTT log
- 四通道健康檢查：status、Soil、A／B event、LED ACK
- 現場硬件配置：P1 Soil、P2 LED、M2 風扇本機模式

## 失敗狀態

- Broker 連線錯誤或重連中
- 6 秒沒有裝置訊息
- JSON parse error 或合約不符
- 非 matching ACK
- 指令 5 秒逾時
- self-test 5 秒逾時
- 主板在線但 Soil 通道沒有資料
- LED 指令已發布但板端沒有 matching ACK
