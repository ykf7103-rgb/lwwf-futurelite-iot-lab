import type { SoilMessage } from '../mqtt/types'

interface SoilChartProps {
  samples: SoilMessage[]
  deviceOnline: boolean
  lastAt: number | null
}

const WIDTH = 720
const HEIGHT = 250
const PAD = 26

const formatTime = (value: number | null) =>
  value
    ? new Intl.DateTimeFormat('zh-HK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(value)
    : '—'

export function SoilChart({ samples, deviceOnline, lastAt }: SoilChartProps) {
  const latest = samples.at(-1)?.raw ?? null
  const rawPosition = latest === null ? 0 : (Math.max(0, Math.min(4095, latest)) / 4095) * 100
  const values = samples.map((sample) => sample.raw)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 4095
  const range = Math.max(max - min, 1)
  const points = values
    .map((value, index) => {
      const x = PAD + (index / Math.max(values.length - 1, 1)) * (WIDTH - PAD * 2)
      const y = HEIGHT - PAD - ((value - min) / range) * (HEIGHT - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <section className="panel soil-panel" aria-labelledby="soil-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Port1 · P1</p>
          <h2 id="soil-title">Soil 原始數值</h2>
        </div>
        <span className="sample-count">最近 {samples.length}／60 點</span>
      </div>

      <div className="soil-reading">
        <strong data-testid="soil-value">{latest ?? '—'}</strong>
        <span>raw</span>
      </div>

      <div className={`raw-meter ${latest === null ? 'raw-meter--empty' : ''}`} aria-label="Soil raw 量尺 0 至 4095">
        <div className="raw-meter__track">
          <span className="raw-meter__fill" style={{ width: `${rawPosition}%` }} />
          {latest !== null && (
            <span className="raw-meter__marker" data-testid="soil-meter-marker" style={{ left: `${rawPosition}%` }} />
          )}
        </div>
        <div className="raw-meter__labels"><span>0 raw</span><span>4095 raw</span></div>
        <p>量尺只顯示原始讀數位置；乾／濕方向須以實物樣本校準。</p>
      </div>

      <div className="chart-wrap">
        {samples.length < 2 ? (
          <div className={`empty-state ${deviceOnline && samples.length === 0 ? 'empty-state--alert' : ''}`}>
            <span aria-hidden="true">⌁</span>
            <strong>{deviceOnline ? '主板在線，但 Soil 通道沒有資料' : '等待 FutureLite 傳送 Soil raw'}</strong>
            <p>
              {deviceOnline
                ? '板端必須另外發布 telemetry/soil；status 心跳不會自動帶入 Soil 數值。'
                : '啟動常駐 Bridge 後，網站會在這裡顯示 P1 原始讀數。'}
            </p>
            <code>{'{"raw":3589,"seq":123}'}</code>
          </div>
        ) : (
          <svg
            className="soil-chart"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={`Soil raw 折線圖，最低 ${min}，最高 ${max}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="soil-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#41d9bd" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#41d9bd" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((line) => {
              const y = PAD + (line / 4) * (HEIGHT - PAD * 2)
              return <line key={line} x1={PAD} x2={WIDTH - PAD} y1={y} y2={y} className="chart-grid" />
            })}
            <polygon
              points={`${PAD},${HEIGHT - PAD} ${points} ${WIDTH - PAD},${HEIGHT - PAD}`}
              fill="url(#soil-area)"
            />
            <polyline points={points} className="chart-line" />
          </svg>
        )}
        <div className="chart-scale" aria-hidden="true">
          <span>最高 {values.length ? max : '—'}</span>
          <span>最低 {values.length ? min : '—'}</span>
        </div>
      </div>
      <div className="panel-note panel-note--split">
        <span>raw 是感測器原始讀數，未經實測校準前不會換算成百分比。</span>
        <span>最後 Soil：{formatTime(lastAt)}</span>
      </div>
    </section>
  )
}
