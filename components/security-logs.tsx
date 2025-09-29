"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Server,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SecurityLog {
  id: string
  timestamp: Date
  logLevel: "INFO" | "WARN" | "ERROR" | "CRITICAL"
  eventType: string
  sourceSystem: string
  message: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
  processed: boolean
}

const logLevelColors = {
  INFO: "oklch(0.65 0.15 200)", // Cyan
  WARN: "oklch(0.75 0.20 65)", // Amber
  ERROR: "oklch(0.62 0.25 15)", // Red
  CRITICAL: "oklch(0.62 0.25 15)", // Red with glow
}

const logLevelIcons = {
  INFO: Info,
  WARN: AlertTriangle,
  ERROR: AlertCircle,
  CRITICAL: XCircle,
}

export function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [systemFilter, setSystemFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null)

  const supabase = createClient()

  // Generate sample logs for demonstration
  const generateSampleLogs = (): SecurityLog[] => {
    const eventTypes = [
      "DDoS_Attack_Detected",
      "Suspicious_Traffic",
      "Mitigation_Failed",
      "Traffic_Baseline_Updated",
      "Attack_Escalation",
      "System_Health_Check",
      "Firewall_Rule_Updated",
      "Threat_Intelligence_Updated",
      "User_Login_Failed",
      "Database_Connection_Error",
    ]

    const sourceSystems = [
      "ML_Engine",
      "Traffic_Analyzer",
      "Defense_System",
      "Alert_System",
      "Firewall",
      "Database",
      "Authentication",
      "Threat_Intel",
    ]

    const sampleIPs = [
      "192.168.1.100",
      "10.0.0.50",
      "172.16.0.25",
      "203.0.113.15",
      "198.51.100.30",
      "45.142.214.123",
      "103.224.182.245",
    ]

    const sampleLogs: SecurityLog[] = []

    for (let i = 0; i < 100; i++) {
      const level = ["INFO", "WARN", "ERROR", "CRITICAL"][Math.floor(Math.random() * 4)] as SecurityLog["logLevel"]
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const sourceSystem = sourceSystems[Math.floor(Math.random() * sourceSystems.length)]
      const ip = Math.random() > 0.3 ? sampleIPs[Math.floor(Math.random() * sampleIPs.length)] : undefined

      let message = ""
      let metadata = {}

      switch (eventType) {
        case "DDoS_Attack_Detected":
          message = `High-volume traffic detected from ${ip || "multiple sources"}`
          metadata = { attack_type: "volumetric", confidence: 0.96, peak_rate: 15000 }
          break
        case "Suspicious_Traffic":
          message = `Unusual request pattern detected from ${ip}`
          metadata = { request_rate: 1500, threshold: 100, pattern: "bot_like" }
          break
        case "Mitigation_Failed":
          message = `Failed to block malicious IP ${ip}`
          metadata = { reason: "rate_limit_exceeded", attempts: 3 }
          break
        case "Traffic_Baseline_Updated":
          message = "Normal traffic baseline recalculated"
          metadata = { new_baseline: 85.5, previous: 82.1, variance: 0.15 }
          break
        case "Attack_Escalation":
          message = "DDoS attack severity increased to CRITICAL"
          metadata = { previous_severity: "HIGH", new_severity: "CRITICAL", escalation_reason: "traffic_spike" }
          break
        default:
          message = `${eventType.replace(/_/g, " ").toLowerCase()} event occurred`
          metadata = { system: sourceSystem, timestamp: new Date().toISOString() }
      }

      sampleLogs.push({
        id: `log_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        logLevel: level,
        eventType,
        sourceSystem,
        message,
        metadata,
        ipAddress: ip,
        userAgent: Math.random() > 0.7 ? "Mozilla/5.0 (compatible; SecurityBot/1.0)" : undefined,
        processed: Math.random() > 0.2,
      })
    }

    return sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Load logs
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const sampleLogs = generateSampleLogs()
      setLogs(sampleLogs)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = logs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.sourceSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ipAddress?.includes(searchTerm),
      )
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.logLevel === levelFilter)
    }

    // System filter
    if (systemFilter !== "all") {
      filtered = filtered.filter((log) => log.sourceSystem === systemFilter)
    }

    // Time filter
    const now = new Date()
    const timeFilterMs = {
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    }[timeFilter]

    if (timeFilterMs) {
      filtered = filtered.filter((log) => now.getTime() - log.timestamp.getTime() <= timeFilterMs)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, levelFilter, systemFilter, timeFilter])

  // Analytics data
  const analyticsData = useMemo(() => {
    const levelCounts = filteredLogs.reduce(
      (acc, log) => {
        acc[log.logLevel] = (acc[log.logLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const systemCounts = filteredLogs.reduce(
      (acc, log) => {
        acc[log.sourceSystem] = (acc[log.sourceSystem] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i), 0, 0, 0)
      const hourLogs = filteredLogs.filter((log) => {
        const logHour = new Date(log.timestamp)
        logHour.setMinutes(0, 0, 0)
        return logHour.getTime() === hour.getTime()
      })

      return {
        hour: hour.getHours().toString().padStart(2, "0") + ":00",
        total: hourLogs.length,
        critical: hourLogs.filter((l) => l.logLevel === "CRITICAL").length,
        error: hourLogs.filter((l) => l.logLevel === "ERROR").length,
        warn: hourLogs.filter((l) => l.logLevel === "WARN").length,
        info: hourLogs.filter((l) => l.logLevel === "INFO").length,
      }
    })

    return {
      levelCounts: Object.entries(levelCounts).map(([level, count]) => ({
        level,
        count,
        color: logLevelColors[level as keyof typeof logLevelColors],
      })),
      systemCounts: Object.entries(systemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([system, count]) => ({ system, count })),
      hourlyData,
    }
  }, [filteredLogs])

  const refreshLogs = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newLogs = generateSampleLogs()
      setLogs(newLogs)
      setIsLoading(false)
    }, 500)
  }

  const exportLogs = () => {
    const csvContent = [
      "Timestamp,Level,Event Type,Source System,Message,IP Address",
      ...filteredLogs.map((log) =>
        [
          log.timestamp.toISOString(),
          log.logLevel,
          log.eventType,
          log.sourceSystem,
          `"${log.message.replace(/"/g, '""')}"`,
          log.ipAddress || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const uniqueSystems = Array.from(new Set(logs.map((log) => log.sourceSystem)))

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Security Logs Analysis
              </CardTitle>
              <CardDescription>Comprehensive security event monitoring and analysis</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refreshLogs} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                {uniqueSystems.map((system) => (
                  <SelectItem key={system} value={system}>
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Log Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                <Server className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{filteredLogs.length}</div>
                <p className="text-xs text-muted-foreground">Filtered results</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {filteredLogs.filter((l) => l.logLevel === "CRITICAL").length}
                </div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">
                  {(
                    (filteredLogs.filter((l) => l.logLevel === "ERROR" || l.logLevel === "CRITICAL").length /
                      filteredLogs.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Error/Critical ratio</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <Eye className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{filteredLogs.filter((l) => l.processed).length}</div>
                <p className="text-xs text-muted-foreground">Analyzed logs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Distribution */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Hourly Log Distribution
                </CardTitle>
                <CardDescription>Log volume by hour and severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                    <XAxis dataKey="hour" stroke="oklch(0.65 0.01 240)" />
                    <YAxis stroke="oklch(0.65 0.01 240)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.12 0.03 240)",
                        border: "1px solid oklch(0.25 0.04 240)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="critical" stackId="a" fill="oklch(0.62 0.25 15)" />
                    <Bar dataKey="error" stackId="a" fill="oklch(0.75 0.20 65)" />
                    <Bar dataKey="warn" stackId="a" fill="oklch(0.68 0.18 145)" />
                    <Bar dataKey="info" stackId="a" fill="oklch(0.65 0.15 200)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Log Level Distribution */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-chart-2" />
                  Log Level Distribution
                </CardTitle>
                <CardDescription>Breakdown by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.levelCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analyticsData.levelCounts.map((entry, index) => (
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
                  {analyticsData.levelCounts.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-muted-foreground">
                        {item.level} ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Activity */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                System Activity
              </CardTitle>
              <CardDescription>Log volume by source system</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.systemCounts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                  <XAxis type="number" stroke="oklch(0.65 0.01 240)" />
                  <YAxis dataKey="system" type="category" stroke="oklch(0.65 0.01 240)" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.03 240)",
                      border: "1px solid oklch(0.25 0.04 240)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="oklch(0.65 0.15 200)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Log List */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Security Logs
              </CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading logs...</span>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No logs match the current filters</div>
                ) : (
                  filteredLogs.slice(0, 50).map((log) => {
                    const IconComponent = logLevelIcons[log.logLevel]
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/20 ${
                          log.logLevel === "CRITICAL"
                            ? "bg-destructive/10 border-destructive/20"
                            : log.logLevel === "ERROR"
                              ? "bg-destructive/5 border-destructive/10"
                              : log.logLevel === "WARN"
                                ? "bg-warning/10 border-warning/20"
                                : "bg-muted/10 border-border"
                        }`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className={`w-4 h-4 ${
                                log.logLevel === "CRITICAL" || log.logLevel === "ERROR"
                                  ? "text-destructive"
                                  : log.logLevel === "WARN"
                                    ? "text-warning"
                                    : "text-primary"
                              }`}
                            />
                            <Badge
                              variant={
                                log.logLevel === "CRITICAL" || log.logLevel === "ERROR"
                                  ? "destructive"
                                  : log.logLevel === "WARN"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {log.logLevel}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.sourceSystem}
                            </Badge>
                            {log.ipAddress && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {log.ipAddress}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-sm text-foreground mb-1">{log.message}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{log.eventType}</span>
                          {!log.processed && (
                            <Badge variant="outline" className="text-xs">
                              Unprocessed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Alert className="border-primary/20 bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <strong>Log Details</strong>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Timestamp:</strong> {selectedLog.timestamp.toLocaleString()}
                </div>
                <div>
                  <strong>Level:</strong> {selectedLog.logLevel}
                </div>
                <div>
                  <strong>Event Type:</strong> {selectedLog.eventType}
                </div>
                <div>
                  <strong>Source System:</strong> {selectedLog.sourceSystem}
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <strong>IP Address:</strong> {selectedLog.ipAddress}
                  </div>
                )}
                <div>
                  <strong>Processed:</strong> {selectedLog.processed ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <strong>Message:</strong> {selectedLog.message}
              </div>
              {selectedLog.metadata && (
                <div>
                  <strong>Metadata:</strong>
                  <pre className="text-xs bg-muted/20 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
