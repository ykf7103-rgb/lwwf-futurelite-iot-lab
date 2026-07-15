import type { BrokerStatus, SelfTestState } from '../mqtt/types'

interface StatusHeaderProps {
  brokerStatus: BrokerStatus
  deviceOnline: boolean
  lastDeviceMessageAt: number | null
  selfTest: SelfTestState
  onSelfTest: () => void
  onDisconnect: () => void
  onReconnect: () => void
}

const brokerLabels: Record<BrokerStatus, string> = {
  connecting: '連線中',
  connected: '已連線',
  reconnecting: '重連中',
  disconnected: '已斷線',
  error: '錯誤',
}

const formatTime = (time: number | null) =>
  time
    ? new Intl.DateTimeFormat('zh-HK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(time)
    : '尚未收到訊息'

const selfTestLabel = (selfTest: SelfTestState) => {
  if (selfTest.status === 'waiting') return '測試中…'
  if (selfTest.status === 'success') return `成功 · ${selfTest.latency} ms`
  if (selfTest.status === 'timeout') return '逾時'
  if (selfTest.status === 'failed') return selfTest.error
  return '尚未測試'
}

export function StatusHeader({
  brokerStatus,
  deviceOnline,
  lastDeviceMessageAt,
  selfTest,
  onSelfTest,
  onDisconnect,
  onReconnect,
}: StatusHeaderProps) {
  return (
    <section className="status-shell" aria-label="連線狀態與控制">
      <div className="status-card">
        <div className="status-card__title">
          <span className={`status-dot status-dot--${brokerStatus}`} aria-hidden="true" />
          <span>MQTT Broker</span>
        </div>
        <strong data-testid="broker-status">{brokerLabels[brokerStatus]}</strong>
        <small>WSS 公開測試連線</small>
      </div>

      <div className="status-card">
        <div className="status-card__title">
          <span
            className={`status-dot ${deviceOnline ? 'status-dot--connected' : 'status-dot--disconnected'}`}
            aria-hidden="true"
          />
          <span>FutureLite AI</span>
        </div>
        <strong data-testid="device-status">{deviceOnline ? '在線' : '離線'}</strong>
        <small>最後訊息：{formatTime(lastDeviceMessageAt)}</small>
      </div>

      <div className="status-card status-card--wide">
        <div className="status-card__title">
          <span className="status-icon" aria-hidden="true">↔</span>
          <span>Broker 自我測試</span>
        </div>
        <strong data-testid="selftest-status">{selfTestLabel(selfTest)}</strong>
        <small>只驗證瀏覽器，不會把主板改為在線</small>
      </div>

      <div className="status-actions">
        <button
          className="button button--primary"
          type="button"
          onClick={onSelfTest}
          disabled={brokerStatus !== 'connected' || selfTest.status === 'waiting'}
        >
          Broker 自我測試
        </button>
        <button className="button button--ghost" type="button" onClick={onDisconnect}>
          手動斷線
        </button>
        <button className="button button--ghost" type="button" onClick={onReconnect}>
          重新連線
        </button>
      </div>
    </section>
  )
}
