import React, { useState } from "react";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSlate, useElitePlayers, usePropSuggestions } from "@/hooks/useSportsData";
import { PerformanceChart } from "@/components/Charts/PerformanceChart";
import type { FilterState } from "@/lib/types";

interface AnalyticsProps {
  selectedSport: string;
  filters: FilterState;
}

export default function Analytics({ selectedSport, filters }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");
  const [analyticsView, setAnalyticsView] = useState<"performance" | "trends" | "props">("performance");

  const { data: slateData } = useSlate(selectedSport);
  const { data: elitePlayers } = useElitePlayers(selectedSport);
  const { data: propSuggestions } = usePropSuggestions(selectedSport);

  const getAnalyticsData = () => {
    // Generate mock analytics data based on timeframe
    const baseValue = timeframe === "today" ? 100 : timeframe === "week" ? 700 : 3000;
    return {
      totalVolume: baseValue + Math.floor(Math.random() * 200),
      winRate: 0.65 + Math.random() * 0.15,
      roi: 0.08 + Math.random() * 0.12,
      avgEdge: 75 + Math.random() * 20,
      topProps: propSuggestions?.suggestedProps || [],
      edgeDistribution: [
        { range: "90-100", count: Math.floor(Math.random() * 10) + 5 },
        { range: "80-89", count: Math.floor(Math.random() * 20) + 15 },
        { range: "70-79", count: Math.floor(Math.random() * 30) + 25 },
        { range: "60-69", count: Math.floor(Math.random() * 40) + 35 },
      ]
    };
  };

  const analytics = getAnalyticsData();

  const renderPerformanceView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Edge Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.edgeDistribution.map((item) => (
              <div key={item.range} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.range}</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${(item.count / 50) * 100}px` }}
                  />
                  <span className="text-sm text-slate-400 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={[]} />
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {(analytics.winRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {(analytics.roi * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">ROI</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrendsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Edge Score Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Edge Score</span>
              <Badge className="bg-blue-500">
                {analytics.avgEdge.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Elite Players (90+)</span>
              <Badge className="bg-yellow-500 text-black">
                {elitePlayers?.filter(p => parseFloat(p.edgeScore) >= 90).length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>High Confidence (4+ stars)</span>
              <Badge className="bg-green-500">
                {elitePlayers?.filter(p => p.confidence >= 4).length || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Volume Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {analytics.totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                Total Props Analyzed ({timeframe})
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {slateData?.games || 0}
                </div>
                <div className="text-xs text-slate-400">Games</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {slateData?.totalEdges || 0}
                </div>
                <div className="text-xs text-slate-400">Player Edges</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPropsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Top Prop Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topProps.map((prop, index) => (
              <div key={prop.type} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{prop.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-400">
                    {prop.confidence}% confidence
                  </div>
                  <div className="text-xs text-slate-400">
                    {prop.count} opportunities
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Prop Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {analytics.topProps.length > 0 ? analytics.topProps[0].confidence : 0}%
              </div>
              <div className="text-sm text-slate-400">
                Best Prop Confidence
              </div>
            </div>
            <div className="space-y-2">
              {analytics.topProps.slice(0, 3).map((prop) => (
                <div key={prop.type} className="flex justify-between text-sm">
                  <span className="text-slate-300">{prop.type}</span>
                  <span className="text-blue-400">{prop.count} props</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <span data-testid="page-title">Analytics Dashboard</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Comprehensive performance analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600" data-testid="select-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-slate-700 rounded-lg p-1">
            <Button
              variant={analyticsView === "performance" ? "default" : "ghost"}
              size="sm"
              onClick={() => setAnalyticsView("performance")}
              className={analyticsView === "performance" ? "bg-blue-600" : ""}
              data-testid="button-view-performance"
            >
              Performance
            </Button>
            <Button
              variant={analyticsView === "trends" ? "default" : "ghost"}
              size="sm"
              onClick={() => setAnalyticsView("trends")}
              className={analyticsView === "trends" ? "bg-blue-600" : ""}
              data-testid="button-view-trends"
            >
              Trends
            </Button>
            <Button
              variant={analyticsView === "props" ? "default" : "ghost"}
              size="sm"
              onClick={() => setAnalyticsView("props")}
              className={analyticsView === "props" ? "bg-blue-600" : ""}
              data-testid="button-view-props"
            >
              Props
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-volume">
              {analytics.totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Props analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="metric-win-rate">
              {(analytics.winRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400" data-testid="metric-roi">
              {(analytics.roi * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Edge</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="metric-avg-edge">
              {analytics.avgEdge.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Content Based on View */}
      <div data-testid={`analytics-view-${analyticsView}`}>
        {analyticsView === "performance" && renderPerformanceView()}
        {analyticsView === "trends" && renderTrendsView()}
        {analyticsView === "props" && renderPropsView()}
      </div>

      {/* Additional Insights */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-400">Opportunities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>High-value props in {selectedSport.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Exploitable matchups identified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Strong edge scores across multiple props</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-yellow-400">Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Focus on elite player props</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Consider parlay opportunities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Monitor weather conditions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
