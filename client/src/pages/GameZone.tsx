import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Wind, 
  Thermometer, 
  Users, 
  Target,
  Zap,
  Eye,
  ChevronRight
} from "lucide-react";
import { useSlate } from "@/hooks/useSportsData";

interface GameZoneProps {
  selectedSport: string;
}

export default function GameZone({ selectedSport }: GameZoneProps) {
  const { data: slateData } = useSlate(selectedSport);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const sampleGames = [
    {
      id: "game1",
      homeTeam: "Atlanta Braves", 
      awayTeam: "Miami Marlins",
      homeAbbr: "ATL",
      awayAbbr: "MIA", 
      startTime: "7:20 PM EST",
      venue: "Truist Park",
      pitcher: {
        home: { name: "Spencer Strider", era: "2.85", k9: "13.8" },
        away: { name: "Sandy Alcantara", era: "3.12", k9: "8.9" }
      },
      weather: { temp: 78, wind: "SE 8mph", conditions: "Clear" },
      umpire: "Joe West",
      factors: {
        parkFactor: 1.02,
        windFactor: "Neutral", 
        umpirezoneSize: "Tight (K+ 12%)"
      }
    },
    {
      id: "game2", 
      homeTeam: "Baltimore Ravens",
      awayTeam: "Kansas City Chiefs",
      homeAbbr: "BAL",
      awayAbbr: "KC",
      startTime: "8:15 PM EST",
      venue: "M&T Bank Stadium", 
      quarterback: {
        home: { name: "Lamar Jackson", qbr: "87.3", td_int: "24-7" },
        away: { name: "Patrick Mahomes", qbr: "91.2", td_int: "28-9" }
      },
      weather: { temp: 42, wind: "NW 12mph", conditions: "Partly Cloudy" },
      factors: {
        pace: "Fast",
        defense: { bal: "3rd vs Pass", kc: "8th vs Rush" }
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Target className="h-6 w-6 text-blue-400 mr-3" />
          Game Zone — Prop Finder Intelligence
        </h1>
        <p className="text-slate-400">
          Deep-dive matchup analysis with pitcher/batter splits, weather factors, and live edge detection
        </p>
      </div>

      {/* Game List */}
      <div className="grid gap-4">
        {sampleGames.map((game) => (
          <Card key={game.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Teams */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{game.awayAbbr}</div>
                    <div className="text-sm text-slate-400">{game.awayTeam}</div>
                  </div>
                  <div className="text-2xl font-bold text-slate-500">@</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{game.homeAbbr}</div>
                    <div className="text-sm text-slate-400">{game.homeTeam}</div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="text-center">
                  <div className="text-white font-medium">{game.startTime}</div>
                  <div className="text-sm text-slate-400">{game.venue}</div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-4">
                  {/* Weather */}
                  <div className="flex items-center space-x-1 text-sm">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300">{game.weather.temp}°</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <Wind className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">{game.weather.wind}</span>
                  </div>
                  
                  {/* Action */}
                  <Button 
                    size="sm"
                    onClick={() => setSelectedGame(game.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid={`button-analyze-${game.id}`}
                  >
                    Analyze <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Game Deep Dive */}
      {selectedGame && (
        <Card className="bg-slate-800 border-slate-700 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🔍 Matchup Analysis: {sampleGames.find(g => g.id === selectedGame)?.awayAbbr} @ {sampleGames.find(g => g.id === selectedGame)?.homeAbbr}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedGame(null)}
                className="text-slate-400"
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pitchers" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
                <TabsTrigger value="batters">Batters</TabsTrigger>
                <TabsTrigger value="factors">Game Factors</TabsTrigger>
                <TabsTrigger value="props">Live Props</TabsTrigger>
              </TabsList>

              <TabsContent value="pitchers" className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Home Pitcher */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">
                        Spencer Strider (ATL)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">ERA:</span>
                          <span className="text-white ml-2 font-medium">2.85</span>
                        </div>
                        <div>
                          <span className="text-slate-400">K/9:</span>
                          <span className="text-white ml-2 font-medium">13.8</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-300">Pitch Mix vs RHB:</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Fastball:</span>
                            <span className="text-white">52% (98.2 mph)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Slider:</span>
                            <span className="text-white">35% (88.7 mph)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Changeup:</span>
                            <span className="text-white">13% (90.1 mph)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-600">
                        <div className="text-xs text-slate-400 mb-1">Last 5 Starts:</div>
                        <div className="text-sm text-white">4-1, 2.12 ERA, 47 K in 34 IP</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Away Pitcher */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">
                        Sandy Alcantara (MIA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">ERA:</span>
                          <span className="text-white ml-2 font-medium">3.12</span>
                        </div>
                        <div>
                          <span className="text-slate-400">K/9:</span>
                          <span className="text-white ml-2 font-medium">8.9</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-300">Pitch Mix vs RHB:</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sinker:</span>
                            <span className="text-white">48% (97.1 mph)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Changeup:</span>
                            <span className="text-white">28% (89.3 mph)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Slider:</span>
                            <span className="text-white">24% (86.2 mph)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-600">
                        <div className="text-xs text-slate-400 mb-1">Last 5 Starts:</div>
                        <div className="text-sm text-white">2-3, 3.88 ERA, 31 K in 32 IP</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="batters" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Sample batter cards */}
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">Ronald Acuna Jr.</h4>
                          <Badge className="bg-green-500 text-black text-xs">HOT</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">vs RHP Sliders:</span>
                            <span className="text-white">.340 AVG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">vs Changeups:</span>
                            <span className="text-yellow-400">.210 AVG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">HR vs RHP:</span>
                            <span className="text-white">8% rate</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">Jazz Chisholm Jr.</h4>
                          <Badge className="bg-orange-500 text-black text-xs">COLD</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">vs RHP Fastballs:</span>
                            <span className="text-white">.285 AVG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">vs Sliders:</span>
                            <span className="text-red-400">.180 AVG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Last 10 games:</span>
                            <span className="text-red-400">2-32</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="factors" className="mt-6">
                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <Thermometer className="h-5 w-5 text-orange-400 mr-2" />
                        Weather
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="text-white">78°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wind:</span>
                        <span className="text-white">SE 8mph</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">HR Impact:</span>
                        <span className="text-green-400">+2%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <Users className="h-5 w-5 text-blue-400 mr-2" />
                        Umpire
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Home Plate:</span>
                        <span className="text-white">Joe West</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Strike Zone:</span>
                        <span className="text-yellow-400">Tight</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">K Rate Impact:</span>
                        <span className="text-red-400">+12%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                        Park Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">HR Factor:</span>
                        <span className="text-white">1.02</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dimensions:</span>
                        <span className="text-white">325-400-325</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Foul Territory:</span>
                        <span className="text-slate-400">Average</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="props" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center text-slate-400">
                    <Eye className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                    <h3 className="text-lg font-medium">Live Props Coming Soon</h3>
                    <p className="text-sm">Real-time prop odds with edge calculations based on matchup analysis</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}