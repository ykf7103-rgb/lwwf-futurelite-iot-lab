import type { BrokerStatus, CommandState } from '../mqtt/types'

interface CommandPanelProps {
  brokerStatus: BrokerStatus
  deviceOnline: boolean
  command: CommandState
  onSend: (on: boolean) => void
}

const formatTime = (time?: number) =>
  time
    ? new Intl.DateTimeFormat('zh-HK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false,
      }).format(time)
    : '—'

const statusText = (command: CommandState) => {
  if (command.status === 'waiting') return '等待硬件確認'
  if (command.status === 'acknowledged') return '硬件已確認'
  if (command.status === 'failed') return `失敗：${command.error ?? '硬件回報錯誤'}`
  if (command.status === 'timeout') return '逾時：沒有收到 matching ACK'
  return '尚未發出指令'
}

export function CommandPanel({ brokerStatus, deviceOnline, command, onSend }: CommandPanelProps) {
  const busy = command.status === 'waiting'
  const disabled = brokerStatus !== 'connected' || !deviceOnline || busy
  const hasDetails = command.status !== 'idle'
  const ackTime = command.status === 'acknowledged' || command.status === 'failed' ? command.ackAt : undefined
  const latency = command.status === 'acknowledged' || command.status === 'failed' ? command.latency : undefined
  const retryOn = command.status === 'timeout' || command.status === 'failed' ? command.on : undefined

  return (
    <section className="panel command-panel" aria-labelledby="command-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Port2 · P2</p>
          <h2 id="command-title">LED 雙向控制</h2>
        </div>
        <span className={`live-pill ${deviceOnline ? 'live-pill--ready' : ''}`}>
          {deviceOnline ? '主板在線 · 可發送' : '等待主板在線'}
        </span>
      </div>
      <div className="command-buttons">
        <button
          className="led-button led-button--on"
          type="button"
          onClick={() => onSend(true)}
          disabled={disabled}
        >
          <span className="led-symbol" aria-hidden="true">●</span>
          LED 開
        </button>
        <button
          className="led-button led-button--off"
          type="button"
          onClick={() => onSend(false)}
          disabled={disabled}
        >
          <span className="led-symbol" aria-hidden="true">○</span>
          LED 關
        </button>
      </div>

      <div className={`command-state command-state--${command.status}`} role="status" data-testid="command-status">
        <span className="command-state__label">指令狀態</span>
        <strong>{statusText(command)}</strong>
      </div>

      {(command.status === 'timeout' || command.status === 'failed') && (
        <div className="command-recovery" role="note">
          <strong>板端修復重點</strong>
          <p>訂閱短 topic「led」→ 讀取 JSON → 控制 P2 → 用相同 ID 發布 ack。</p>
          {retryOn !== undefined && (
            <button
              className="button button--ghost button--small"
              type="button"
              onClick={() => onSend(retryOn)}
              disabled={!deviceOnline || brokerStatus !== 'connected'}
            >
              重新發送 LED {retryOn ? '開' : '關'}
            </button>
          )}
        </div>
      )}

      <dl className="command-details">
        <div>
          <dt>Command ID</dt>
          <dd>{hasDetails ? command.id : '—'}</dd>
        </div>
        <div>
          <dt>發送時間</dt>
          <dd>{hasDetails ? formatTime(command.sentAt) : '—'}</dd>
        </div>
        <div>
          <dt>ACK 時間</dt>
          <dd>{formatTime(ackTime)}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>{latency === undefined ? '—' : `${latency} ms`}</dd>
        </div>
      </dl>
      <p className="panel-note">
        {deviceOnline
          ? '只有實體 LED 改變並回傳相同 command ID 的 ACK，才算完成。'
          : '按鈕會在主板在線後啟用，避免把「成功發布」誤當成硬件已執行。'}
      </p>
    </section>
  )
}
