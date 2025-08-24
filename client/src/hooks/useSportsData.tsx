import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  Sport, 
  Game, 
  GameWithTeams, 
  Player,
  PlayerWithEdge,
  PlayerEdge, 
  SlateSnapshot,
  GeneratedParlay,
  AttackBoardEntry,
  Team 
} from "@/lib/types";

// Sports data hooks
export function useSports() {
  return useQuery<Sport[]>({
    queryKey: ["/api/sports"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSlate(sportId: string) {
  return useQuery<SlateSnapshot>({
    queryKey: ["/api", sportId, "slate"],
    enabled: !!sportId,
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  });
}

export function useGames(sportId: string) {
  return useQuery<Game[]>({
    queryKey: ["/api", sportId, "games"],
    enabled: !!sportId,
  });
}

export function useGame(sportId: string, gameId: string) {
  return useQuery<{game: Game, playerEdges: PlayerEdge[]}>({
    queryKey: ["/api", sportId, "game", gameId],
    enabled: !!sportId && !!gameId,
  });
}

export function useTeams(sportId?: string) {
  return useQuery<Team[]>({
    queryKey: sportId ? ["/api", sportId, "teams"] : ["/api/teams"],
    enabled: true,
  });
}

// Player data hooks
export function useElitePlayers(sportId: string, limit?: number) {
  return useQuery<PlayerEdge[]>({
    queryKey: ["/api", sportId, "elite-players", { limit }],
    enabled: !!sportId,
  });
}

export function usePlayer(playerId: string) {
  return useQuery<{
    player: Player;
    recentStats: any[];
    currentEdge?: PlayerEdge;
  }>({
    queryKey: ["/api/player", playerId],
    enabled: !!playerId,
  });
}

export function useAttackBoard(sportId: string) {
  return useQuery<AttackBoardEntry[]>({
    queryKey: ["/api", sportId, "attack-board"],
    enabled: !!sportId,
  });
}

// Parlay hooks
export function useGenerateParlay(sportId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: {
      legCount: number;
      riskTolerance: "conservative" | "balanced" | "aggressive";
      minConfidence?: number;
    }) => {
      const response = await apiRequest("POST", `/api/${sportId}/parlay/generate`, config);
      return await response.json() as GeneratedParlay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api", sportId, "parlays"] 
      });
    }
  });
}

export function useGenerateMultipleParlays(sportId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/${sportId}/parlay/generate-multiple`);
      return await response.json() as {
        conservative: GeneratedParlay;
        balanced: GeneratedParlay;
        aggressive: GeneratedParlay;
      };
    }
  });
}

export function useSwapSuggestions(sportId: string) {
  return useMutation({
    mutationFn: async (originalParlay: GeneratedParlay) => {
      const response = await apiRequest("POST", `/api/${sportId}/parlay/swap-suggestions`, {
        originalParlay
      });
      return await response.json();
    }
  });
}

// Data refresh hooks
export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sport?: string) => {
      const response = await apiRequest("POST", "/api/refresh", { sport });
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate all data queries
      queryClient.invalidateQueries();
    }
  });
}

// Prop suggestions
export function usePropSuggestions(sportId: string) {
  return useQuery<{
    suggestedProps: Array<{
      type: string;
      confidence: number;
      count: number;
    }>;
  }>({
    queryKey: ["/api", sportId, "props", "suggest"],
    enabled: !!sportId,
  });
}

// Enhanced games hook that includes team data
export function useGamesWithTeams(sportId: string): {
  data: GameWithTeams[];
  isLoading: boolean;
  error: any;
} {
  const { data: games, isLoading: gamesLoading, error: gamesError } = useGames(sportId);
  const { data: teams, isLoading: teamsLoading } = useTeams(sportId);
  
  const data: GameWithTeams[] = games?.map(game => {
    const homeTeam = teams?.find(t => t.id === game.homeTeamId);
    const awayTeam = teams?.find(t => t.id === game.awayTeamId);
    
    return {
      ...game,
      homeTeam,
      awayTeam
    };
  }) || [];

  return {
    data,
    isLoading: gamesLoading || teamsLoading,
    error: gamesError
  };
}

// Player edges hook for games
export function usePlayerEdges(sportId: string, gameId?: string) {
  return useQuery<PlayerEdge[]>({
    queryKey: gameId ? ["/api", sportId, "game", gameId, "edges"] : ["/api", sportId, "edges"],
    enabled: !!sportId,
  });
}

// Enhanced player edges with player data
export function usePlayersWithEdges(sportId: string): {
  data: PlayerWithEdge[];
  isLoading: boolean;
  error: any;
} {
  const { data: edges, isLoading: edgesLoading, error: edgesError } = useElitePlayers(sportId);
  const { data: teams } = useTeams(sportId);
  
  // In a real app, you'd want to fetch player data based on the edges
  // For now, we'll construct what we can from the edge data
  const data: PlayerWithEdge[] = edges?.map(edge => ({
    id: edge.playerId,
    teamId: "", // Would be populated from player lookup
    sportId,
    name: `Player ${edge.playerId}`, // Would come from player data
    position: "Unknown", // Would come from player data
    isActive: true,
    edge,
    initials: "??" // Would be generated from name
  })) || [];

  return {
    data,
    isLoading: edgesLoading,
    error: edgesError
  };
}
