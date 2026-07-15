import { describe, expect, it } from 'vitest'
import { createTopics, DEFAULT_TOPIC_PREFIX } from './topics'

describe('MQTT topic contract', () => {
  it('builds every fixed FutureLite topic exactly', () => {
    const topics = createTopics(DEFAULT_TOPIC_PREFIX)
    expect(topics).toEqual({
      prefix: 'hksteam/demo/fla-7q4m9c2p',
      wildcard: 'hksteam/demo/fla-7q4m9c2p/#',
      status: 'hksteam/demo/fla-7q4m9c2p/status',
      soil: 'hksteam/demo/fla-7q4m9c2p/telemetry/soil',
      button: 'hksteam/demo/fla-7q4m9c2p/event/button',
      ledCommand: 'hksteam/demo/fla-7q4m9c2p/cmd/led',
      ack: 'hksteam/demo/fla-7q4m9c2p/ack',
      selftest: 'hksteam/demo/fla-7q4m9c2p/web/selftest',
    })
  })

  it('removes trailing slashes from an environment prefix', () => {
    expect(createTopics('school/device///').status).toBe('school/device/status')
  })
})
