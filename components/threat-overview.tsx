"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Shield, AlertTriangle, TrendingUp, Globe, Zap, Brain } from "lucide-react"

const trafficData = [
  { time: "00:00", normal: 120, suspicious: 5, blocked: 2 },
  { time: "04:00", normal: 98, suspicious: 8, blocked: 3 },
  { time: "08:00", normal: 180, suspicious: 15, blocked: 12 },
  { time: "12:00", normal: 220, suspicious: 25, blocked: 18 },
  { time: "16:00", normal: 195, suspicious: 35, blocked: 28 },
  { time: "20:00", normal: 165, suspicious: 12, blocked: 8 },
]

const attackTypesData = [
  { name: "Volumetric", value: 45, color: "#ef4444" },
  { name: "Protocol", value: 25, color: "#f59e0b" },
  { name: "Application", value: 20, color: "#06b6d4" },
  { name: "Other", value: 10, color: "#8b5cf6" },
]

const mlModelPerformance = [
  { model: "LSTM", accuracy: 96.2, predictions: 1247 },
  { model: "CNN", accuracy: 89.5, predictions: 892 },
  { model: "Random Forest", accuracy: 94.1, predictions: 1156 },
  { model: "SVM", accuracy: 91.8, predictions: 1034 },
]

export function ThreatOverview() {
  const [realtimeStats, setRealtimeStats] = useState({
    currentThreats: 3,
    avgResponseTime: 0.8,
    mlAccuracy: 94.2,
    mitigationRate: 98.5,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats((prev) => ({
        currentThreats: Math.max(0, prev.currentThreats + Math.floor(Math.random() * 3) - 1),
        avgResponseTime: Math.max(0.1, prev.avgResponseTime + (Math.random() - 0.5) * 0.2),
        mlAccuracy: Math.max(90, Math.min(99, prev.mlAccuracy + (Math.random() - 0.5) * 2)),
        mitigationRate: Math.max(95, Math.min(100, prev.mitigationRate + (Math.random() - 0.5) * 1)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{realtimeStats.currentThreats}</div>
            <Badge variant={realtimeStats.currentThreats > 5 ? "destructive" : "secondary"} className="mt-1">
              {realtimeStats.currentThreats > 5 ? "High Risk" : "Monitored"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{realtimeStats.avgResponseTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Average detection</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{realtimeStats.mlAccuracy.toFixed(1)}%</div>
            <Progress value={realtimeStats.mlAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigation Rate</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{realtimeStats.mitigationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Auto-blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Analysis */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Traffic Analysis (24h)
            </CardTitle>
            <CardDescription>Network traffic patterns and threat detection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData}>
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
                <Area
                  type="monotone"
                  dataKey="normal"
                  stackId="1"
                  stroke="oklch(0.65 0.15 200)"
                  fill="oklch(0.65 0.15 200)"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="suspicious"
                  stackId="1"
                  stroke="oklch(0.75 0.20 65)"
                  fill="oklch(0.75 0.20 65)"
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stackId="1"
                  stroke="oklch(0.62 0.25 15)"
                  fill="oklch(0.62 0.25 15)"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attack Types Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-destructive" />
              Attack Types Distribution
            </CardTitle>
            <CardDescription>Breakdown of detected attack vectors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attackTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attackTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.03 240)",
                    border: "1px solid oklch(0.25 0.04 240)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {attackTypesData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ML Model Performance */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-chart-4" />
            ML Model Performance
          </CardTitle>
          <CardDescription>Real-time performance metrics for detection models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mlModelPerformance.map((model, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{model.model}</h4>
                  <Badge variant="outline">{model.accuracy}%</Badge>
                </div>
                <Progress value={model.accuracy} className="mb-2" />
                <p className="text-xs text-muted-foreground">{model.predictions.toLocaleString()} predictions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
