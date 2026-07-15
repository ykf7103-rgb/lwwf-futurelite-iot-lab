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
    logCount: number
    lastSafeError: string | null
  }
}
