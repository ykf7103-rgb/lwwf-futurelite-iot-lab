/// <reference types="vite/client" />

interface Window {
  __TOOL_DEBUG__?: {
    route: string
    brokerStatus: string
    deviceOnline: boolean
    soilSampleCount: number
    latestSoilRaw: number | null
    buttonCounts: { A: number; B: number }
    commandStatus: string
    selfTestStatus: string
    channelCounts: { status: number; soil: number; button: number; ack: number }
    logCount: number
    lastSafeError: string | null
  }
}
