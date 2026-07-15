import type { AckMessage, CommandState } from './types'

export const isMatchingAck = (command: CommandState, ack: AckMessage): boolean =>
  command.status === 'waiting' && command.id === ack.id

export const commandId = (): string => {
  const random = crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(16).slice(2, 10)
  return `cmd-${Date.now()}-${random}`
}

export const selfTestId = (): string => {
  const random = crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(16).slice(2, 10)
  return `selftest-${Date.now()}-${random}`
}
