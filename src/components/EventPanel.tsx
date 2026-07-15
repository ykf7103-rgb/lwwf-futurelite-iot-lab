import type { ButtonMessage } from '../mqtt/types'

interface EventPanelProps {
  counts: { A: number; B: number }
  lastButton: (ButtonMessage & { receivedAt: number }) | null
}

const formatTime = (time: number) =>
  new Intl.DateTimeFormat('zh-HK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(time)

export function EventPanel({ counts, lastButton }: EventPanelProps) {
  return (
    <section className="panel events-panel" aria-labelledby="events-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">實體按鍵事件</p>
          <h2 id="events-title">A／B 事件</h2>
        </div>
        <span className="live-pill">event/button</span>
      </div>
      <div className="button-counters">
        <div className="button-counter button-counter--a">
          <span>A</span>
          <strong data-testid="button-a-count">{counts.A}</strong>
          <small>次</small>
        </div>
        <div className="button-counter button-counter--b">
          <span>B</span>
          <strong data-testid="button-b-count">{counts.B}</strong>
          <small>次</small>
        </div>
      </div>
      <div className="last-event">
        <span>最後事件</span>
        {lastButton ? (
          <strong>
            {lastButton.button} 鍵 · seq {lastButton.seq} · {formatTime(lastButton.receivedAt)}
          </strong>
        ) : (
          <strong>尚未收到按鍵事件</strong>
        )}
      </div>
      <p className="panel-note">相同 button＋seq 的重複訊息只會計算一次。</p>
    </section>
  )
}
