export type BrokerStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'

export interface StatusMessage {
  online: boolean
  seq: number
}

export interface SoilMessage {
  raw: number
  seq: number
}

export interface ButtonMessage {
  button: 'A' | 'B'
  seq: number
}

export interface LedCommand {
  id: string
  on: boolean
}

export interface AckMessage {
  id: string
  ok: boolean
  on?: boolean
  error?: string
}

export interface SelfTestMessage {
  id: string
  sentAt: number
}

export type LogDirection = 'in' | 'out' | 'system'

export interface RawLogEntry {
  id: string
  time: number
  direction: LogDirection
  topic: string
  payload: string
  parseError?: string
}

export type CommandState =
  | { status: 'idle' }
  | { status: 'waiting'; id: string; on: boolean; sentAt: number }
  | {
      status: 'acknowledged' | 'failed'
      id: string
      on?: boolean
      sentAt: number
      ackAt: number
      latency: number
      ok: boolean
      error?: string
    }
  | { status: 'timeout'; id: string; on: boolean; sentAt: number }

export type SelfTestState =
  | { status: 'idle' }
  | { status: 'waiting'; id: string; sentAt: number }
  | { status: 'success'; id: string; sentAt: number; receivedAt: number; latency: number }
  | { status: 'timeout'; id: string; sentAt: number }
  | { status: 'failed'; id: string; sentAt: number; error: string }

export type ParsedIncoming =
  | { kind: 'status'; value: StatusMessage }
  | { kind: 'soil'; value: SoilMessage }
  | { kind: 'button'; value: ButtonMessage }
  | { kind: 'ack'; value: AckMessage }
  | { kind: 'selftest'; value: SelfTestMessage }
  | { kind: 'unknown' }

export type ParseResult =
  | { ok: true; message: ParsedIncoming }
  | { ok: false; error: string }
