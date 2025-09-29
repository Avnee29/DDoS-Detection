// Threat Intelligence API Integration
// Simulates real threat intelligence feeds and APIs

export interface ThreatIntelligenceData {
  ip: string
  threatType: string
  reputationScore: number
  countryCode: string
  organization: string
  lastSeen: Date
  source: string
  confidenceLevel: number
}

export interface ThreatFeedResponse {
  threats: ThreatIntelligenceData[]
  lastUpdated: Date
  totalCount: number
}

export class ThreatIntelligenceAPI {
  private apiKey: string
  private baseUrl = "https://api.threatintel.example.com/v1"

  constructor(apiKey = "demo-api-key-12345") {
    this.apiKey = apiKey
  }

  async fetchLatestThreats(): Promise<ThreatFeedResponse> {
    // Simulate API call with realistic data
    await this.delay(500) // Simulate network delay

    const mockThreats: ThreatIntelligenceData[] = [
      {
        ip: "45.142.214.123",
        threatType: "Botnet C&C",
        reputationScore: 98,
        countryCode: "RU",
        organization: "Malicious Hosting Ltd",
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        source: "ThreatFeed-Premium",
        confidenceLevel: 0.98,
      },
      {
        ip: "103.224.182.245",
        threatType: "DDoS Source",
        reputationScore: 95,
        countryCode: "CN",
        organization: "Compromised ISP",
        lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
        source: "ThreatFeed-Premium",
        confidenceLevel: 0.95,
      },
      {
        ip: "185.220.101.42",
        threatType: "Tor Exit Node",
        reputationScore: 75,
        countryCode: "NL",
        organization: "Privacy Network",
        lastSeen: new Date(Date.now() - 900000), // 15 minutes ago
        source: "ThreatFeed-Community",
        confidenceLevel: 0.85,
      },
      {
        ip: "194.147.85.16",
        threatType: "Scanning",
        reputationScore: 82,
        countryCode: "DE",
        organization: "Suspicious VPS",
        lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
        source: "ThreatFeed-Premium",
        confidenceLevel: 0.82,
      },
    ]

    return {
      threats: mockThreats,
      lastUpdated: new Date(),
      totalCount: mockThreats.length,
    }
  }

  async lookupIP(ip: string): Promise<ThreatIntelligenceData | null> {
    // Simulate IP lookup
    await this.delay(200)

    const knownThreats = await this.fetchLatestThreats()
    return knownThreats.threats.find((threat) => threat.ip === ip) || null
  }

  async bulkLookup(ips: string[]): Promise<ThreatIntelligenceData[]> {
    // Simulate bulk IP lookup
    await this.delay(800)

    const results: ThreatIntelligenceData[] = []
    const knownThreats = await this.fetchLatestThreats()

    for (const ip of ips) {
      const threat = knownThreats.threats.find((t) => t.ip === ip)
      if (threat) {
        results.push(threat)
      }
    }

    return results
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Geolocation API for IP analysis
export class GeolocationAPI {
  private apiKey: string

  constructor(apiKey = "demo-geo-key-67890") {
    this.apiKey = apiKey
  }

  async getIPLocation(ip: string): Promise<{
    country: string
    countryCode: string
    region: string
    city: string
    latitude: number
    longitude: number
    isp: string
    organization: string
  }> {
    // Simulate geolocation API call
    await this.delay(300)

    // Mock geolocation data based on IP patterns
    const mockLocations = {
      "45.142.214.123": {
        country: "Russia",
        countryCode: "RU",
        region: "Moscow",
        city: "Moscow",
        latitude: 55.7558,
        longitude: 37.6176,
        isp: "Malicious Hosting Ltd",
        organization: "Unknown",
      },
      "103.224.182.245": {
        country: "China",
        countryCode: "CN",
        region: "Beijing",
        city: "Beijing",
        latitude: 39.9042,
        longitude: 116.4074,
        isp: "China Telecom",
        organization: "Compromised Server",
      },
    }

    return (
      mockLocations[ip as keyof typeof mockLocations] || {
        country: "Unknown",
        countryCode: "XX",
        region: "Unknown",
        city: "Unknown",
        latitude: 0,
        longitude: 0,
        isp: "Unknown ISP",
        organization: "Unknown",
      }
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Real-time threat feed updater
export class ThreatFeedUpdater {
  private threatAPI: ThreatIntelligenceAPI
  private updateInterval: number
  private isRunning = false

  constructor(apiKey?: string, updateIntervalMinutes = 15) {
    this.threatAPI = new ThreatIntelligenceAPI(apiKey)
    this.updateInterval = updateIntervalMinutes * 60 * 1000 // Convert to milliseconds
  }

  startAutoUpdate(callback: (threats: ThreatIntelligenceData[]) => void): void {
    if (this.isRunning) return

    this.isRunning = true

    const update = async () => {
      try {
        const response = await this.threatAPI.fetchLatestThreats()
        callback(response.threats)
        console.log(`[v0] Updated ${response.threats.length} threat intelligence entries`)
      } catch (error) {
        console.error("[v0] Failed to update threat intelligence:", error)
      }
    }

    // Initial update
    update()

    // Set up recurring updates
    const intervalId = setInterval(update, this.updateInterval)

    // Store interval ID for cleanup
    ;(this as any).intervalId = intervalId
  }

  stopAutoUpdate(): void {
    if ((this as any).intervalId) {
      clearInterval((this as any).intervalId)
      delete (this as any).intervalId
    }
    this.isRunning = false
  }
}
