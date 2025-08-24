import { storage } from "../storage";
import { sportsDataService } from "./sportsDataService";
import { edgeCalculator } from "./edgeCalculator";
import type { Sport, Team, Game, Player } from "@shared/schema";

export class DataIngestionService {
  private lastRefresh: Date = new Date(0);
  private refreshInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  async initializeSports(): Promise<void> {
    console.log("Initializing sports data...");
    
    // Initialize base sports
    const sports: Sport[] = [
      {
        id: "mlb",
        name: "Major League Baseball",
        displayName: "MLB",
        colorCode: "#003087",
        isActive: true
      },
      {
        id: "nfl", 
        name: "National Football League",
        displayName: "NFL",
        colorCode: "#013369",
        isActive: true
      },
      {
        id: "nba",
        name: "National Basketball Association", 
        displayName: "NBA",
        colorCode: "#C8102E",
        isActive: true
      }
    ];

    // Note: In a real implementation, you'd insert these into the database
    // For now, they're handled in the routes directly
    console.log("Sports initialized:", sports.map(s => s.displayName).join(", "));
  }

  async refreshSportData(sportId: string): Promise<void> {
    console.log(`Refreshing data for ${sportId.toUpperCase()}...`);
    
    try {
      // Fetch and store teams
      await this.fetchAndStoreTeams(sportId);
      
      // Fetch and store games
      await this.fetchAndStoreGames(sportId);
      
      // Fetch and store players for each team
      await this.fetchAndStorePlayers(sportId);
      
      // Calculate edge scores for today's games
      await this.calculateTodayEdges(sportId);
      
      console.log(`Data refresh completed for ${sportId.toUpperCase()}`);
    } catch (error) {
      console.error(`Error refreshing ${sportId} data:`, error);
      throw error;
    }
  }

  async refreshAllData(): Promise<void> {
    const now = new Date();
    
    // Check if enough time has passed since last refresh
    if (now.getTime() - this.lastRefresh.getTime() < this.refreshInterval) {
      console.log("Skipping refresh - too soon since last update");
      return;
    }

    console.log("Starting full data refresh...");
    
    const sports = ["mlb", "nfl", "nba"];
    
    for (const sportId of sports) {
      try {
        await this.refreshSportData(sportId);
      } catch (error) {
        console.error(`Failed to refresh ${sportId}:`, error);
        // Continue with other sports even if one fails
      }
    }
    
    this.lastRefresh = now;
    console.log("Full data refresh completed");
  }

  private async fetchAndStoreTeams(sportId: string): Promise<void> {
    let teams: Team[] = [];
    
    switch (sportId) {
      case "mlb":
        teams = await sportsDataService.getMLBTeams();
        break;
      case "nfl":
        teams = await sportsDataService.getNFLTeams();
        break;
      case "nba":
        teams = await sportsDataService.getNBATeams();
        break;
    }

    console.log(`Fetched ${teams.length} teams for ${sportId.toUpperCase()}`);
    
    // In a real implementation, you'd store these in the database
    // For now, they're returned directly from the API calls
  }

  private async fetchAndStoreGames(sportId: string): Promise<void> {
    let games: Game[] = [];
    
    const today = new Date().toISOString().split('T')[0];
    
    switch (sportId) {
      case "mlb":
        games = await sportsDataService.getMLBGames(today);
        break;
      case "nfl":
        // For NFL, get current week games
        games = await sportsDataService.getNFLGames();
        break;
      case "nba":
        games = await sportsDataService.getNBAGames(today);
        break;
    }

    console.log(`Fetched ${games.length} games for ${sportId.toUpperCase()}`);
    
    // Store games in database
    for (const game of games) {
      try {
        await storage.createGame({
          ...game,
          weather: game.weather as any
        });
      } catch (error) {
        // Game might already exist, that's okay
        console.log(`Game ${game.id} already exists or error:`, error);
      }
    }
  }

  private async fetchAndStorePlayers(sportId: string): Promise<void> {
    let players: Player[] = [];
    
    switch (sportId) {
      case "mlb":
        players = await sportsDataService.getMLBPlayers();
        break;
      case "nfl":
        players = await sportsDataService.getNFLPlayers();
        break;
      case "nba":
        players = await sportsDataService.getNBAPlayers();
        break;
    }

    console.log(`Fetched ${players.length} players for ${sportId.toUpperCase()}`);
    
    // Store players in database
    for (const player of players.slice(0, 100)) { // Limit to avoid overwhelming the system
      try {
        await storage.createPlayer(player);
      } catch (error) {
        // Player might already exist, that's okay
        console.log(`Player ${player.id} already exists or error:`, error);
      }
    }
  }

  private async calculateTodayEdges(sportId: string): Promise<void> {
    console.log(`Calculating edge scores for ${sportId.toUpperCase()}...`);
    
    // Get today's games
    const games = await storage.getTodaysGames(sportId);
    
    for (const game of games) {
      // Get players for both teams
      const homePlayers = await storage.getPlayers(game.homeTeamId, sportId);
      const awayPlayers = await storage.getPlayers(game.awayTeamId, sportId);
      const allPlayers = [...homePlayers, ...awayPlayers];
      
      for (const player of allPlayers.slice(0, 10)) { // Limit calculation for performance
        try {
          // Get recent stats (empty for now, would come from stats API)
          const recentStats = await storage.getPlayerStats(player.id);
          
          // Calculate edge based on sport
          let edgeResult;
          switch (sportId) {
            case "mlb":
              edgeResult = await edgeCalculator.calculateMLBEdge(player, game, recentStats);
              break;
            case "nfl":
              edgeResult = await edgeCalculator.calculateNFLEdge(player, game, recentStats);
              break;
            case "nba":
              edgeResult = await edgeCalculator.calculateNBAEdge(player, game, recentStats);
              break;
            default:
              continue;
          }
          
          // Store the edge
          const edge = {
            playerId: player.id,
            gameId: game.id,
            edgeScore: edgeResult.edgeScore.toString(),
            confidence: edgeResult.confidence,
            pitchMatchEdge: edgeResult.components.pitchMatchEdge?.toString() || null,
            recentForm: edgeResult.components.recentForm.toString(),
            slotVulnerability: edgeResult.components.slotVulnerability?.toString() || null,
            environmentBoost: edgeResult.components.environmentBoost.toString(),
            usageRate: edgeResult.components.usageRate?.toString() || null,
            opponentWeakness: edgeResult.components.opponentWeakness.toString(),
            bestPropType: edgeResult.bestPropType,
            bestPropLine: edgeResult.bestPropLine
          };
          
          await storage.createPlayerEdge(edge);
        } catch (error) {
          console.error(`Error calculating edge for player ${player.id}:`, error);
        }
      }
    }
    
    console.log(`Edge calculation completed for ${sportId.toUpperCase()}`);
  }

  // Manual refresh trigger
  async triggerRefresh(sportId?: string): Promise<{ success: boolean; message: string }> {
    try {
      if (sportId) {
        await this.refreshSportData(sportId);
        return {
          success: true,
          message: `Successfully refreshed ${sportId.toUpperCase()} data`
        };
      } else {
        await this.refreshAllData();
        return {
          success: true,
          message: "Successfully refreshed all sports data"
        };
      }
    } catch (error) {
      console.error("Refresh failed:", error);
      return {
        success: false,
        message: `Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const dataIngestionService = new DataIngestionService();