import { expect, test } from '@playwright/test'
import mqtt, { type MqttClient } from 'mqtt'
import { randomUUID } from 'node:crypto'

const url = 'wss://broker.emqx.io:8084/mqtt'
const prefix = process.env.BASE_URL
  ? 'hksteam/demo/fla-7q4m9c2p'
  : 'hksteam/demo/fla-7q4m9c2p/qa'

const connectHarness = () =>
  new Promise<MqttClient>((resolve, reject) => {
    const client = mqtt.connect(url, {
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 0,
      connectTimeout: 12_000,
      clientId: `qa-${randomUUID()}`,
    })
    const timer = setTimeout(() => reject(new Error('QA MQTT harness 連線逾時')), 15_000)
    client.once('connect', () => {
      clearTimeout(timer)
      resolve(client)
    })
    client.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })

test('公開 Broker self-test 只驗證瀏覽器', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('broker-status')).toHaveText('已連線', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Broker 自我測試' }).click()
  await expect(page.getByTestId('selftest-status')).toContainText('成功', { timeout: 10_000 })
  await expect(page.getByTestId('device-status')).toHaveText(/在線|離線/)
})

test('telemetry、按鍵與 matching ACK 完成真實 MQTT 流程', async ({ page }) => {
  const harness = await connectHarness()
  try {
    await new Promise<void>((resolve, reject) => {
      harness.subscribe(`${prefix}/led`, { qos: 0 }, (error) => (error ? reject(error) : resolve()))
    })
    harness.on('message', (topic, payload) => {
      if (topic !== `${prefix}/led`) return
      const command = JSON.parse(payload.toString()) as { id: string; on: boolean }
      harness.publish(
        `${prefix}/ack`,
        JSON.stringify({ id: command.id, ok: true, on: command.on }),
        { qos: 0, retain: false },
      )
    })

    await page.goto('/')
    await expect(page.getByTestId('broker-status')).toHaveText('已連線', { timeout: 20_000 })

    const stamp = Date.now()
    harness.publish(`${prefix}/status`, JSON.stringify({ online: true, seq: stamp }), { qos: 0, retain: false })

    await expect(page.getByTestId('device-status')).toHaveText('在線')
    if (!process.env.BASE_URL) {
      await expect(page.getByTestId('diagnostic-summary')).toContainText('Soil 通道沒有資料')
    }

    harness.publish(`${prefix}/soil`, JSON.stringify({ raw: 1876, seq: stamp + 1 }), {
      qos: 0,
      retain: false,
    })
    harness.publish(`${prefix}/btn`, JSON.stringify({ button: 'A', seq: stamp + 2 }), {
      qos: 0,
      retain: false,
    })

    await expect(page.getByTestId('soil-value')).toHaveText('1876')
    await expect(page.getByTestId('soil-meter-marker')).toBeVisible()
    await expect(page.getByTestId('button-a-count')).toHaveText('1')

    await page.getByRole('button', { name: 'LED 開' }).click()
    await expect(page.getByTestId('command-status')).toContainText('硬件已確認', { timeout: 10_000 })

    await expect(page.getByTestId('diagnostic-summary')).toContainText('即時通道已建立')
  } finally {
    harness.end(true)
  }
})
