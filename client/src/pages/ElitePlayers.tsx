import React, { useState } from "react";
import { Star, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerTable } from "@/components/Players/PlayerTable";
import { PlayerModal } from "@/components/Players/PlayerModal";
import { useElitePlayers } from "@/hooks/useSportsData";
import type { FilterState } from "@/lib/types";

interface ElitePlayersProps {
  selectedSport: string;
  filters: FilterState;
}

export default function ElitePlayers({ selectedSport, filters }: ElitePlayersProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const { data: elitePlayers, isLoading } = useElitePlayers(selectedSport, limit);

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
  };

  const topTierPlayers = elitePlayers?.filter(edge => 
    parseFloat(edge.edgeScore) >= 90
  ) || [];

  const highTierPlayers = elitePlayers?.filter(edge => 
    parseFloat(edge.edgeScore) >= 80 && parseFloat(edge.edgeScore) < 90
  ) || [];

  const mediumTierPlayers = elitePlayers?.filter(edge => 
    parseFloat(edge.edgeScore) >= 70 && parseFloat(edge.edgeScore) < 80
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white" data-testid="page-title">
            Elite Players
          </h2>
          <p className="text-slate-400 mt-1">
            Top-performing players with the highest edge scores
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setLimit(limit === 50 ? 100 : 50)}
            className="bg-slate-700 hover:bg-slate-600 border-slate-600"
            data-testid="button-toggle-limit"
          >
            Show {limit === 50 ? "More" : "Less"}
          </Button>
        </div>
      </div>

      {/* Elite Tiers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elite Tier</CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="count-elite-tier">
              {topTierPlayers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Edge Score 90+
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Tier</CardTitle>
            <Star className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400" data-testid="count-high-tier">
              {highTierPlayers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Edge Score 80-89
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Tier</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="count-medium-tier">
              {mediumTierPlayers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Edge Score 70-79
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Elite Players Table */}
      {elitePlayers && elitePlayers.length > 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>Elite Players Ranking</span>
              </CardTitle>
              <Badge variant="secondary" data-testid="total-players-count">
                {elitePlayers.length} players
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PlayerTable
              playerEdges={elitePlayers}
              onPlayerClick={handlePlayerClick}
              sportId={selectedSport}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Elite Players Found
            </h3>
            <p className="text-slate-400">
              No players meet the elite criteria for today's slate. 
              Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tier Breakdown */}
      {elitePlayers && elitePlayers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Elite Tier */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Award className="h-4 w-4" />
                <span>Elite Tier (90+)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTierPlayers.length > 0 ? (
                <div className="space-y-3">
                  {topTierPlayers.slice(0, 5).map((edge) => (
                    <div
                      key={edge.id}
                      className="flex justify-between items-center p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600"
                      onClick={() => handlePlayerClick(edge.playerId)}
                      data-testid={`elite-player-${edge.playerId}`}
                    >
                      <span className="font-medium">Player {edge.playerId}</span>
                      <Badge className="bg-yellow-500 text-black">
                        {Math.round(parseFloat(edge.edgeScore))}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No elite tier players today</p>
              )}
            </CardContent>
          </Card>

          {/* High Tier */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Star className="h-4 w-4" />
                <span>High Tier (80-89)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highTierPlayers.length > 0 ? (
                <div className="space-y-3">
                  {highTierPlayers.slice(0, 5).map((edge) => (
                    <div
                      key={edge.id}
                      className="flex justify-between items-center p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600"
                      onClick={() => handlePlayerClick(edge.playerId)}
                      data-testid={`high-player-${edge.playerId}`}
                    >
                      <span className="font-medium">Player {edge.playerId}</span>
                      <Badge className="bg-blue-500">
                        {Math.round(parseFloat(edge.edgeScore))}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No high tier players today</p>
              )}
            </CardContent>
          </Card>

          {/* Medium Tier */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>Medium Tier (70-79)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mediumTierPlayers.length > 0 ? (
                <div className="space-y-3">
                  {mediumTierPlayers.slice(0, 5).map((edge) => (
                    <div
                      key={edge.id}
                      className="flex justify-between items-center p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600"
                      onClick={() => handlePlayerClick(edge.playerId)}
                      data-testid={`medium-player-${edge.playerId}`}
                    >
                      <span className="font-medium">Player {edge.playerId}</span>
                      <Badge className="bg-green-500">
                        {Math.round(parseFloat(edge.edgeScore))}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No medium tier players today</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player Modal */}
      <PlayerModal
        playerId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
