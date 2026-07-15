import type { RawLogEntry } from '../mqtt/types'

interface RawLogProps {
  logs: RawLogEntry[]
  onClear: () => void
}

const time = (value: number) =>
  new Intl.DateTimeFormat('zh-HK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  }).format(value)

export function RawLog({ logs, onClear }: RawLogProps) {
  return (
    <details className="raw-log">
      <summary>
        <span>
          原始 MQTT 記錄 <strong>{logs.length}</strong>
        </span>
        <span className="summary-hint">展開檢查 topic、payload 及 parse error</span>
      </summary>
      <div className="raw-log__toolbar">
        <p>最新訊息顯示在最下方；最多保留 300 項。</p>
        <button type="button" className="button button--ghost button--small" onClick={onClear}>
          清除記錄
        </button>
      </div>
      <div className="raw-log__list" aria-live="polite">
        {logs.length === 0 ? (
          <p className="raw-log__empty">尚未有訊息。</p>
        ) : (
          logs.map((entry) => (
            <article className={`log-row log-row--${entry.direction}`} key={entry.id}>
              <div className="log-meta">
                <time>{time(entry.time)}</time>
                <span>{entry.direction === 'in' ? '收到' : entry.direction === 'out' ? '發出' : '系統'}</span>
              </div>
              <code className="log-topic">{entry.topic}</code>
              <pre>{entry.payload}</pre>
              {entry.parseError && <p className="log-error">Parse error：{entry.parseError}</p>}
            </article>
          ))
        )}
      </div>
    </details>
  )
}
