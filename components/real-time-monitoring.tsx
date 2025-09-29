"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { Activity, Shield, AlertTriangle, Play, Pause, RefreshCw, Network, Brain, Target, Server } from "lucide-react"
import { MLModelManager, type TrafficFeatures } from "@/lib/ml-models"
import { ThreatIntelligenceAPI } from "@/lib/threat-intelligence"

interface NetworkPacket {
  id: string
  timestamp: Date
  sourceIP: string
  destIP: string
  protocol: string
  size: number
  threatScore: number
  isBlocked: boolean
}

interface MLPrediction {
  timestamp: Date
  model: string
  confidence: number
  isAnomaly: boolean
  attackType?: string
  processingTime: number
}

export function RealTimeMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [packets, setPackets] = useState<NetworkPacket[]>([])
  const [predictions, setPredictions] = useState<MLPrediction[]>([])
  const [trafficData, setTrafficData] = useState<Array<{ time: string; packets: number; threats: number }>>([])
  const [currentStats, setCurrentStats] = useState({
    packetsPerSecond: 0,
    threatsDetected: 0,
    blockedPackets: 0,
    avgThreatScore: 0,
  })

  const mlManager = new MLModelManager()
  const threatAPI = new ThreatIntelligenceAPI()

  // Simulate real-time packet generation
  const generatePacket = useCallback((): NetworkPacket => {
    const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"]
    const sourceIPs = [
      "192.168.1.100", // Known threat
      "10.0.0.50", // Known threat
      "172.16.0.25", // Known threat
      "192.168.1.10", // Normal
      "192.168.1.11", // Normal
      "203.0.113.15", // Suspicious
      "198.51.100.30", // Suspicious
    ]

    const destIPs = ["10.0.0.1", "10.0.0.2", "10.0.0.3"]

    const sourceIP = sourceIPs[Math.floor(Math.random() * sourceIPs.length)]
    const protocol = protocols[Math.floor(Math.random() * protocols.length)]
    const size = Math.floor(Math.random() * 1500) + 64

    // Calculate threat score based on known patterns
    let threatScore = 0
    if (["192.168.1.100", "10.0.0.50", "172.16.0.25"].includes(sourceIP)) {
      threatScore = 0.8 + Math.random() * 0.2 // High threat
    } else if (["203.0.113.15", "198.51.100.30"].includes(sourceIP)) {
      threatScore = 0.4 + Math.random() * 0.4 // Medium threat
    } else {
      threatScore = Math.random() * 0.3 // Low threat
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      sourceIP,
      destIP: destIPs[Math.floor(Math.random() * destIPs.length)],
      protocol,
      size,
      threatScore,
      isBlocked: threatScore > 0.7,
    }
  }, [])

  // Run ML prediction on packet
  const runMLPrediction = useCallback(
    async (packet: NetworkPacket): Promise<MLPrediction> => {
      const features: TrafficFeatures = {
        packetRate: currentStats.packetsPerSecond,
        packetSize: packet.size,
        protocol: packet.protocol,
        sourceDiversity: 0.8, // Simulated
      }

      const prediction = await mlManager.getBestPrediction(features)

      return {
        timestamp: new Date(),
        model: "Ensemble",
        confidence: prediction.confidence,
        isAnomaly: prediction.isAnomaly,
        attackType: prediction.attackType,
        processingTime: prediction.processingTime,
      }
    },
    [currentStats.packetsPerSecond, mlManager],
  )

  // Real-time monitoring loop
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(async () => {
      // Generate new packets
      const newPackets = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, generatePacket)

      // Run ML predictions
      const newPredictions = await Promise.all(newPackets.map(runMLPrediction))

      setPackets((prev) => [...newPackets, ...prev].slice(0, 100)) // Keep last 100 packets
      setPredictions((prev) => [...newPredictions, ...prev].slice(0, 50)) // Keep last 50 predictions

      // Update traffic data for chart
      const now = new Date()
      const timeStr = now.toLocaleTimeString()
      setTrafficData((prev) => {
        const newData = [
          ...prev,
          {
            time: timeStr,
            packets: newPackets.length,
            threats: newPackets.filter((p) => p.threatScore > 0.5).length,
          },
        ].slice(-20) // Keep last 20 data points

        return newData
      })

      // Update current stats
      setCurrentStats((prev) => {
        const totalPackets = prev.packetsPerSecond + newPackets.length
        const threats = newPackets.filter((p) => p.threatScore > 0.5).length
        const blocked = newPackets.filter((p) => p.isBlocked).length
        const avgThreat = newPackets.reduce((sum, p) => sum + p.threatScore, 0) / newPackets.length

        return {
          packetsPerSecond: totalPackets,
          threatsDetected: prev.threatsDetected + threats,
          blockedPackets: prev.blockedPackets + blocked,
          avgThreatScore: avgThreat || prev.avgThreatScore,
        }
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isMonitoring, generatePacket, runMLPrediction])

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  const resetStats = () => {
    setCurrentStats({
      packetsPerSecond: 0,
      threatsDetected: 0,
      blockedPackets: 0,
      avgThreatScore: 0,
    })
    setPackets([])
    setPredictions([])
    setTrafficData([])
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Real-time Network Monitoring
              </CardTitle>
              <CardDescription>Live traffic analysis and threat detection</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={toggleMonitoring} variant={isMonitoring ? "destructive" : "default"} size="sm">
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? "Pause" : "Start"}
              </Button>
              <Button onClick={resetStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packets/sec</CardTitle>
            <Network className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentStats.packetsPerSecond}</div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-success animate-pulse" : "bg-muted"}`}></div>
              <span className="text-xs text-muted-foreground">{isMonitoring ? "Live" : "Paused"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{currentStats.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">Auto-detected</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Packets</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{currentStats.blockedPackets}</div>
            <p className="text-xs text-muted-foreground">Auto-mitigated</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Threat Score</CardTitle>
            <Brain className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{(currentStats.avgThreatScore * 100).toFixed(1)}%</div>
            <Progress value={currentStats.avgThreatScore * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Flow Chart */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Traffic Flow
            </CardTitle>
            <CardDescription>Real-time packet flow and threat detection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                <XAxis dataKey="time" stroke="oklch(0.65 0.01 240)" />
                <YAxis stroke="oklch(0.65 0.01 240)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.03 240)",
                    border: "1px solid oklch(0.25 0.04 240)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="packets"
                  stroke="oklch(0.65 0.15 200)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.65 0.15 200)", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="oklch(0.62 0.25 15)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.62 0.25 15)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ML Predictions Chart */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-chart-4" />
              ML Prediction Confidence
            </CardTitle>
            <CardDescription>Real-time ML model confidence scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={predictions.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                <XAxis
                  dataKey="processingTime"
                  stroke="oklch(0.65 0.01 240)"
                  label={{ value: "Processing Time (ms)", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  dataKey="confidence"
                  stroke="oklch(0.65 0.01 240)"
                  label={{ value: "Confidence", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.03 240)",
                    border: "1px solid oklch(0.25 0.04 240)",
                    borderRadius: "8px",
                  }}
                />
                <Scatter
                  dataKey="confidence"
                  fill={(entry: any) => (entry.isAnomaly ? "oklch(0.62 0.25 15)" : "oklch(0.68 0.18 145)")}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Packet Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packets */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Live Packet Stream
            </CardTitle>
            <CardDescription>Most recent network packets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {packets.slice(0, 10).map((packet) => (
                <div
                  key={packet.id}
                  className={`p-3 rounded-lg border ${
                    packet.isBlocked
                      ? "bg-destructive/10 border-destructive/20"
                      : packet.threatScore > 0.5
                        ? "bg-warning/10 border-warning/20"
                        : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={packet.isBlocked ? "destructive" : packet.threatScore > 0.5 ? "secondary" : "outline"}
                      >
                        {packet.protocol}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        {packet.sourceIP} → {packet.destIP}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {packet.size}B
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{packet.timestamp.toLocaleTimeString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Threat:</span>
                      <Progress value={packet.threatScore * 100} className="w-16 h-2" />
                      <span className="text-xs font-mono">{(packet.threatScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ML Predictions */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-chart-4" />
              ML Predictions
            </CardTitle>
            <CardDescription>Real-time ML model predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {predictions.slice(0, 10).map((prediction, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    prediction.isAnomaly ? "bg-destructive/10 border-destructive/20" : "bg-success/10 border-success/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={prediction.isAnomaly ? "destructive" : "secondary"}>
                        {prediction.isAnomaly ? "ANOMALY" : "NORMAL"}
                      </Badge>
                      {prediction.attackType && (
                        <Badge variant="outline" className="text-xs">
                          {prediction.attackType}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{prediction.processingTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{prediction.timestamp.toLocaleTimeString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Progress value={prediction.confidence * 100} className="w-16 h-2" />
                      <span className="text-xs font-mono">{(prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Threats Alert */}
      {currentStats.threatsDetected > 10 && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            High threat activity detected! {currentStats.threatsDetected} threats identified in the current session.
            Consider escalating to security team.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
