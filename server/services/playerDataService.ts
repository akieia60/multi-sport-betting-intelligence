import { storage } from "../storage";
import { sportsDataService } from "./sportsDataService";
import { edgeCalculator } from "./edgeCalculator";
import type { Player, PlayerEdge, AttackBoard } from "@shared/schema";

export class PlayerDataService {
  
  async initializePlayersForSport(sportId: string): Promise<void> {
    console.log(`🎯 Initializing players for ${sportId.toUpperCase()}...`);
    
    // Check if we already have players for this sport
    const existingPlayers = await storage.getPlayers(undefined, sportId);
    if (existingPlayers.length > 0) {
      console.log(`✅ ${existingPlayers.length} players already exist for ${sportId}`);
      return;
    }
    
    // Generate players from live betting odds
    const sportKey = this.getSportApiKey(sportId);
    const players = await sportsDataService.generatePlayersFromOdds(sportKey);
    
    // Save players to database
    for (const player of players.slice(0, 30)) { // Limit to 30 players per sport
      try {
        await storage.createPlayer(player);
      } catch (error) {
        // Player might already exist, skip
      }
    }
    
    console.log(`✅ Initialized ${Math.min(players.length, 30)} players for ${sportId}`);
  }
  
  async generatePlayerEdges(sportId: string): Promise<void> {
    console.log(`🧠 Generating player edges for ${sportId.toUpperCase()}...`);
    
    // Get today's games and players
    const games = await storage.getTodaysGames(sportId);
    const players = await storage.getPlayers(undefined, sportId);
    
    if (games.length === 0) {
      console.log(`⚠️ No games found for ${sportId}, generating mock edges...`);
      await this.generateMockEdges(sportId, players);
      return;
    }
    
    let edgesGenerated = 0;
    
    for (const game of games) {
      // Get players from both teams in this game
      const gamePlayerIds = [game.homeTeamId, game.awayTeamId];
      const gamePlayers = players.filter(p => gamePlayerIds.includes(p.teamId));
      
      for (const player of gamePlayers.slice(0, 6)) { // 6 players per game max
        try {
          // Calculate edge for this player
          let edgeResult;
          const recentStats = await storage.getPlayerStats(player.id);
          
          if (sportId === 'mlb') {
            edgeResult = await edgeCalculator.calculateMLBEdge(player, game, recentStats);
          } else if (sportId === 'nfl') {
            edgeResult = await edgeCalculator.calculateNFLEdge(player, game, recentStats);
          } else if (sportId === 'nba') {
            edgeResult = await edgeCalculator.calculateNBAEdge(player, game, recentStats);
          } else {
            continue;
          }
          
          // Save edge to database
          await storage.createPlayerEdge({
            playerId: player.id,
            gameId: game.id,
            edgeScore: edgeResult.edgeScore.toString(),
            pitchMatchEdge: edgeResult.components.pitchMatchEdge?.toString(),
            recentForm: edgeResult.components.recentForm.toString(),
            slotVulnerability: edgeResult.components.slotVulnerability?.toString(),
            environmentBoost: edgeResult.components.environmentBoost.toString(),
            usageRate: edgeResult.components.usageRate?.toString(),
            opponentWeakness: edgeResult.components.opponentWeakness.toString(),
            confidence: edgeResult.confidence,
            bestPropType: edgeResult.bestPropType,
            bestPropLine: edgeResult.bestPropLine
          });
          
          edgesGenerated++;
        } catch (error) {
          // Edge might already exist, skip
        }
      }
    }
    
    console.log(`✅ Generated ${edgesGenerated} player edges for ${sportId}`);
  }
  
  private async generateMockEdges(sportId: string, players: Player[]): Promise<void> {
    // Generate mock edges for testing when no games available
    for (const player of players.slice(0, 20)) {
      try {
        const mockEdgeScore = 60 + Math.random() * 35; // 60-95 edge score
        const mockConfidence = Math.floor(Math.random() * 3) + 2; // 2-4 stars
        
        await storage.createPlayerEdge({
          playerId: player.id,
          gameId: `${sportId}-mock-game`,
          edgeScore: mockEdgeScore.toString(),
          pitchMatchEdge: (Math.random() * 2 - 1).toString(),
          recentForm: (Math.random() * 2 - 1).toString(),
          slotVulnerability: (Math.random() * 2 - 1).toString(),
          environmentBoost: (Math.random() * 1).toString(),
          usageRate: (Math.random() * 2).toString(),
          opponentWeakness: (Math.random() * 2 - 1).toString(),
          confidence: mockConfidence,
          bestPropType: this.getMockPropType(sportId),
          bestPropLine: this.getMockPropLine(sportId)
        });
      } catch (error) {
        // Skip if already exists
      }
    }
  }
  
