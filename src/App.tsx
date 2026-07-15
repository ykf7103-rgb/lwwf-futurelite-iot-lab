import { useEffect } from 'react'
import { CommandPanel } from './components/CommandPanel'
import { EventPanel } from './components/EventPanel'
import { RawLog } from './components/RawLog'
import { SoilChart } from './components/SoilChart'
import { StatusHeader } from './components/StatusHeader'
import { useFutureLiteMqtt } from './hooks/useFutureLiteMqtt'
import './styles.css'

function App() {
  const mqtt = useFutureLiteMqtt()
  const latestSoil = mqtt.soilSamples.at(-1)?.raw ?? null

  useEffect(() => {
    window.__TOOL_DEBUG__ = {
      route: window.location.pathname,
      brokerStatus: mqtt.brokerStatus,
      deviceOnline: mqtt.deviceOnline,
      soilSampleCount: mqtt.soilSamples.length,
      latestSoilRaw: latestSoil,
      buttonCounts: mqtt.buttonCounts,
      commandStatus: mqtt.command.status,
      selfTestStatus: mqtt.selfTest.status,
      logCount: mqtt.logs.length,
      lastSafeError: mqtt.lastSafeError,
    }
  }, [
    latestSoil,
    mqtt.brokerStatus,
    mqtt.buttonCounts,
    mqtt.command.status,
    mqtt.deviceOnline,
    mqtt.lastSafeError,
    mqtt.logs.length,
    mqtt.selfTest.status,
    mqtt.soilSamples.length,
  ])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <span>FL</span>
        </div>
        <div className="brand-copy">
          <p>KITTENBOT FUTURELITE AI</p>
          <h1>雙向 MQTT 測試台</h1>
        </div>
        <div className="scope-chip">
          <span className="scope-chip__dot" aria-hidden="true" />
          Soil P1 · LED P2
        </div>
      </header>

      <main>
        <section className="intro-strip" aria-label="使用提示">
          <div>
            <span className="intro-strip__icon" aria-hidden="true">✓</span>
            <p>
              先完成 <strong>Broker 自我測試</strong>，再啟動 FutureLite 板端程式。
            </p>
          </div>
          <p className="intro-strip__warning">公開 Broker 只傳測試數值；不可傳送任何敏感資料。</p>
        </section>

        <StatusHeader
          brokerStatus={mqtt.brokerStatus}
          deviceOnline={mqtt.deviceOnline}
          lastDeviceMessageAt={mqtt.lastDeviceMessageAt}
          selfTest={mqtt.selfTest}
          onSelfTest={mqtt.runSelfTest}
          onDisconnect={mqtt.disconnect}
          onReconnect={mqtt.reconnect}
        />

        <section className="dashboard-grid" aria-label="FutureLite 即時測試資料">
          <SoilChart samples={mqtt.soilSamples} />
          <EventPanel counts={mqtt.buttonCounts} lastButton={mqtt.lastButton} />
          <CommandPanel
            brokerStatus={mqtt.brokerStatus}
            command={mqtt.command}
            onSend={mqtt.sendLedCommand}
          />
        </section>

        {mqtt.lastSafeError && (
          <aside className="safe-error" role="status">
            <span aria-hidden="true">!</span>
            <div>
              <strong>最近錯誤</strong>
              <p>{mqtt.lastSafeError}</p>
            </div>
          </aside>
        )}

        <RawLog logs={mqtt.logs} onClear={mqtt.clearLogs} />

        <section className="safety-grid" aria-label="安全限制">
          <div>
            <span aria-hidden="true">01</span>
            <p><strong>不控制風扇</strong>第一輪只測 Soil、A／B 事件與 LED。</p>
          </div>
          <div>
            <span aria-hidden="true">02</span>
            <p><strong>不假設百分比</strong>Soil raw 必須先用乾／濕樣本校準。</p>
          </div>
          <div>
            <span aria-hidden="true">03</span>
            <p><strong>ACK 才算成功</strong>「已發送」不代表實體硬件已完成。</p>
          </div>
        </section>
      </main>

      <footer>
        <p>FutureLite AI 雙向 MQTT 測試台 · 現場測試版本 2026-07-14</p>
        <p className="footer-tech">{mqtt.mqttUrl} · {mqtt.topicPrefix}</p>
      </footer>
    </div>
  )
}

export default App
