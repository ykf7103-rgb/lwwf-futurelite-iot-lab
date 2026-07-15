import { describe, expect, it } from 'vitest'
import { createTopics, DEFAULT_TOPIC_PREFIX } from './topics'

describe('MQTT topic contract', () => {
  it('builds every fixed FutureLite topic exactly', () => {
    const topics = createTopics(DEFAULT_TOPIC_PREFIX)
    expect(topics).toEqual({
      prefix: 'hksteam/demo/fla-7q4m9c2p',
      wildcard: 'hksteam/demo/fla-7q4m9c2p/#',
      status: 'hksteam/demo/fla-7q4m9c2p/status',
      soil: 'hksteam/demo/fla-7q4m9c2p/soil',
      button: 'hksteam/demo/fla-7q4m9c2p/btn',
      ledCommand: 'hksteam/demo/fla-7q4m9c2p/led',
      ack: 'hksteam/demo/fla-7q4m9c2p/ack',
      selftest: 'hksteam/demo/fla-7q4m9c2p/web/selftest',
      legacy: {
        soil: 'hksteam/demo/fla-7q4m9c2p/telemetry/soil',
        button: 'hksteam/demo/fla-7q4m9c2p/event/button',
      },
    })
  })

  it('keeps every FutureLite-facing topic at or below 32 characters', () => {
    const topics = createTopics(DEFAULT_TOPIC_PREFIX)
    for (const topic of [topics.status, topics.soil, topics.button, topics.ledCommand, topics.ack]) {
      expect(topic.length).toBeLessThanOrEqual(32)
    }
  })

  it('removes trailing slashes from an environment prefix', () => {
    expect(createTopics('school/device///').status).toBe('school/device/status')
  })
})
