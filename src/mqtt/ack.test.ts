import { describe, expect, it } from 'vitest'
import { isMatchingAck } from './ack'
import type { CommandState } from './types'

describe('ACK matching', () => {
  const waiting: CommandState = { status: 'waiting', id: 'cmd-123', on: true, sentAt: 10 }

  it('accepts only the same command ID while waiting', () => {
    expect(isMatchingAck(waiting, { id: 'cmd-123', ok: true, on: true })).toBe(true)
    expect(isMatchingAck(waiting, { id: 'cmd-other', ok: true, on: true })).toBe(false)
  })

  it('does not accept an ACK after the command has already completed', () => {
    const completed: CommandState = {
      status: 'acknowledged',
      id: 'cmd-123',
      sentAt: 10,
      ackAt: 20,
      latency: 10,
      ok: true,
      on: true,
    }
    expect(isMatchingAck(completed, { id: 'cmd-123', ok: true })).toBe(false)
  })
})
