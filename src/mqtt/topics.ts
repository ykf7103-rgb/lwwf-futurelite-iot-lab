export const DEFAULT_MQTT_URL = 'wss://broker.emqx.io:8084/mqtt'
export const DEFAULT_TOPIC_PREFIX = 'hksteam/demo/fla-7q4m9c2p'

export const createTopics = (inputPrefix = DEFAULT_TOPIC_PREFIX) => {
  const prefix = inputPrefix.replace(/\/+$/, '')

  return {
    prefix,
    wildcard: `${prefix}/#`,
    status: `${prefix}/status`,
    soil: `${prefix}/telemetry/soil`,
    button: `${prefix}/event/button`,
    ledCommand: `${prefix}/cmd/led`,
    ack: `${prefix}/ack`,
    selftest: `${prefix}/web/selftest`,
  } as const
}

export type TopicMap = ReturnType<typeof createTopics>
