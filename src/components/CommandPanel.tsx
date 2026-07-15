import type { BrokerStatus, CommandState } from '../mqtt/types'

interface CommandPanelProps {
  brokerStatus: BrokerStatus
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

export function CommandPanel({ brokerStatus, command, onSend }: CommandPanelProps) {
  const busy = command.status === 'waiting'
  const disabled = brokerStatus !== 'connected' || busy
  const hasDetails = command.status !== 'idle'
  const ackTime = command.status === 'acknowledged' || command.status === 'failed' ? command.ackAt : undefined
  const latency = command.status === 'acknowledged' || command.status === 'failed' ? command.latency : undefined

  return (
    <section className="panel command-panel" aria-labelledby="command-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Port2 · P2</p>
          <h2 id="command-title">LED 雙向控制</h2>
        </div>
        <span className="live-pill">cmd/led → ack</span>
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
      <p className="panel-note">只有實體 LED 改變並回傳相同 command ID 的 ACK，才算完成。</p>
    </section>
  )
}
