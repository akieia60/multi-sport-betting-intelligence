import React, { useState } from "react";
import { Users, Shield, Sword, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeams, useGamesWithTeams } from "@/hooks/useSportsData";
import type { FilterState } from "@/lib/types";

interface TeamIntelProps {
  selectedSport: string;
  filters: FilterState;
}

export default function TeamIntel({ selectedSport, filters }: TeamIntelProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [viewType, setViewType] = useState<"overview" | "offensive" | "defensive">("overview");

  const { data: teams, isLoading: teamsLoading } = useTeams(selectedSport);
  const { data: games } = useGamesWithTeams(selectedSport);

  const getTeamGames = (teamId: string) => {
    return games?.filter(game => 
      game.homeTeamId === teamId || game.awayTeamId === teamId
    ) || [];
  };

  const getTeamStats = (teamId: string) => {
    // In a real app, this would fetch actual team statistics
    return {
      offense: {
        scoring: Math.floor(Math.random() * 30) + 70,
        efficiency: Math.floor(Math.random() * 20) + 80,
        pace: Math.floor(Math.random() * 10) + 95
      },
      defense: {
        allowed: Math.floor(Math.random() * 25) + 65,
        efficiency: Math.floor(Math.random() * 20) + 75,
        pressure: Math.floor(Math.random() * 15) + 80
      },
      recent: {
        form: Math.floor(Math.random() * 5) + 1,
        streak: Math.floor(Math.random() * 8) + 1,
        trend: Math.random() > 0.5 ? "up" : "down"
      }
    };
  };

  const renderTeamCard = (team: any) => {
    const stats = getTeamStats(team.id);
    const teamGames = getTeamGames(team.id);

    return (
      <Card key={team.id} className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                {team.abbreviation}
              </div>
              <span>{team.city} {team.name}</span>
            </CardTitle>
            <Badge variant="outline" className="border-slate-600">
              {teamGames.length} games
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Offensive</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Scoring:</span>
                  <span className="text-green-400">{stats.offense.scoring}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="text-blue-400">{stats.offense.efficiency}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Defensive</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Allowed:</span>
                  <span className="text-red-400">{stats.defense.allowed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="text-orange-400">{stats.defense.efficiency}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Recent Form:</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < stats.recent.form ? 'bg-green-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
                <TrendingUp 
                  className={`h-3 w-3 ml-2 ${
                    stats.recent.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (teamsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-400" />
            <span data-testid="page-title">Team Intel</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Comprehensive team analytics and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600" data-testid="select-team">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.city} {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex bg-slate-700 rounded-lg p-1">
            <Button
              variant={viewType === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("overview")}
              className={viewType === "overview" ? "bg-blue-600" : ""}
              data-testid="button-view-overview"
            >
              Overview
            </Button>
            <Button
              variant={viewType === "offensive" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("offensive")}
              className={viewType === "offensive" ? "bg-green-600" : ""}
              data-testid="button-view-offensive"
            >
              Offensive
            </Button>
            <Button
              variant={viewType === "defensive" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("defensive")}
              className={viewType === "defensive" ? "bg-red-600" : ""}
              data-testid="button-view-defensive"
            >
              Defensive
            </Button>
          </div>
        </div>
      </div>

      {/* League Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-total-teams">
              {teams?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="count-games-today">
              {games?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled matchups
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Offense</CardTitle>
            <Sword className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="stat-top-offense">
              {teams?.[0]?.abbreviation || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest scoring
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Defense</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400" data-testid="stat-top-defense">
              {teams?.[1]?.abbreviation || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Fewest allowed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      {teams && teams.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {selectedTeam === "all" ? "All Teams" : "Selected Team"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedTeam === "all" ? teams : teams.filter(t => t.id === selectedTeam))
              .map(team => renderTeamCard(team))}
          </div>
        </div>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Team Data Available
            </h3>
            <p className="text-slate-400">
              Team intelligence data is not available for this sport. 
              Please check back later or try refreshing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Team Analysis */}
      {selectedTeam !== "all" && teams && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Strengths</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">High-scoring offense</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Strong depth chart</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Home field advantage</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Weaknesses</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm">Defensive vulnerabilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm">Injury concerns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm">Road performance</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
