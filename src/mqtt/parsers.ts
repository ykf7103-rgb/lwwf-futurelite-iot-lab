import type {
  AckMessage,
  ButtonMessage,
  ParseResult,
  SelfTestMessage,
  SoilMessage,
  StatusMessage,
} from './types'
import type { TopicMap } from './topics'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const parseJsonObject = (payload: string): Record<string, unknown> => {
  const value: unknown = JSON.parse(payload)
  if (!isRecord(value)) {
    throw new Error('payload 必須是 JSON object')
  }
  return value
}

const parseStatus = (value: Record<string, unknown>): StatusMessage => {
  if (typeof value.online !== 'boolean' || !isFiniteNumber(value.seq)) {
    throw new Error('status 需要 boolean online 及 number seq')
  }
  return { online: value.online, seq: value.seq }
}

const parseSoil = (value: Record<string, unknown>): SoilMessage => {
  if (!isFiniteNumber(value.raw) || !isFiniteNumber(value.seq)) {
    throw new Error('soil 需要 number raw 及 number seq')
  }
  return { raw: value.raw, seq: value.seq }
}

const parseButton = (value: Record<string, unknown>): ButtonMessage => {
  if ((value.button !== 'A' && value.button !== 'B') || !isFiniteNumber(value.seq)) {
    throw new Error('button 需要 A／B 及 number seq')
  }
  return { button: value.button, seq: value.seq }
}

const parseAck = (value: Record<string, unknown>): AckMessage => {
  if (typeof value.id !== 'string' || !value.id || typeof value.ok !== 'boolean') {
    throw new Error('ACK 需要非空 id 及 boolean ok')
  }
  if (value.on !== undefined && typeof value.on !== 'boolean') {
    throw new Error('ACK on 必須是 boolean')
  }
  if (value.error !== undefined && typeof value.error !== 'string') {
    throw new Error('ACK error 必須是 string')
  }
  return {
    id: value.id,
    ok: value.ok,
    ...(value.on === undefined ? {} : { on: value.on }),
    ...(value.error === undefined ? {} : { error: value.error }),
  }
}

const parseSelfTest = (value: Record<string, unknown>): SelfTestMessage => {
  if (typeof value.id !== 'string' || !value.id || !isFiniteNumber(value.sentAt)) {
    throw new Error('self-test 需要非空 id 及 number sentAt')
  }
  return { id: value.id, sentAt: value.sentAt }
}

export const parseIncoming = (topic: string, payload: string, topics: TopicMap): ParseResult => {
  if (!Object.values(topics).includes(topic as never)) {
    return { ok: true, message: { kind: 'unknown' } }
  }

  try {
    const value = parseJsonObject(payload)
    if (topic === topics.status) return { ok: true, message: { kind: 'status', value: parseStatus(value) } }
    if (topic === topics.soil) return { ok: true, message: { kind: 'soil', value: parseSoil(value) } }
    if (topic === topics.button) return { ok: true, message: { kind: 'button', value: parseButton(value) } }
    if (topic === topics.ack) return { ok: true, message: { kind: 'ack', value: parseAck(value) } }
    if (topic === topics.selftest) {
      return { ok: true, message: { kind: 'selftest', value: parseSelfTest(value) } }
    }
    return { ok: true, message: { kind: 'unknown' } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : '無法解析訊息' }
  }
}
