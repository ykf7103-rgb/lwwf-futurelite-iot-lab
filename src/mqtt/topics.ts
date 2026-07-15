export const DEFAULT_MQTT_URL = 'wss://broker.emqx.io:8084/mqtt'
export const DEFAULT_TOPIC_PREFIX = 'hksteam/demo/fla-7q4m9c2p'

export const createTopics = (inputPrefix = DEFAULT_TOPIC_PREFIX) => {
  const prefix = inputPrefix.replace(/\/+$/, '')

  return {
    prefix,
    wildcard: `${prefix}/#`,
    status: `${prefix}/status`,
    // FutureLite uwifi only delivered the 32-character status topic during
    // the field test. Keep every board-facing topic at or below 32 chars.
    soil: `${prefix}/soil`,
    button: `${prefix}/btn`,
    ledCommand: `${prefix}/led`,
    ack: `${prefix}/ack`,
    selftest: `${prefix}/web/selftest`,
    legacy: {
      soil: `${prefix}/telemetry/soil`,
      button: `${prefix}/event/button`,
    },
  } as const
}

export type TopicMap = ReturnType<typeof createTopics>
