"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, Activity, Server, Eye, TrendingUp, Zap, Brain, Target, Clock } from "lucide-react"
import { ThreatOverview } from "@/components/threat-overview"
import { RealTimeMonitoring } from "@/components/real-time-monitoring"
import { SecurityLogs } from "@/components/security-logs"
import { ThreatIntelligence } from "@/components/threat-intelligence"
import AlertCenter from "@/components/alert-center"

interface DashboardStats {
  activeThreats: number
  blockedAttacks: number
  totalTraffic: string
  systemHealth: number
  criticalAlerts: number
  mitigatedIncidents: number
}

export function SecurityDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeThreats: 3,
    blockedAttacks: 1247,
    totalTraffic: "2.4TB",
    systemHealth: 98,
    criticalAlerts: 2,
    mitigatedIncidents: 15,
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Simulate real-time updates
      setStats((prev) => ({
        ...prev,
        blockedAttacks: prev.blockedAttacks + Math.floor(Math.random() * 3),
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
      }))
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DDoS Detection System</h1>
                <p className="text-sm text-muted-foreground">Bank Server Security Operations</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-security"></div>
                <span className="text-sm text-success font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Alerts Banner */}
      {stats.criticalAlerts > 0 && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="container mx-auto px-6 py-3">
            <Alert className="border-destructive/20 bg-transparent">
              <AlertTriangle className="h-4 w-4 text-destructive animate-glow-critical" />
              <AlertTitle className="text-destructive">Critical Security Alert</AlertTitle>
              <AlertDescription className="text-destructive/90">
                {stats.criticalAlerts} active critical threats detected. Immediate attention required.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Threats</CardTitle>
              <Target className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.activeThreats}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +2 from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Attacks</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.blockedAttacks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <Zap className="inline w-3 h-3 mr-1" />
                Auto-mitigated
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Traffic Volume</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalTraffic}</div>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline w-3 h-3 mr-1" />
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
              <Server className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{stats.systemHealth}%</div>
              <Progress value={stats.systemHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Security Logs
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Threat Intel
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ThreatOverview />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <SecurityLogs />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <ThreatIntelligence />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
