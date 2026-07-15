import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { commandId, isMatchingAck, selfTestId } from '../mqtt/ack'
import { MqttService } from '../mqtt/MqttService'
import { parseIncoming } from '../mqtt/parsers'
import { createTopics, DEFAULT_MQTT_URL, DEFAULT_TOPIC_PREFIX } from '../mqtt/topics'
import type {
  BrokerStatus,
  ButtonMessage,
  CommandState,
  RawLogEntry,
  SelfTestState,
  SoilMessage,
} from '../mqtt/types'

const DEVICE_OFFLINE_MS = 6_000
const COMMAND_TIMEOUT_MS = 5_000
const SELFTEST_TIMEOUT_MS = 5_000
const MAX_LOGS = 300

const makeLog = (
  direction: RawLogEntry['direction'],
  topic: string,
  payload: string,
  parseError?: string,
): RawLogEntry => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`,
  time: Date.now(),
  direction,
  topic,
  payload,
  ...(parseError ? { parseError } : {}),
})

export const useFutureLiteMqtt = () => {
  const mqttUrl = import.meta.env.VITE_MQTT_URL || DEFAULT_MQTT_URL
  const topicPrefix = import.meta.env.VITE_TOPIC_PREFIX || DEFAULT_TOPIC_PREFIX
  const topics = useMemo(() => createTopics(topicPrefix), [topicPrefix])

  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>('connecting')
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [lastDeviceMessageAt, setLastDeviceMessageAt] = useState<number | null>(null)
  const [soilSamples, setSoilSamples] = useState<SoilMessage[]>([])
  const [buttonCounts, setButtonCounts] = useState({ A: 0, B: 0 })
  const [lastButton, setLastButton] = useState<(ButtonMessage & { receivedAt: number }) | null>(null)
  const [command, setCommand] = useState<CommandState>({ status: 'idle' })
  const [selfTest, setSelfTest] = useState<SelfTestState>({ status: 'idle' })
  const [logs, setLogs] = useState<RawLogEntry[]>([])
  const [lastSafeError, setLastSafeError] = useState<string | null>(null)

  const serviceRef = useRef<MqttService | undefined>(undefined)
  const lastDeviceMessageRef = useRef<number | null>(null)
  const commandRef = useRef<CommandState>({ status: 'idle' })
  const selfTestRef = useRef<SelfTestState>({ status: 'idle' })
  const commandTimerRef = useRef<number | undefined>(undefined)
  const selfTestTimerRef = useRef<number | undefined>(undefined)
  const seenButtonEventsRef = useRef(new Set<string>())

  const appendLog = useCallback((entry: RawLogEntry) => {
    setLogs((current) => [...current, entry].slice(-MAX_LOGS))
  }, [])

  const touchDevice = useCallback(() => {
    const now = Date.now()
    lastDeviceMessageRef.current = now
    setLastDeviceMessageAt(now)
    setDeviceOnline(true)
  }, [])

  const updateCommand = useCallback((next: CommandState) => {
    commandRef.current = next
    setCommand(next)
  }, [])

  const updateSelfTest = useCallback((next: SelfTestState) => {
    selfTestRef.current = next
    setSelfTest(next)
  }, [])

  useEffect(() => {
    const service = new MqttService(mqttUrl, topics, {
      onStatus: (status, safeError) => {
        setBrokerStatus(status)
        if (status === 'connected') setLastSafeError(null)
        else if (safeError) setLastSafeError(safeError)
      },
      onLog: appendLog,
      onMessage: (topic, payload) => {
        const parsed = parseIncoming(topic, payload, topics)
        appendLog(makeLog('in', topic, payload, parsed.ok ? undefined : parsed.error))
        if (!parsed.ok) {
          setLastSafeError(parsed.error)
          return
        }

        const message = parsed.message
        if (message.kind === 'status') {
          touchDevice()
          setDeviceOnline(message.value.online)
          return
        }
        if (message.kind === 'soil') {
          touchDevice()
          setSoilSamples((current) => [...current, message.value].slice(-60))
          return
        }
        if (message.kind === 'button') {
          touchDevice()
          const key = `${message.value.button}:${message.value.seq}`
          if (seenButtonEventsRef.current.has(key)) return
          seenButtonEventsRef.current.add(key)
          if (seenButtonEventsRef.current.size > 200) {
            seenButtonEventsRef.current = new Set([key])
          }
          setButtonCounts((current) => ({
            ...current,
            [message.value.button]: current[message.value.button] + 1,
          }))
          setLastButton({ ...message.value, receivedAt: Date.now() })
          return
        }
        if (message.kind === 'ack') {
          touchDevice()
          if (!isMatchingAck(commandRef.current, message.value)) {
            appendLog(makeLog('system', 'ack-ignored', message.value.id, '非 matching command ID'))
            return
          }
          const waiting = commandRef.current
          if (waiting.status !== 'waiting') return
          window.clearTimeout(commandTimerRef.current)
          const ackAt = Date.now()
          updateCommand({
            status: message.value.ok ? 'acknowledged' : 'failed',
            id: waiting.id,
            sentAt: waiting.sentAt,
            ackAt,
            latency: ackAt - waiting.sentAt,
            ok: message.value.ok,
            ...(message.value.on === undefined ? {} : { on: message.value.on }),
            ...(message.value.error === undefined ? {} : { error: message.value.error }),
          })
          return
        }
        if (message.kind === 'selftest') {
          const waiting = selfTestRef.current
          if (waiting.status !== 'waiting' || waiting.id !== message.value.id) return
          window.clearTimeout(selfTestTimerRef.current)
          const receivedAt = Date.now()
          updateSelfTest({
            status: 'success',
            id: waiting.id,
            sentAt: waiting.sentAt,
            receivedAt,
            latency: receivedAt - waiting.sentAt,
          })
        }
      },
    })
    serviceRef.current = service
    service.connect()

    const offlineTimer = window.setInterval(() => {
      const last = lastDeviceMessageRef.current
      if (last && Date.now() - last > DEVICE_OFFLINE_MS) {
        setDeviceOnline((wasOnline) => {
          if (wasOnline) seenButtonEventsRef.current.clear()
          return false
        })
      }
    }, 500)

    return () => {
      window.clearInterval(offlineTimer)
      window.clearTimeout(commandTimerRef.current)
      window.clearTimeout(selfTestTimerRef.current)
      service.destroy()
      serviceRef.current = undefined
    }
  }, [appendLog, mqttUrl, topics, touchDevice, updateCommand, updateSelfTest])

  const sendLedCommand = useCallback(
    (on: boolean) => {
      const id = commandId()
      const sentAt = Date.now()
      const next: CommandState = { status: 'waiting', id, on, sentAt }
      updateCommand(next)
      window.clearTimeout(commandTimerRef.current)
      const sent = serviceRef.current?.publishJson(topics.ledCommand, { id, on }) ?? false
      if (!sent) {
        updateCommand({
          status: 'failed',
          id,
          on,
          sentAt,
          ackAt: sentAt,
          latency: 0,
          ok: false,
          error: 'Broker 尚未連線',
        })
        return
      }
      commandTimerRef.current = window.setTimeout(() => {
        const current = commandRef.current
        if (current.status === 'waiting' && current.id === id) {
          updateCommand({ status: 'timeout', id, on, sentAt })
        }
      }, COMMAND_TIMEOUT_MS)
    },
    [topics.ledCommand, updateCommand],
  )

  const runSelfTest = useCallback(() => {
    const id = selfTestId()
    const sentAt = Date.now()
    updateSelfTest({ status: 'waiting', id, sentAt })
    window.clearTimeout(selfTestTimerRef.current)
    const sent = serviceRef.current?.publishJson(topics.selftest, { id, sentAt }) ?? false
    if (!sent) {
      updateSelfTest({ status: 'failed', id, sentAt, error: 'Broker 尚未連線' })
      return
    }
    selfTestTimerRef.current = window.setTimeout(() => {
      const current = selfTestRef.current
      if (current.status === 'waiting' && current.id === id) {
        updateSelfTest({ status: 'timeout', id, sentAt })
      }
    }, SELFTEST_TIMEOUT_MS)
  }, [topics.selftest, updateSelfTest])

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect()
    setDeviceOnline(false)
  }, [])

  const reconnect = useCallback(() => serviceRef.current?.reconnect(), [])
  const clearLogs = useCallback(() => setLogs([]), [])

  return {
    mqttUrl,
    topicPrefix,
    brokerStatus,
    deviceOnline,
    lastDeviceMessageAt,
    soilSamples,
    buttonCounts,
    lastButton,
    command,
    selfTest,
    logs,
    lastSafeError,
    sendLedCommand,
    runSelfTest,
    disconnect,
    reconnect,
    clearLogs,
  }
}