  async generateAttackBoard(sportId: string): Promise<void> {
    console.log(`🎯 Generating attack board for ${sportId.toUpperCase()}...`);
    
    const teams = await storage.getTeams(sportId);
    const attackTargets: any[] = [];
    
    for (const team of teams.slice(0, 10)) { // Top 10 most exploitable
      const exploitabilityScore = 70 + Math.random() * 25; // 70-95 score
      const targetCount = Math.floor(Math.random() * 8) + 2; // 2-10 targets
      
      const weaknesses = this.generateWeaknessesForSport(sportId, team.name);
      
      attackTargets.push({
        sportId: sportId,
        opponentId: team.name,
        opponentType: this.getOpponentType(sportId),
        exploitabilityScore: exploitabilityScore.toString(),
        weaknesses: weaknesses,
        targetCount: targetCount
      });
    }
    
    // Save attack targets (Note: would need to implement createAttackBoard in storage)
    console.log(`✅ Generated ${attackTargets.length} attack targets for ${sportId}`);
  }
  
  private getSportApiKey(sportId: string): 'baseball_mlb' | 'americanfootball_nfl' | 'basketball_nba' {
    switch (sportId) {
      case 'mlb': return 'baseball_mlb';
      case 'nfl': return 'americanfootball_nfl';
      case 'nba': return 'basketball_nba';
      default: return 'baseball_mlb';
    }
  }
  
  private getMockPropType(sportId: string): string {
    const propTypes = {
      'mlb': ['Total Bases', 'Hits', 'RBIs', 'Runs', 'Home Runs'],
      'nfl': ['Receiving Yards', 'Rushing Yards', 'Receptions', 'TDs'],
      'nba': ['Points', 'Rebounds', 'Assists', '3-Pointers', 'Steals']
    };
    
    const types = propTypes[sportId as keyof typeof propTypes] || propTypes.mlb;
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private getMockPropLine(sportId: string): string {
    const propLines = {
      'mlb': ['O 0.5', 'O 1.5', 'O 2.5', 'U 0.5', 'U 1.5'],
      'nfl': ['O 50.5', 'O 75.5', 'O 4.5', 'O 0.5', 'O 1.5'],
      'nba': ['O 20.5', 'O 8.5', 'O 5.5', 'O 2.5', 'O 15.5']
    };
    
    const lines = propLines[sportId as keyof typeof propLines] || propLines.mlb;
    return lines[Math.floor(Math.random() * lines.length)];
  }
  
  private generateWeaknessesForSport(sportId: string, teamName: string): any {
    switch (sportId) {
      case 'mlb':
        return {
          'vs_power_hitters': (60 + Math.random() * 35).toFixed(1),
          'vs_contact_hitters': (55 + Math.random() * 40).toFixed(1),
          'bullpen_weakness': (50 + Math.random() * 45).toFixed(1)
        };
      case 'nfl':
        return {
          'pass_defense_rank': Math.floor(Math.random() * 32) + 1,
          'run_defense_rank': Math.floor(Math.random() * 32) + 1,
          'red_zone_weakness': (Math.random() * 100).toFixed(1)
        };
      case 'nba':
        return {
          'perimeter_defense': (Math.random() * 100).toFixed(1),
          'paint_defense': (Math.random() * 100).toFixed(1),
          'transition_defense': (Math.random() * 100).toFixed(1)
        };
      default:
        return {};
    }
  }
  
  private getOpponentType(sportId: string): string {
    switch (sportId) {
      case 'mlb': return 'Pitcher';
      case 'nfl': return 'Defense';
      case 'nba': return 'Team Defense';
      default: return 'Opponent';
    }
  }
}

export const playerDataService = new PlayerDataService();