# 安全與私隱

- 公開 Broker 只作短期 PoC。
- 禁止傳送姓名、學生資料、SSID、Wi-Fi 密碼、IP、Token、API Key 或其他秘密。
- 網站不包含 AI、登入、資料庫、Supabase、裝置 credential 或 Node 後端。
- 網站只發布 LED 布林指令；不提供風扇或馬達控制。
- 指令必須以相同 command ID 的 ACK 才可顯示完成。
- 正式產品化前改用私人 Broker、每板獨立 credential、topic ACL、TLS/WSS 及後端連線。
