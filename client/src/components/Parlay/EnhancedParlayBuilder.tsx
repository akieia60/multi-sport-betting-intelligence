import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, DollarSign, Zap } from "lucide-react";

interface EnhancedParlayBuilderProps {
  selectedSport: string;
}

export function EnhancedParlayBuilder({ selectedSport }: EnhancedParlayBuilderProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('/src/assets/images/parlay-icon.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900" />
        
        <div className="relative z-10 p-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Parlay
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Builder
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Automatically build optimized 4, 6, or 8-leg parlays with advanced risk management
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">+230</div>
                <div className="text-sm text-slate-400">Average Odds</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">68%</div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">4-8</div>
                <div className="text-sm text-slate-400">Leg Options</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Parlay Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 4-Leg Parlay */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-yellow-500 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-yellow-500/20 rounded-full w-16 h-16 flex items-center justify-center">
                  <Target className="h-8 w-8 text-yellow-400" />
                </div>
                <CardTitle className="text-white text-2xl">4-Leg Parlay</CardTitle>
                <p className="text-slate-400">Conservative approach with higher win probability</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">+230</div>
                  <div className="text-sm text-slate-400">Average Payout</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="text-green-400">68%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Level:</span>
                    <Badge className="bg-green-600">Low</Badge>
                  </div>
                </div>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Build 4-Leg Parlay
                </Button>
              </CardContent>
            </Card>

            {/* 6-Leg Parlay */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
                <CardTitle className="text-white text-2xl">6-Leg Parlay</CardTitle>
                <p className="text-slate-400">Balanced risk and reward for steady profits</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">+850</div>
                  <div className="text-sm text-slate-400">Average Payout</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="text-yellow-400">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Level:</span>
                    <Badge className="bg-yellow-600">Medium</Badge>
                  </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Build 6-Leg Parlay
                </Button>
              </CardContent>
            </Card>

            {/* 8-Leg Parlay */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-red-500 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-white text-2xl">8-Leg Parlay</CardTitle>
                <p className="text-slate-400">High-risk, high-reward for big payouts</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">+2500</div>
                  <div className="text-sm text-slate-400">Average Payout</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="text-red-400">28%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Level:</span>
                    <Badge className="bg-red-600">High</Badge>
                  </div>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Build 8-Leg Parlay
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Parlays */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-6 w-6 text-green-400 mr-2" />
                Recent Parlays
              </CardTitle>
              <p className="text-slate-400">Your latest parlay builds and performance</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parlay 1 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-yellow-600">4-Leg</Badge>
                  <span className="text-sm text-slate-400">2 hours ago</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Mahomes O 2.5 TDs • Kelce O 5.5 Rec • Chiefs -3.5 • Game O 47.5
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-semibold">+245 odds</span>
                  <Badge className="bg-green-600">Won</Badge>
                </div>
              </div>

              {/* Parlay 2 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-orange-600">6-Leg</Badge>
                  <span className="text-sm text-slate-400">1 day ago</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Allen O 267.5 Yds • Diggs O 6.5 Rec • Bills -7 • Game U 48.5 • CMC O 89.5 Yds • 49ers -3
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 font-semibold">+850 odds</span>
                  <Badge className="bg-blue-600">Pending</Badge>
                </div>
              </div>

              {/* Parlay 3 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-red-600">8-Leg</Badge>
                  <span className="text-sm text-slate-400">2 days ago</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Jackson O 245.5 Yds • Andrews O 4.5 Rec • Ravens -6 • Game O 44.5 • More...
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-semibold">+2200 odds</span>
                  <Badge className="bg-red-600">Lost</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
