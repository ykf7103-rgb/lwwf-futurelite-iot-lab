import { describe, expect, it } from 'vitest'
import { parseIncoming } from './parsers'
import { createTopics } from './topics'

const topics = createTopics()

describe('runtime MQTT parser', () => {
  it('parses valid status, soil, button, ACK and self-test payloads', () => {
    expect(parseIncoming(topics.status, '{"online":true,"seq":1}', topics)).toEqual({
      ok: true,
      message: { kind: 'status', value: { online: true, seq: 1 } },
    })
    expect(parseIncoming(topics.soil, '{"raw":2048,"seq":2}', topics)).toEqual({
      ok: true,
      message: { kind: 'soil', value: { raw: 2048, seq: 2 } },
    })
    expect(parseIncoming(topics.button, '{"button":"A","seq":3}', topics)).toEqual({
      ok: true,
      message: { kind: 'button', value: { button: 'A', seq: 3 } },
    })
    expect(parseIncoming(topics.ack, '{"id":"cmd-1","ok":true,"on":true}', topics)).toEqual({
      ok: true,
      message: { kind: 'ack', value: { id: 'cmd-1', ok: true, on: true } },
    })
    expect(parseIncoming(topics.selftest, '{"id":"selftest-1","sentAt":99}', topics)).toEqual({
      ok: true,
      message: { kind: 'selftest', value: { id: 'selftest-1', sentAt: 99 } },
    })
  })

  it('rejects invalid JSON without throwing', () => {
    const result = parseIncoming(topics.soil, '{broken', topics)
    expect(result.ok).toBe(false)
  })

  it('rejects a type-invalid contract', () => {
    expect(parseIncoming(topics.soil, '{"raw":"wet","seq":1}', topics)).toMatchObject({ ok: false })
    expect(parseIncoming(topics.button, '{"button":"M","seq":1}', topics)).toMatchObject({ ok: false })
  })

  it('keeps unknown child topics visible without treating them as a parse failure', () => {
    expect(parseIncoming(`${topics.prefix}/future/extra`, 'not-json', topics)).toEqual({
      ok: true,
      message: { kind: 'unknown' },
    })
  })
})
