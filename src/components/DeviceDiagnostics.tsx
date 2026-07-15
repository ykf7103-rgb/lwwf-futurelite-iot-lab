import type { BrokerStatus, ChannelMetric, ChannelMetrics, CommandState } from '../mqtt/types'

interface DeviceDiagnosticsProps {
  brokerStatus: BrokerStatus
  deviceOnline: boolean
  channels: ChannelMetrics
  command: CommandState
}

type HealthTone = 'ok' | 'waiting' | 'error' | 'idle'

const time = (value: number | null) =>
  value
    ? new Intl.DateTimeFormat('zh-HK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(value)
    : '尚未收到'

const metricDetail = (metric: ChannelMetric, emptyText: string) => {
  if (!metric.lastAt) return emptyText
  const seq = metric.lastSeq === undefined ? '' : ` · seq ${metric.lastSeq}`
  return `${metric.count} 則${seq} · ${time(metric.lastAt)}`
}

const ledTone = (command: CommandState): HealthTone => {
  if (command.status === 'acknowledged') return 'ok'
  if (command.status === 'waiting') return 'waiting'
  if (command.status === 'failed' || command.status === 'timeout') return 'error'
  return 'idle'
}

const ledLabel = (command: CommandState) => {
  if (command.status === 'acknowledged') return 'ACK 正常'
  if (command.status === 'waiting') return '等待硬件 ACK'
  if (command.status === 'failed' || command.status === 'timeout') return '沒有 matching ACK'
  return '尚未測試'
}

export function DeviceDiagnostics({
  brokerStatus,
  deviceOnline,
  channels,
  command,
}: DeviceDiagnosticsProps) {
  const soilMissing = deviceOnline && channels.soil.count === 0
  const ackMissing = command.status === 'failed' || command.status === 'timeout'

  const summary = (() => {
    if (brokerStatus !== 'connected') {
      return {
        tone: 'waiting' as HealthTone,
        title: '網站正在等候 Broker',
        body: '先恢復瀏覽器連線，才可判斷 FutureLite 的各條資料通道。',
      }
    }
    if (!deviceOnline) {
      return {
        tone: 'waiting' as HealthTone,
        title: 'Broker 正常，等待 FutureLite 心跳',
        body: '請在伴虎執行常駐 Bridge；網站每六秒會重新判斷主板是否在線。',
      }
    }
    if (soilMissing) {
      return {
        tone: 'error' as HealthTone,
        title: '主板在線，但 Soil 通道沒有資料',
        body: '板端目前只發出 status；必須每約兩秒另外發布短 topic「soil」JSON。',
      }
    }
    if (ackMissing) {
      return {
        tone: 'error' as HealthTone,
        title: '感測資料正常，但 LED 沒有回覆 ACK',
        body: '請檢查板端有否訂閱短 topic「led」、執行 P2 指令，並用相同 command ID 發布 ack。',
      }
    }
    return {
      tone: 'ok' as HealthTone,
      title: '即時通道已建立',
      body: '心跳及 Soil 正常；可按 A／B 驗證事件，再以 LED 指令及 matching ACK 完成雙向測試。',
    }
  })()

  return (
    <section className="diagnostics" aria-labelledby="diagnostics-title">
      <div className={`diagnostic-summary diagnostic-summary--${summary.tone}`}>
        <div className="diagnostic-summary__icon" aria-hidden="true">
          {summary.tone === 'ok' ? '✓' : summary.tone === 'error' ? '!' : '↻'}
        </div>
        <div>
          <p className="eyebrow">即時判讀</p>
          <h2 id="diagnostics-title" data-testid="diagnostic-summary">{summary.title}</h2>
          <p>{summary.body}</p>
        </div>
      </div>

      <div className="channel-grid" aria-label="MQTT 通道健康狀態">
        <article className={`channel-card channel-card--${deviceOnline ? 'ok' : 'waiting'}`}>
          <div><span>01</span><strong>主板心跳</strong></div>
          <b>{deviceOnline ? '持續收到' : '等待中'}</b>
          <small>{metricDetail(channels.status, '需要 status 訊息')}</small>
          <code>{'{"online":true,"seq":123}'}</code>
        </article>

        <article className={`channel-card channel-card--${channels.soil.count ? 'ok' : deviceOnline ? 'error' : 'idle'}`}>
          <div><span>02</span><strong>Soil P1</strong></div>
          <b>{channels.soil.count ? '原始數值正常' : '未收到資料'}</b>
          <small>{metricDetail(channels.soil, '需要短 topic soil')}</small>
          <code>{'{"raw":3589,"seq":124}'}</code>
        </article>

        <article className={`channel-card channel-card--${channels.button.count ? 'ok' : 'idle'}`}>
          <div><span>03</span><strong>A／B 按鍵</strong></div>
          <b>{channels.button.count ? '事件正常' : '等待實體按鍵'}</b>
          <small>{metricDetail(channels.button, '按 A 或 B 作測試')}</small>
          <code>{'{"button":"A","seq":125}'}</code>
        </article>

        <article className={`channel-card channel-card--${ledTone(command)}`}>
          <div><span>04</span><strong>LED P2 回覆</strong></div>
          <b>{ledLabel(command)}</b>
          <small>{metricDetail(channels.ack, '網站指令需相同 ID 回覆')}</small>
          <code>{'{"id":"…","ok":true,"on":true}'}</code>
        </article>
      </div>

      <div className="hardware-map" aria-label="現場硬件配置">
        <div><span>P1</span><p><strong>Soil 感測器</strong>ANALOG 原始值</p></div>
        <div><span>P2</span><p><strong>LED 模組</strong>網站雙向控制</p></div>
        <div><span>M2</span><p><strong>風扇</strong>B 鍵本機控制</p><em>不經公共 MQTT 遙控</em></div>
      </div>
    </section>
  )
}
