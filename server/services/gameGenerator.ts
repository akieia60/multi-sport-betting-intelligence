import { storage } from "../storage";
import type { Game } from "@shared/schema";

export class GameGenerator {
  async generateTodaysGames(sportId: string): Promise<void> {
    console.log(`🎯 Generating today's games for ${sportId.toUpperCase()}...`);
    
    const teams = await storage.getTeams(sportId);
    if (teams.length < 4) {
      console.log(`⚠️ Not enough teams for ${sportId}`);
      return;
    }
    
    // Generate 3-5 games for today
    const gameCount = Math.floor(Math.random() * 3) + 3; // 3-5 games
    const usedTeams = new Set<string>();
    
    for (let i = 0; i < gameCount && usedTeams.size < teams.length - 1; i++) {
      // Pick two random teams that haven't been used
      let homeTeam, awayTeam;
      do {
        homeTeam = teams[Math.floor(Math.random() * teams.length)];
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      } while (
        homeTeam.id === awayTeam.id || 
        usedTeams.has(homeTeam.id) || 
        usedTeams.has(awayTeam.id)
      );
      
      usedTeams.add(homeTeam.id);
      usedTeams.add(awayTeam.id);
      
      // Create game for today
      const today = new Date();
      const gameTime = new Date(today);
      gameTime.setHours(19 + i, 0, 0, 0); // Games at 7pm, 8pm, 9pm etc
      
      const game: any = {
        id: `${sportId}-${Date.now()}-${i}`,
        sportId: sportId,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        gameDate: gameTime,
        status: 'scheduled',
        weather: this.generateWeather(sportId)
      };
      
      try {
        await storage.createGame(game);
        console.log(`✅ Created game: ${awayTeam.name} @ ${homeTeam.name}`);
      } catch (error) {
        // Game might already exist
      }
    }
  }
  
  private generateWeather(sportId: string): any {
    if (sportId === 'nba') return null; // Indoor sport
    
    return {
      temperature: Math.floor(Math.random() * 40) + 50, // 50-90°F
      humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
      windSpeed: Math.floor(Math.random() * 20), // 0-20 mph
      windDirection: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'][Math.floor(Math.random() * 8)],
      conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Wind'][Math.floor(Math.random() * 4)]
    };
  }
}

export const gameGenerator = new GameGenerator();