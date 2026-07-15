import type { ChannelMetrics, CommandState } from '../mqtt/types'

interface SyncPanelProps {
  deviceOnline: boolean
  channels: ChannelMetrics
  command: CommandState
}

const DEVICE_CODE_URL =
  'https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab/blob/main/device/03_futurelite_full_console.py'
const PANGHU_PROMPT_URL =
  'https://github.com/ykf7103-rgb/lwwf-futurelite-iot-lab/blob/main/docs/PANGHU_FINAL_SYNC_PROMPT.md'

export function SyncPanel({ deviceOnline, channels, command }: SyncPanelProps) {
  const soilReady = channels.soil.count > 0
  const ackReady = command.status === 'acknowledged'

  return (
    <section className="sync-panel" aria-labelledby="sync-title">
      <div className="sync-panel__copy">
        <p className="eyebrow">TWO-SIDE SYNC</p>
        <h2 id="sync-title">兩端必須使用同一份正式合約</h2>
        <p>
          網站只會顯示 FutureLite 真正發布的資料；請以正式板端程式完整取代目前「只發心跳」的版本。
        </p>
        <div className="sync-actions">
          <a className="button button--primary" href={DEVICE_CODE_URL} target="_blank" rel="noreferrer">
            開啟完整板端程式
          </a>
          <a className="button button--ghost" href={PANGHU_PROMPT_URL} target="_blank" rel="noreferrer">
            開啟伴虎更新提示
          </a>
        </div>
      </div>

      <ol className="sync-steps" aria-label="兩端同步進度">
        <li className="sync-step sync-step--ok">
          <span>1</span>
          <div><strong>網站正式版</strong><small>Cloudflare Pages 已部署</small></div>
          <b>完成</b>
        </li>
        <li className={`sync-step ${deviceOnline ? 'sync-step--ok' : ''}`}>
          <span>2</span>
          <div><strong>FutureLite 心跳</strong><small>status 每約兩秒發布</small></div>
          <b>{deviceOnline ? '收到' : '等待'}</b>
        </li>
        <li className={`sync-step ${soilReady ? 'sync-step--ok' : 'sync-step--error'}`}>
          <span>3</span>
          <div><strong>Soil P1</strong><small>短 topic soil · raw</small></div>
          <b>{soilReady ? '正常' : '缺失'}</b>
        </li>
        <li className={`sync-step ${ackReady ? 'sync-step--ok' : command.status === 'timeout' ? 'sync-step--error' : ''}`}>
          <span>4</span>
          <div><strong>LED P2 回覆</strong><small>短 topic led → matching ACK</small></div>
          <b>{ackReady ? '正常' : command.status === 'timeout' ? '逾時' : '待測'}</b>
        </li>
      </ol>
    </section>
  )
}
