import React, { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/Games/GameCard";
import { PlayerModal } from "@/components/Players/PlayerModal";
import { HeroSection } from "@/components/HomePage/HeroSection";
import { useGamesWithTeams, usePlayerEdges, useRefreshData } from "@/hooks/useSportsData";
import { useRealTime } from "@/hooks/useRealTime";
import type { FilterState } from "@/lib/types";

interface PropFinderProps {
  selectedSport: string;
  filters: FilterState;
}

export default function PropFinder({ selectedSport, filters }: PropFinderProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  const { data: games, isLoading: gamesLoading } = useGamesWithTeams(selectedSport);
  const { data: playerEdges } = usePlayerEdges(selectedSport);
  const refreshMutation = useRefreshData();
  const { triggerRefresh } = useRealTime();

  const handleRefresh = () => {
    triggerRefresh();
    refreshMutation.mutate(selectedSport);
  };

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
  };

  const toggleGameExpansion = (gameId: string) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedGames(newExpanded);
  };

  const getGamePlayerEdges = (gameId: string) => {
    return playerEdges?.filter(edge => edge.gameId === gameId) || [];
  };

  const getSportDisplayName = (sport: string) => {
    switch (sport) {
      case "mlb": return "MLB";
      case "nfl": return "NFL";
      case "nba": return "NBA";
      default: return sport.toUpperCase();
    }
  };

  if (gamesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="p-6">
        <HeroSection 
          selectedSport={selectedSport} 
          onNavigate={(path) => window.location.hash = path} 
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white" data-testid="page-title">
              {getSportDisplayName(selectedSport)} Prop Finder
            </h2>
            <p className="text-slate-400 mt-1">
              Find the best betting edges across today's slate
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-refresh-data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="p-6">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No games available</div>
            <p className="text-slate-500">
              Check back later or try refreshing the data
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                playerEdges={getGamePlayerEdges(game.id)}
                onPlayerClick={handlePlayerClick}
                expanded={expandedGames.has(game.id)}
              />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-yellow-400"></i>
              </div>
              <h3 className="text-lg font-semibold">Elite Players</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Players with the highest edge scores across all games
            </p>
            <Button
              variant="outline"
              className="w-full bg-slate-700 hover:bg-slate-600 border-slate-600"
              data-testid="button-view-elite"
            >
              View Elite Players
            </Button>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-crosshairs text-red-400"></i>
              </div>
              <h3 className="text-lg font-semibold">Attack Board</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Most exploitable pitchers and defensive units
            </p>
            <Button
              variant="outline"
              className="w-full bg-slate-700 hover:bg-slate-600 border-slate-600"
              data-testid="button-view-attack"
            >
              View Attack Board
            </Button>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-layer-group text-green-400"></i>
              </div>
              <h3 className="text-lg font-semibold">Parlay Builder</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Automatically build optimized 4, 6, or 8-leg parlays
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-build-parlay"
            >
              Build Parlay
            </Button>
          </div>
        </div>
      </div>

      {/* Player Modal */}
      <PlayerModal
        playerId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
