import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Clock, 
  Activity,
  Thermometer,
  Wind,
  Eye
} from "lucide-react";

interface PropCategoriesProps {
  selectedSport: string;
}

interface PropAnalytics {
  category: string;
  topPlayers: Array<{
    name: string;
    team: string;
    currentForm: number; // 0-100
    matchupRating: number; // 0-100
    environmentalEdge: number; // 0-100
    projectedValue: number;
    line: number;
    edge: number;
    confidence: number;
    recentTrend: string; // "hot", "cold", "steady"
    keyFactors: string[];
  }>;
}

export default function PropCategories({ selectedSport }: PropCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState("passing_yards");

  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/${selectedSport}/prop-analytics`],
    enabled: !!selectedSport,
  });

  const categories = selectedSport === 'nfl' ? [
    { id: "passing_yards", name: "Passing Yards", icon: "🏈", color: "bg-blue-600" },
    { id: "rushing_yards", name: "Rushing Yards", icon: "🏃", color: "bg-green-600" },
    { id: "receiving_yards", name: "Receiving Yards", icon: "🤲", color: "bg-purple-600" },
    { id: "touchdowns", name: "Touchdowns", icon: "🔥", color: "bg-red-600" },
    { id: "receptions", name: "Receptions", icon: "✋", color: "bg-yellow-600" },
    { id: "completions", name: "Completions", icon: "🎯", color: "bg-indigo-600" }
  ] : selectedSport === 'mlb' ? [
    { id: "home_runs", name: "Home Runs", icon: "⚾", color: "bg-blue-600" },
    { id: "rbis", name: "RBIs", icon: "🏃", color: "bg-green-600" },
    { id: "hits", name: "Hits", icon: "🥊", color: "bg-purple-600" },
    { id: "strikeouts", name: "Strikeouts", icon: "❌", color: "bg-red-600" },
    { id: "stolen_bases", name: "Stolen Bases", icon: "💨", color: "bg-yellow-600" },
    { id: "walks", name: "Walks", icon: "🚶", color: "bg-indigo-600" }
  ] : [
    { id: "points", name: "Points", icon: "🏀", color: "bg-orange-600" },
    { id: "rebounds", name: "Rebounds", icon: "🔄", color: "bg-green-600" },
    { id: "assists", name: "Assists", icon: "🤝", color: "bg-blue-600" },
    { id: "threes", name: "3-Pointers", icon: "🎯", color: "bg-purple-600" },
    { id: "steals", name: "Steals", icon: "👐", color: "bg-red-600" },
    { id: "blocks", name: "Blocks", icon: "🛡️", color: "bg-indigo-600" }
  ];

  // Mock current analytics data - in production this would come from real APIs
  const getCurrentAnalytics = (category: string): PropAnalytics => {
    const mockData: Record<string, PropAnalytics> = {
      passing_yards: {
        category: "Passing Yards",
        topPlayers: [
          {
            name: "Josh Allen",
            team: "BUF",
            currentForm: 92,
            matchupRating: 88,
            environmentalEdge: 95,
            projectedValue: 285,
            line: 260.5,
            edge: 24.5,
            confidence: 89,
            recentTrend: "hot",
            keyFactors: ["Wind <10mph", "vs 32nd ranked pass D", "3 games 300+ yards"]
          },
          {
            name: "Tua Tagovailoa",
            team: "MIA",
            currentForm: 87,
            matchupRating: 82,
            environmentalEdge: 85,
            projectedValue: 275,
            line: 265.5,
            edge: 9.5,
            confidence: 76,
            recentTrend: "steady",
            keyFactors: ["Dome game", "Hill/Waddle healthy", "Soft secondary matchup"]
          },
          {
            name: "Lamar Jackson",
            team: "BAL",
            currentForm: 85,
            matchupRating: 75,
            environmentalEdge: 70,
            projectedValue: 245,
            line: 245.5,
            edge: -0.5,
            confidence: 45,
            recentTrend: "cold",
            keyFactors: ["Cold weather", "Strong pass rush", "Running game focus"]
          }
        ]
      },
      touchdowns: {
        category: "Touchdowns",
        topPlayers: [
          {
            name: "Christian McCaffrey",
            team: "SF",
            currentForm: 95,
            matchupRating: 90,
            environmentalEdge: 88,
            projectedValue: 1.8,
            line: 0.5,
            edge: 1.3,
            confidence: 91,
            recentTrend: "hot",
            keyFactors: ["Red zone king", "vs 28th ranked run D", "5 TDs last 3 games"]
          },
          {
            name: "Tyreek Hill",
            team: "MIA",
            currentForm: 89,
            matchupRating: 85,
            environmentalEdge: 82,
            projectedValue: 1.2,
            line: 0.5,
            edge: 0.7,
            confidence: 78,
            recentTrend: "hot",
            keyFactors: ["Speed advantage", "Slot coverage weak", "4 TDs in 2 games"]
          }
        ]
      }
    };

    return mockData[category] || mockData.passing_yards;
  };

  const currentData = getCurrentAnalytics(selectedCategory);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "hot": return "🔥";
      case "cold": return "❄️";
      default: return "⚡";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "hot": return "text-red-400";
      case "cold": return "text-blue-400";
      default: return "text-yellow-400";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Activity className="h-6 w-6 mr-2 text-blue-400" />
          Live Prop Analytics - {selectedSport.toUpperCase()}
        </h1>
        <div className="text-sm text-slate-400 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Updated 2 min ago
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`p-3 ${
              selectedCategory === category.id 
                ? category.color 
                : "border-slate-600 hover:bg-slate-700"
            }`}
            onClick={() => setSelectedCategory(category.id)}
            data-testid={`button-category-${category.id}`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{category.icon}</div>
              <div className="text-xs font-medium">{category.name}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Category Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {currentData.category} - Today's Edge Plays
          </h2>
          <Badge className="bg-green-600 text-white">
            {currentData.topPlayers.length} Live Opportunities
          </Badge>
        </div>

        {/* Player Cards */}
        <div className="space-y-4">
          {currentData.topPlayers.map((player, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center">
                      <span className={`text-2xl mr-2 ${getTrendColor(player.recentTrend)}`}>
                        {getTrendIcon(player.recentTrend)}
                      </span>
                      {player.name} - {player.team}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      Edge: {player.edge > 0 ? '+' : ''}{player.edge.toFixed(1)} | 
                      Confidence: {player.confidence}%
                    </p>
                  </div>
                  <Badge className={`text-lg font-bold px-4 py-2 ${
                    player.edge > 15 ? 'bg-green-600' :
                    player.edge > 5 ? 'bg-yellow-600' : 'bg-red-600'
                  } text-white`}>
                    {player.projectedValue} ({player.line > 0 ? '+' : ''}{player.line})
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analytics Meters */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-slate-300 mb-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Current Form
                    </div>
                    <Progress value={player.currentForm} className="h-2" />
                    <div className="text-xs text-slate-400 mt-1">{player.currentForm}/100</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-slate-300 mb-2">
                      <Target className="h-4 w-4 mr-1" />
                      Matchup Rating
                    </div>
                    <Progress value={player.matchupRating} className="h-2" />
                    <div className="text-xs text-slate-400 mt-1">{player.matchupRating}/100</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-slate-300 mb-2">
                      <Thermometer className="h-4 w-4 mr-1" />
                      Environmental Edge
                    </div>
                    <Progress value={player.environmentalEdge} className="h-2" />
                    <div className="text-xs text-slate-400 mt-1">{player.environmentalEdge}/100</div>
                  </div>
                </div>

                {/* Key Factors */}
                <div>
                  <div className="flex items-center text-sm font-medium text-slate-300 mb-2">
                    <Eye className="h-4 w-4 mr-1" />
                    Live Intelligence Factors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {player.keyFactors.map((factor, factorIndex) => (
                      <Badge 
                        key={factorIndex}
                        variant="outline" 
                        className="text-xs border-blue-600 text-blue-400"
                      >
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    data-testid={`button-add-${player.name.replace(' ', '-').toLowerCase()}`}
                  >
                    Add to Slip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real-Time Market Alert */}
        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <div className="font-semibold text-yellow-400">Market Movement Alert</div>
                  <div className="text-xs text-slate-400">
                    Lines moving based on sharp action - refresh for latest
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-400">
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}