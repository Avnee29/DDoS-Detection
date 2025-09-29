"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Brain,
  Globe,
  Search,
  RefreshCw,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  TrendingUp,
  Database,
  Zap,
  Target,
} from "lucide-react"
import {
  ThreatIntelligenceAPI,
  GeolocationAPI,
  ThreatFeedUpdater,
  type ThreatIntelligenceData,
} from "@/lib/threat-intelligence"

interface ThreatAnalysis {
  totalThreats: number
  highRiskThreats: number
  newThreats: number
  blockedIPs: number
  topCountries: Array<{ country: string; count: number; code: string }>
  threatTypes: Array<{ type: string; count: number; color: string }>
  reputationDistribution: Array<{ range: string; count: number }>
}

const threatTypeColors = {
  "Botnet C&C": "#ef4444",
  "DDoS Source": "#f59e0b",
  "Malware C&C": "#dc2626",
  Scanning: "#06b6d4",
  "Brute Force": "#8b5cf6",
  "Tor Exit Node": "#64748b",
  Phishing: "#ec4899",
  Spam: "#84cc16",
}

export function ThreatIntelligence() {
  const [threats, setThreats] = useState<ThreatIntelligenceData[]>([])
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null)
  const [searchIP, setSearchIP] = useState("")
  const [searchResult, setSearchResult] = useState<ThreatIntelligenceData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligenceData | null>(null)

  const threatAPI = new ThreatIntelligenceAPI()
  const geoAPI = new GeolocationAPI()
  const feedUpdater = new ThreatFeedUpdater()

  // Load initial threat data
  const loadThreats = useCallback(async () => {
    setIsUpdating(true)
    try {
      const response = await threatAPI.fetchLatestThreats()
      setThreats(response.threats)
      setLastUpdate(response.lastUpdated)

      // Generate analysis
      const totalThreats = response.threats.length
      const highRiskThreats = response.threats.filter((t) => t.reputationScore >= 90).length
      const newThreats = response.threats.filter(
        (t) => new Date().getTime() - t.lastSeen.getTime() < 24 * 60 * 60 * 1000,
      ).length
      const blockedIPs = response.threats.filter((t) => t.reputationScore >= 80).length

      // Country analysis
      const countryCount = response.threats.reduce(
        (acc, threat) => {
          acc[threat.countryCode] = (acc[threat.countryCode] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topCountries = Object.entries(countryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([code, count]) => ({
          country: getCountryName(code),
          count,
          code,
        }))

      // Threat type analysis
      const typeCount = response.threats.reduce(
        (acc, threat) => {
          acc[threat.threatType] = (acc[threat.threatType] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const threatTypes = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count,
        color: threatTypeColors[type as keyof typeof threatTypeColors] || "#64748b",
      }))

      // Reputation distribution
      const reputationRanges = [
        { range: "90-100", min: 90, max: 100 },
        { range: "80-89", min: 80, max: 89 },
        { range: "70-79", min: 70, max: 79 },
        { range: "60-69", min: 60, max: 69 },
        { range: "0-59", min: 0, max: 59 },
      ]

      const reputationDistribution = reputationRanges.map((range) => ({
        range: range.range,
        count: response.threats.filter((t) => t.reputationScore >= range.min && t.reputationScore <= range.max).length,
      }))

      setAnalysis({
        totalThreats,
        highRiskThreats,
        newThreats,
        blockedIPs,
        topCountries,
        threatTypes,
        reputationDistribution,
      })
    } catch (error) {
      console.error("[v0] Failed to load threat intelligence:", error)
    } finally {
      setIsUpdating(false)
    }
  }, [threatAPI])

  // Search for specific IP
  const searchThreatIP = async () => {
    if (!searchIP.trim()) return

    setIsSearching(true)
    try {
      const result = await threatAPI.lookupIP(searchIP.trim())
      setSearchResult(result)

      if (result) {
        // Get geolocation data
        const geoData = await geoAPI.getIPLocation(result.ip)
        setSearchResult({
          ...result,
          organization: geoData.organization || result.organization,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to search IP:", error)
      setSearchResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Auto-update threat feeds
  useEffect(() => {
    loadThreats()

    // Start auto-update
    feedUpdater.startAutoUpdate((newThreats) => {
      setThreats(newThreats)
      setLastUpdate(new Date())
      console.log("[v0] Threat intelligence updated automatically")
    })

    return () => {
      feedUpdater.stopAutoUpdate()
    }
  }, [loadThreats, feedUpdater])

  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      RU: "Russia",
      CN: "China",
      US: "United States",
      DE: "Germany",
      NL: "Netherlands",
      FR: "France",
      GB: "United Kingdom",
      BR: "Brazil",
      IN: "India",
      KP: "North Korea",
      IR: "Iran",
      XX: "Unknown",
    }
    return countries[code] || code
  }

  const getThreatSeverity = (score: number): { label: string; color: string } => {
    if (score >= 95) return { label: "Critical", color: "destructive" }
    if (score >= 85) return { label: "High", color: "destructive" }
    if (score >= 70) return { label: "Medium", color: "secondary" }
    if (score >= 50) return { label: "Low", color: "outline" }
    return { label: "Minimal", color: "outline" }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Threat Intelligence Management
              </CardTitle>
              <CardDescription>Real-time threat data aggregation and analysis</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadThreats} variant="outline" size="sm" disabled={isUpdating}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
                Update Feeds
              </Button>
              {lastUpdate && (
                <div className="text-xs text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search IP address (e.g., 192.168.1.100)"
                  value={searchIP}
                  onChange={(e) => setSearchIP(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchThreatIP()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={searchThreatIP} disabled={isSearching || !searchIP.trim()}>
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <Alert className="border-primary/20 bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <strong>Threat Intelligence Result: {searchResult.ip}</strong>
                <Button variant="ghost" size="sm" onClick={() => setSearchResult(null)}>
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Threat Type:</strong> {searchResult.threatType}
                </div>
                <div>
                  <strong>Reputation Score:</strong> {searchResult.reputationScore}/100
                </div>
                <div>
                  <strong>Country:</strong> {getCountryName(searchResult.countryCode)}
                </div>
                <div>
                  <strong>Organization:</strong> {searchResult.organization}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getThreatSeverity(searchResult.reputationScore).color as any}>
                  {getThreatSeverity(searchResult.reputationScore).label}
                </Badge>
                <Badge variant="outline">Confidence: {(searchResult.confidenceLevel * 100).toFixed(0)}%</Badge>
                <Badge variant="outline">Source: {searchResult.source}</Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {searchIP && !searchResult && !isSearching && (
        <Alert className="border-success/20 bg-success/10">
          <Shield className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            IP address {searchIP} not found in threat intelligence databases. This IP appears to be clean.
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Overview */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analysis.totalThreats}</div>
              <p className="text-xs text-muted-foreground">Active threat indicators</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{analysis.highRiskThreats}</div>
              <p className="text-xs text-muted-foreground">Score ≥ 90</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Threats</CardTitle>
              <Zap className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{analysis.newThreats}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-blocked</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{analysis.blockedIPs}</div>
              <p className="text-xs text-muted-foreground">Score ≥ 80</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="threats">Threat Types</TabsTrigger>
          <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reputation Distribution */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Reputation Score Distribution
                  </CardTitle>
                  <CardDescription>Threat severity breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysis.reputationDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                      <XAxis dataKey="range" stroke="oklch(0.65 0.01 240)" />
                      <YAxis stroke="oklch(0.65 0.01 240)" />
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

              {/* Threat Types */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-destructive" />
                    Threat Type Distribution
                  </CardTitle>
                  <CardDescription>Attack vector breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analysis.threatTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analysis.threatTypes.map((entry, index) => (
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
                    {analysis.threatTypes.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-muted-foreground">
                          {item.type} ({item.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          {analysis && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Geographic Threat Distribution
                </CardTitle>
                <CardDescription>Top threat source countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analysis.topCountries} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.04 240)" />
                      <XAxis type="number" stroke="oklch(0.65 0.01 240)" />
                      <YAxis dataKey="country" type="category" stroke="oklch(0.65 0.01 240)" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.12 0.03 240)",
                          border: "1px solid oklch(0.25 0.04 240)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="oklch(0.62 0.25 15)" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Country Risk Assessment</h4>
                    {analysis.topCountries.slice(0, 8).map((country, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{country.country}</span>
                          <Badge variant="outline" className="text-xs">
                            {country.code}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{country.count} threats</span>
                          <Progress
                            value={(country.count / analysis.topCountries[0].count) * 100}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Active Threat Indicators
              </CardTitle>
              <CardDescription>Current high-risk IP addresses and threat actors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {threats
                  .filter((threat) => threat.reputationScore >= 70)
                  .slice(0, 20)
                  .map((threat, index) => {
                    const severity = getThreatSeverity(threat.reputationScore)
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/20 ${
                          threat.reputationScore >= 90
                            ? "bg-destructive/10 border-destructive/20"
                            : threat.reputationScore >= 80
                              ? "bg-warning/10 border-warning/20"
                              : "bg-muted/10 border-border"
                        }`}
                        onClick={() => setSelectedThreat(threat)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={severity.color as any}>{severity.label}</Badge>
                            <span className="font-mono text-sm">{threat.ip}</span>
                            <Badge variant="outline" className="text-xs">
                              {threat.threatType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{threat.reputationScore}/100</span>
                            <Progress value={threat.reputationScore} className="w-16 h-2" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {getCountryName(threat.countryCode)} • {threat.organization}
                          </span>
                          <span>Last seen: {threat.lastSeen.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Live Threat Feeds
              </CardTitle>
              <CardDescription>Real-time threat intelligence updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">ThreatFeed-Premium</span>
                    </div>
                    <p className="text-sm text-muted-foreground">High-confidence threat indicators</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last update: {lastUpdate?.toLocaleTimeString() || "Never"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="font-medium text-primary">ThreatFeed-Community</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Community-sourced indicators</p>
                    <p className="text-xs text-muted-foreground mt-1">Auto-updating every 15 minutes</p>
                  </div>

                  <div className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
                      <span className="font-medium text-chart-2">Geolocation API</span>
                    </div>
                    <p className="text-sm text-muted-foreground">IP geolocation and ISP data</p>
                    <p className="text-xs text-muted-foreground mt-1">Real-time lookups</p>
                  </div>
                </div>

                <Alert className="border-primary/20 bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Threat intelligence feeds are automatically updated every 15 minutes. The system processes{" "}
                    {threats.length} active threat indicators from multiple premium and community sources.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <Alert className="border-primary/20 bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <strong>Threat Details: {selectedThreat.ip}</strong>
                <Button variant="ghost" size="sm" onClick={() => setSelectedThreat(null)}>
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Threat Type:</strong> {selectedThreat.threatType}
                </div>
                <div>
                  <strong>Reputation:</strong> {selectedThreat.reputationScore}/100
                </div>
                <div>
                  <strong>Country:</strong> {getCountryName(selectedThreat.countryCode)}
                </div>
                <div>
                  <strong>Organization:</strong> {selectedThreat.organization}
                </div>
                <div>
                  <strong>First Seen:</strong> {selectedThreat.firstSeen.toLocaleDateString()}
                </div>
                <div>
                  <strong>Last Seen:</strong> {selectedThreat.lastSeen.toLocaleDateString()}
                </div>
                <div>
                  <strong>Source:</strong> {selectedThreat.source}
                </div>
                <div>
                  <strong>Confidence:</strong> {(selectedThreat.confidenceLevel * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getThreatSeverity(selectedThreat.reputationScore).color as any}>
                  {getThreatSeverity(selectedThreat.reputationScore).label} Risk
                </Badge>
                <Badge variant={selectedThreat.isActive ? "default" : "secondary"}>
                  {selectedThreat.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
