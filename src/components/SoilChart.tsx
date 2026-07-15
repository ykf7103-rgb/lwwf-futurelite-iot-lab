import type { SoilMessage } from '../mqtt/types'

interface SoilChartProps {
  samples: SoilMessage[]
}

const WIDTH = 720
const HEIGHT = 250
const PAD = 26

export function SoilChart({ samples }: SoilChartProps) {
  const latest = samples.at(-1)?.raw ?? null
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

      <div className="chart-wrap">
        {samples.length < 2 ? (
          <div className="empty-state">
            <span aria-hidden="true">⌁</span>
            <p>等待 FutureLite 傳送 Soil raw 訊息</p>
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
      <p className="panel-note">raw 是感測器原始讀數，未經實測校準前不會換算成百分比。</p>
    </section>
  )
}
