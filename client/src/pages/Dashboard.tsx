import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Star } from "lucide-react";
import { useSlate, useElitePlayers, useAttackBoard } from "@/hooks/useSportsData";
import type { FilterState } from "@/lib/types";

interface DashboardProps {
  selectedSport: string;
  filters: FilterState;
}

export default function Dashboard({ selectedSport }: DashboardProps) {
  const { data: slateData } = useSlate(selectedSport);
  const { data: elitePlayers } = useElitePlayers(selectedSport, 5);
  const { data: attackBoard } = useAttackBoard(selectedSport);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Sports Intelligence Dashboard
        </h1>
        <p className="text-slate-400">
          Overview of today's betting opportunities and analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-games">
              {slateData?.games || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active games today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elite Edges</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="metric-elite-edges">
              {slateData?.eliteCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High-confidence opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400" data-testid="metric-attack-targets">
              {attackBoard?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Exploitable matchups
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="metric-high-confidence">
              {slateData?.highConfidenceCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              4+ star ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <CardTitle>Elite Players</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Top edge scores across all games
            </p>
            <div className="space-y-2">
              {elitePlayers?.slice(0, 3).map((edge, index) => (
                <div key={edge.id} className="flex justify-between items-center">
                  <span className="text-sm">Player {edge.playerId}</span>
                  <Badge variant="secondary">{Math.round(parseFloat(edge.edgeScore))}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-red-400" />
              </div>
              <CardTitle>Attack Board</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Most exploitable opponents
            </p>
            <div className="space-y-2">
              {attackBoard?.slice(0, 3).map((target, index) => (
                <div key={target.id} className="flex justify-between items-center">
                  <span className="text-sm">{target.opponentType}</span>
                  <Badge variant="destructive">
                    {Math.round(parseFloat(target.exploitabilityScore))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Latest data updates
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Last refresh:</span>
                <span className="text-green-400">2 min ago</span>
              </div>
              <div className="flex justify-between">
                <span>Data quality:</span>
                <span className="text-green-400">100%</span>
              </div>
              <div className="flex justify-between">
                <span>API status:</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
