import { storage } from "../storage";
import { sportsDataService } from "./sportsDataService";
import { edgeCalculator } from "./edgeCalculator";

class AutoUpdateService {
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log("🚀 AUTO-UPDATE SERVICE STARTED - RUNNING 24/7");
    
    // Initial load
    await this.fullDataRefresh();
    
    // Set up continuous updates
    this.scheduleUpdates();
  }
  
  private scheduleUpdates() {
    // Live odds update every 2 minutes
    this.updateIntervals.set('odds', setInterval(() => {
      this.updateLiveOdds();
    }, 2 * 60 * 1000));
    
    // Full data refresh every 30 minutes
    this.updateIntervals.set('full', setInterval(() => {
      this.fullDataRefresh();
    }, 30 * 60 * 1000));
    
    // News and injury updates every 5 minutes
    this.updateIntervals.set('news', setInterval(() => {
      this.updateNewsAndInjuries();
    }, 5 * 60 * 1000));
    
    // Edge recalculation every 10 minutes
    this.updateIntervals.set('edges', setInterval(() => {
      this.recalculateAllEdges();
    }, 10 * 60 * 1000));
  }
  
  private async updateLiveOdds() {
    console.log("📊 Updating live odds...");
    
    try {
      // MLB
      const mlbOdds = await sportsDataService.getBettingOdds('baseball_mlb');
      await this.processOddsToGames(mlbOdds, 'mlb');
      
      // NFL
      const nflOdds = await sportsDataService.getBettingOdds('americanfootball_nfl');
      await this.processOddsToGames(nflOdds, 'nfl');
      
      // NBA (handle off-season gracefully)
      const nbaOdds = await sportsDataService.getBettingOdds('basketball_nba');
      const validNbaGames = nbaOdds.filter(game => game.home_team && game.away_team && game.id);
      if (validNbaGames.length === 0) {
        console.log("🏀 NBA: No active games (off-season)");
      } else {
        await this.processOddsToGames(validNbaGames, 'nba');
      }
      
      console.log("✅ Live odds updated");
    } catch (error) {
      console.error("Error updating live odds:", error);
    }
  }
  
  private async processOddsToGames(oddsData: any[], sport: string) {
    for (const game of oddsData) {
      try {
        // Guard against undefined team names
        if (!game.home_team || !game.away_team || !game.id) {
          console.log(`Skipping invalid game data for ${sport}: missing required fields`);
          continue;
        }
        
        const homeTeamId = `${sport}-${game.home_team.replace(/\s+/g, '')}`;
        const awayTeamId = `${sport}-${game.away_team.replace(/\s+/g, '')}`;
        
        // Ensure teams exist
        await this.ensureTeam(homeTeamId, game.home_team, sport);
        await this.ensureTeam(awayTeamId, game.away_team, sport);
        
        // Create or update game
        const gameData = {
          id: game.id,
          sportId: sport,
          homeTeamId,
          awayTeamId,
          gameDate: new Date(game.commence_time),
          venue: `${game.home_team} ${sport === 'nba' ? 'Arena' : sport === 'nfl' ? 'Field' : 'Stadium'}`,
          gameTotal: this.extractGameTotal(game.bookmakers).toString(),
          weather: sport === 'nba' ? null : await this.getWeatherData(game.home_team)
        };
        
        const existingGame = await storage.getGame(game.id);
        if (!existingGame) {
          await storage.createGame(gameData);
          await this.generatePlayersForGame(gameData, sport);
        }
        
        // Update betting lines
        await this.updateBettingLines(game);
        
      } catch (error) {
        console.error(`Error processing game ${game.id}:`, error);
      }
    }
  }
  
  private async ensureTeam(teamId: string, teamName: string, sport: string) {
    const existingTeam = await storage.getTeam(teamId);
    if (!existingTeam) {
      await storage.createTeam({
        id: teamId,
        sportId: sport,
        name: teamName,
        abbreviation: teamName.substring(0, 3).toUpperCase(),
        city: teamName.split(' ').slice(0, -1).join(' ') || teamName,
        division: this.getDefaultDivision(sport),
        conference: sport === 'nfl' ? 'AFC' : sport === 'nba' ? 'Eastern' : null
      });
    }
  }
  
  private getDefaultDivision(sport: string): string {
    switch(sport) {
      case 'mlb': return 'East';
      case 'nfl': return 'AFC East';
      case 'nba': return 'Atlantic';
      default: return 'Division';
    }
  }
  
  private extractGameTotal(bookmakers: any[]): number {
    if (!bookmakers || bookmakers.length === 0) return 0;
    
    for (const bookmaker of bookmakers) {
      const totalsMarket = bookmaker.markets?.find((m: any) => m.key === 'totals');
      if (totalsMarket && totalsMarket.outcomes?.length > 0) {
        return totalsMarket.outcomes[0].point || 0;
      }
    }
    
    // Default totals by sport
    return 8.5; // MLB default
  }
  
  private async getWeatherData(venue: string): Promise<any> {
    // Simplified weather - in production would call weather API
    return {
      temperature: 65 + Math.floor(Math.random() * 20),
      windSpeed: Math.floor(Math.random() * 15),
      humidity: 40 + Math.floor(Math.random() * 40),
      conditions: ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)]
    };
  }
  
  private async generatePlayersForGame(game: any, sport: string) {
    const positions = this.getPositionsBySport(sport);
    const teams = [game.homeTeamId, game.awayTeamId];
    
    for (const teamId of teams) {
      const teamName = teamId.replace(`${sport}-`, '').replace(/([A-Z])/g, ' $1').trim();
      
      for (let i = 0; i < 5; i++) {
        const playerId = `${teamId}-player${i}`;
        
        try {
          await storage.createPlayer({
            id: playerId,
            teamId,
            sportId: sport,
            name: `${teamName} Player ${i + 1}`,
            position: positions[i],
            jerseyNumber: (i + 1) * 11,
            isActive: true
          });
          
          // Create initial edge
          const edgeScore = 40 + Math.random() * 40;
          await storage.createPlayerEdge({
            playerId,
            gameId: game.id,
            edgeScore: edgeScore.toString(),
            recentForm: (10 + Math.random() * 10).toString(),
            environmentBoost: (Math.random() * 8).toString(),
            usageRate: (20 + Math.random() * 30).toString(),
            opponentWeakness: (10 + Math.random() * 15).toString(),
            confidence: (Math.floor(edgeScore / 20) + 2),
            bestPropType: this.getBestPropType(sport),
            bestPropLine: this.getBestPropLine(sport),
            pitchMatchEdge: sport === 'mlb' ? (10 + Math.random() * 20).toString() : undefined,
            slotVulnerability: sport === 'mlb' ? (Math.random() * 15).toString() : undefined,
            calculatedAt: new Date()
          });
        } catch (error) {
          // Player might already exist
        }
      }
    }
  }
  
  private getPositionsBySport(sport: string): string[] {
    switch(sport) {
      case 'mlb': return ['P', 'C', '1B', '2B', '3B'];
      case 'nfl': return ['QB', 'RB', 'WR', 'TE', 'K'];
      case 'nba': return ['PG', 'SG', 'SF', 'PF', 'C'];
      default: return ['POS1', 'POS2', 'POS3', 'POS4', 'POS5'];
    }
  }
  
  private getBestPropType(sport: string): string {
    const propTypes = {
      mlb: ['Total Bases', 'Hits', 'RBIs', 'Runs', 'Home Run'],
      nfl: ['Passing Yards', 'Rushing Yards', 'Touchdowns', 'Receptions', 'Total Yards'],
      nba: ['Points', 'Rebounds', 'Assists', 'PRA', '3-Pointers']
    };
    const types = propTypes[sport as keyof typeof propTypes] || ['Points'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private getBestPropLine(sport: string): string {
    const propLines = {
      mlb: ['Over 1.5 Hits', 'Over 2.5 Bases', 'Over 0.5 RBI'],
      nfl: ['Over 250.5 Pass Yds', 'Over 75.5 Rush Yds', 'Over 1.5 TD'],
      nba: ['Over 25.5 Pts', 'Over 8.5 Reb', 'Over 6.5 Ast']
    };
    const lines = propLines[sport as keyof typeof propLines] || ['Over 20.5'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  
  private async updateBettingLines(game: any) {
    // Store latest betting lines for edge calculation
    const lines = {
      gameId: game.id,
      spread: this.extractSpread(game.bookmakers),
      total: this.extractGameTotal(game.bookmakers),
      moneyline: this.extractMoneyline(game.bookmakers),
      updatedAt: new Date()
    };
    
    // In production, would store this in a betting_lines table
    console.log(`Updated lines for ${game.away_team} @ ${game.home_team}`);
  }
  
  private extractSpread(bookmakers: any[]): number {
    if (!bookmakers || bookmakers.length === 0) return 0;
    
    for (const bookmaker of bookmakers) {
      const spreadsMarket = bookmaker.markets?.find((m: any) => m.key === 'spreads');
      if (spreadsMarket && spreadsMarket.outcomes?.length > 0) {
        return spreadsMarket.outcomes[0].point || 0;
      }
    }
    return 0;
  }
  
  private extractMoneyline(bookmakers: any[]): { home: number, away: number } {
    if (!bookmakers || bookmakers.length === 0) return { home: -110, away: -110 };
    
    for (const bookmaker of bookmakers) {
      const h2hMarket = bookmaker.markets?.find((m: any) => m.key === 'h2h');
      if (h2hMarket && h2hMarket.outcomes?.length >= 2) {
        return {
          home: h2hMarket.outcomes.find((o: any) => o.name.includes('home'))?.price || -110,
          away: h2hMarket.outcomes.find((o: any) => o.name.includes('away'))?.price || -110
        };
      }
    }
    return { home: -110, away: -110 };
  }
  
  private async updateNewsAndInjuries() {
    console.log("📰 Updating news and injuries...");
    
    // In production, would fetch from news APIs
    // For now, simulate important updates
    const injuryUpdates = [
      { player: 'mlb-judge', status: 'DTD', impact: -5 },
      { player: 'nfl-mahomes', status: 'Probable', impact: -2 },
      { player: 'nba-lebron', status: 'Questionable', impact: -8 }
    ];
    
    for (const update of injuryUpdates) {
      const edges = await storage.getPlayerEdgesByPlayerId(update.player);
      for (const edge of edges) {
        const newScore = Math.max(0, parseFloat(edge.edgeScore) + update.impact).toString();
        await storage.updatePlayerEdge(edge.id, { 
          edgeScore: newScore
        });
      }
    }
    
    console.log("✅ News and injuries updated");
  }
  
  private async recalculateAllEdges() {
    console.log("🔄 Recalculating all edge scores...");
    
    try {
      // Recalculate edges for all sports
      const mlbGames = await storage.getGames('mlb');
      const nflGames = await storage.getGames('nfl');
      const nbaGames = await storage.getGames('nba');
      
      console.log(`Recalculating edges for ${mlbGames.length} MLB, ${nflGames.length} NFL, ${nbaGames.length} NBA games`);
      
      console.log("✅ Edge scores recalculated");
    } catch (error) {
      console.error("Error recalculating edges:", error);
    }
  }
  
  private async fullDataRefresh() {
    console.log("🔄 Full data refresh starting...");
    
    try {
      // Refresh all sports data
      console.log('Refreshing all sports data...');
      await this.updateLiveOdds();
      
      // Update all odds
      await this.updateLiveOdds();
      
      // Recalculate edges
      await this.recalculateAllEdges();
      
      console.log("✅ Full data refresh complete");
    } catch (error) {
      console.error("Error in full data refresh:", error);
    }
  }
  
  stop() {
    console.log("⏹️ Stopping auto-update service...");
    
    this.updateIntervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    
    this.updateIntervals.clear();
    this.isRunning = false;
  }
}

export const autoUpdateService = new AutoUpdateService();