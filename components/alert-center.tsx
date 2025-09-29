"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Shield, Clock, CheckCircle, Play, Pause, Settings, Filter } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  status: "active" | "acknowledged" | "resolved"
  timestamp: Date
  source: string
  affectedSystems: string[]
  responseActions: string[]
  assignedTo?: string
}

interface Incident {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "investigating" | "resolved"
  createdAt: Date
  resolvedAt?: Date
  affectedSystems: string[]
  timeline: { timestamp: Date; action: string; user: string }[]
}

const severityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const statusColors = {
  active: "bg-red-500/20 text-red-400",
  acknowledged: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-green-500/20 text-green-400",
  open: "bg-red-500/20 text-red-400",
  investigating: "bg-yellow-500/20 text-yellow-400",
}

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Generate sample alerts and incidents
  useEffect(() => {
    const generateAlerts = () => {
      const sampleAlerts: Alert[] = [
        {
          id: "1",
          title: "DDoS Attack Detected",
          description: "High volume of traffic from multiple IPs targeting web servers",
          severity: "critical",
          status: "active",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: "ML Detection Engine",
          affectedSystems: ["Web Server 1", "Web Server 2", "Load Balancer"],
          responseActions: ["Auto-block IPs", "Scale infrastructure", "Notify SOC team"],
        },
        {
          id: "2",
          title: "Suspicious Login Attempts",
          description: "Multiple failed login attempts from foreign IP addresses",
          severity: "high",
          status: "acknowledged",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: "Authentication System",
          affectedSystems: ["Login Portal", "User Database"],
          responseActions: ["Rate limiting enabled", "IP geoblocking active"],
          assignedTo: "Security Team Alpha",
        },
        {
          id: "3",
          title: "Anomalous Network Traffic",
          description: "Unusual traffic patterns detected in internal network",
          severity: "medium",
          status: "active",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          source: "Network Monitor",
          affectedSystems: ["Internal Network", "Database Cluster"],
          responseActions: ["Deep packet inspection", "Traffic analysis"],
        },
        {
          id: "4",
          title: "SSL Certificate Expiring",
          description: "SSL certificate for main domain expires in 7 days",
          severity: "low",
          status: "resolved",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          source: "Certificate Monitor",
          affectedSystems: ["Web Server"],
          responseActions: ["Certificate renewed", "Auto-renewal configured"],
        },
      ]

      const sampleIncidents: Incident[] = [
        {
          id: "INC-001",
          title: "Major DDoS Attack on Banking Portal",
          description: "Coordinated DDoS attack affecting customer access to online banking",
          severity: "critical",
          status: "investigating",
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          affectedSystems: ["Banking Portal", "API Gateway", "Customer Database"],
          timeline: [
            { timestamp: new Date(Date.now() - 45 * 60 * 1000), action: "Incident created", user: "System" },
            { timestamp: new Date(Date.now() - 40 * 60 * 1000), action: "Assigned to SOC Team", user: "Admin" },
            { timestamp: new Date(Date.now() - 35 * 60 * 1000), action: "Mitigation started", user: "SOC Team" },
            { timestamp: new Date(Date.now() - 20 * 60 * 1000), action: "Traffic rerouted", user: "Network Team" },
          ],
        },
        {
          id: "INC-002",
          title: "Database Performance Degradation",
          description: "Slow response times affecting transaction processing",
          severity: "high",
          status: "resolved",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          affectedSystems: ["Transaction Database", "Payment Processing"],
          timeline: [
            { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), action: "Incident created", user: "System" },
            { timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), action: "Database team notified", user: "Admin" },
            {
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              action: "Query optimization applied",
              user: "DB Team",
            },
            { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), action: "Performance restored", user: "DB Team" },
          ],
        },
      ]

      setAlerts(sampleAlerts)
      setIncidents(sampleIncidents)
    }

    generateAlerts()
  }, [])

  // Simulate real-time alert updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Randomly update alert statuses or add new alerts
      if (Math.random() > 0.7) {
        setAlerts((prev) => {
          const updated = [...prev]
          const randomIndex = Math.floor(Math.random() * updated.length)
          if (updated[randomIndex] && updated[randomIndex].status === "active") {
            updated[randomIndex] = {
              ...updated[randomIndex],
              status: Math.random() > 0.5 ? "acknowledged" : "resolved",
            }
          }
          return updated
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const filteredAlerts = alerts.filter((alert) => {
    const severityMatch = selectedSeverity === "all" || alert.severity === selectedSeverity
    const statusMatch = selectedStatus === "all" || alert.status === selectedStatus
    return severityMatch && statusMatch
  })

  const alertStats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === "active").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  }

  const incidentStats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  }

  // Chart data for alert trends
  const alertTrendData = [
    { time: "00:00", alerts: 2 },
    { time: "04:00", alerts: 1 },
    { time: "08:00", alerts: 4 },
    { time: "12:00", alerts: 7 },
    { time: "16:00", alerts: 12 },
    { time: "20:00", alerts: 8 },
    { time: "24:00", alerts: 3 },
  ]

  const severityDistribution = [
    { name: "Critical", value: alerts.filter((a) => a.severity === "critical").length, color: "#ef4444" },
    { name: "High", value: alerts.filter((a) => a.severity === "high").length, color: "#f97316" },
    { name: "Medium", value: alerts.filter((a) => a.severity === "medium").length, color: "#eab308" },
    { name: "Low", value: alerts.filter((a) => a.severity === "low").length, color: "#3b82f6" },
  ]

  const handleAlertAction = (alertId: string, action: "acknowledge" | "resolve") => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: action === "acknowledge" ? "acknowledged" : "resolved" } : alert,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alert Center</h1>
          <p className="text-muted-foreground">Monitor and manage security alerts and incidents</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="gap-2"
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isMonitoring ? "Pause" : "Start"} Monitoring
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{alertStats.active}</div>
            <p className="text-xs text-muted-foreground">{alertStats.total} total alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{alertStats.acknowledged}</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <Shield className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{incidentStats.investigating}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{alertStats.resolved}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <Badge className={severityColors[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                        <Badge className={statusColors[alert.status]}>{alert.status.toUpperCase()}</Badge>
                      </div>
                      <CardDescription>{alert.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>•</span>
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                        {alert.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to: {alert.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, "acknowledge")}
                          >
                            Acknowledge
                          </Button>
                          <Button size="sm" onClick={() => handleAlertAction(alert.id, "resolve")}>
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === "acknowledged" && (
                        <Button size="sm" onClick={() => handleAlertAction(alert.id, "resolve")}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Affected Systems</h4>
                      <div className="flex flex-wrap gap-2">
                        {alert.affectedSystems.map((system) => (
                          <Badge key={system} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Response Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {alert.responseActions.map((action) => (
                          <Badge key={action} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <Badge className={severityColors[incident.severity]}>{incident.severity.toUpperCase()}</Badge>
                        <Badge className={statusColors[incident.status]}>{incident.status.toUpperCase()}</Badge>
                      </div>
                      <CardDescription>{incident.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {incident.id}</span>
                        <span>•</span>
                        <span>Created: {incident.createdAt.toLocaleString()}</span>
                        {incident.resolvedAt && (
                          <>
                            <span>•</span>
                            <span>Resolved: {incident.resolvedAt.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Affected Systems</h4>
                      <div className="flex flex-wrap gap-2">
                        {incident.affectedSystems.map((system) => (
                          <Badge key={system} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Timeline</h4>
                      <div className="space-y-2">
                        {incident.timeline.map((event, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                            <span className="text-muted-foreground">{event.timestamp.toLocaleTimeString()}</span>
                            <span>{event.action}</span>
                            <span className="text-muted-foreground">by {event.user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Alert Trends (24h)</CardTitle>
                <CardDescription>Number of alerts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={alertTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="alerts"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of alerts by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>Average time to acknowledge and resolve alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { category: "Critical", acknowledge: 2.5, resolve: 15.3 },
                      { category: "High", acknowledge: 5.2, resolve: 32.1 },
                      { category: "Medium", acknowledge: 12.8, resolve: 68.4 },
                      { category: "Low", acknowledge: 25.6, resolve: 120.2 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="acknowledge" fill="#06b6d4" name="Time to Acknowledge (min)" />
                    <Bar dataKey="resolve" fill="#10b981" name="Time to Resolve (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
