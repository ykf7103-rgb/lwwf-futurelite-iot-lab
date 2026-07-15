import mqtt, { type IClientOptions, type MqttClient } from 'mqtt'
import type { BrokerStatus, RawLogEntry } from './types'
import type { TopicMap } from './topics'

interface MqttServiceHandlers {
  onStatus: (status: BrokerStatus, safeError?: string) => void
  onMessage: (topic: string, payload: string) => void
  onLog: (entry: RawLogEntry) => void
}

const logId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`

export class MqttService {
  private client?: MqttClient
  private manualStop = false

  constructor(
    private readonly url: string,
    private readonly topics: TopicMap,
    private readonly handlers: MqttServiceHandlers,
  ) {}

  connect() {
    if (this.client?.connected || this.client?.reconnecting) return

    this.manualStop = false
    this.handlers.onStatus('connecting')
    const options: IClientOptions = {
      protocolVersion: 4,
      clean: true,
      keepalive: 30,
      reconnectPeriod: 1000,
      connectTimeout: 10_000,
      reconnectOnConnackError: true,
      clientId: `web-${crypto.randomUUID()}`,
    }

    this.client = mqtt.connect(this.url, options)
    this.client.on('connect', () => {
      this.handlers.onStatus('connected')
      this.client?.subscribe(this.topics.wildcard, { qos: 0 }, (error) => {
        if (error) {
          this.handlers.onStatus('error', `訂閱失敗：${error.message}`)
          this.systemLog('subscribe', error.message)
          return
        }
        this.systemLog('subscribe', this.topics.wildcard)
      })
    })
    this.client.on('reconnect', () => this.handlers.onStatus('reconnecting'))
    this.client.on('offline', () => this.handlers.onStatus('reconnecting'))
    this.client.on('close', () => this.handlers.onStatus(this.manualStop ? 'disconnected' : 'reconnecting'))
    this.client.on('error', (error) => {
      this.handlers.onStatus('error', error.message)
      this.systemLog('error', error.message)
    })
    this.client.on('message', (topic, payload) => this.handlers.onMessage(topic, payload.toString()))
  }

  publishJson(topic: string, value: unknown): boolean {
    if (!this.client?.connected) return false
    const payload = JSON.stringify(value)
    this.handlers.onLog({ id: logId(), time: Date.now(), direction: 'out', topic, payload })
    this.client.publish(topic, payload, { qos: 0, retain: false })
    return true
  }

  disconnect() {
    this.manualStop = true
    const client = this.client
    this.client = undefined
    if (!client) {
      this.handlers.onStatus('disconnected')
      return
    }
    client.unsubscribe(this.topics.wildcard, () => {
      client.end(true, {}, () => this.handlers.onStatus('disconnected'))
    })
  }

  reconnect() {
    this.disconnect()
    window.setTimeout(() => this.connect(), 80)
  }

  destroy() {
    this.disconnect()
  }

  private systemLog(topic: string, payload: string) {
    this.handlers.onLog({
      id: logId(),
      time: Date.now(),
      direction: 'system',
      topic,
      payload,
    })
  }
}
