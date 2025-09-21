import { sportsDataService } from "./sportsDataService";
import type { Game, Team, Player } from "@shared/schema";

interface CachedData {
  games: Game[];
  teams: Team[];
  players: Player[];
  lastUpdated: Date;
}

class RealDataCache {
  private cache: Map<string, CachedData> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  async getNFLGames(): Promise<Game[]> {
    const cached = this.cache.get('nfl');
    
    // Return cached data if it's fresh
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      console.log(`🏈 Returning cached NFL games: ${cached.games.length} games`);
      return cached.games;
    }

    // Fetch fresh data from SportsDataIO
    try {
      console.log('🏈 Fetching fresh NFL data from SportsDataIO...');
      const games = await sportsDataService.getNFLGames();
      const teams = await sportsDataService.getNFLTeams();
      
      // Cache the data
      this.cache.set('nfl', {
        games,
        teams,
        players: [], // We'll add players later
        lastUpdated: new Date()
      });
      
      console.log(`🏈 Cached ${games.length} NFL games from SportsDataIO`);
      return games;
    } catch (error) {
      console.error('❌ Error fetching NFL data from SportsDataIO:', error);
      
      // Return cached data if available, even if stale
      if (cached) {
        console.log('🏈 Returning stale cached data due to API error');
        return cached.games;
      }
      
      // Return empty array if no cached data
      return [];
    }
  }

  async getNFLTeams(): Promise<Team[]> {
    const cached = this.cache.get('nfl');
    
    // Return cached data if it's fresh
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      console.log(`🏈 Returning cached NFL teams: ${cached.teams.length} teams`);
      return cached.teams;
    }

    // Fetch fresh data
    try {
      console.log('🏈 Fetching fresh NFL teams from SportsDataIO...');
      const teams = await sportsDataService.getNFLTeams();
      
      // Update cache
      const existingCache = this.cache.get('nfl') || { games: [], teams: [], players: [], lastUpdated: new Date() };
      this.cache.set('nfl', {
        ...existingCache,
        teams,
        lastUpdated: new Date()
      });
      
      console.log(`🏈 Cached ${teams.length} NFL teams from SportsDataIO`);
      return teams;
    } catch (error) {
      console.error('❌ Error fetching NFL teams from SportsDataIO:', error);
      
      // Return cached data if available
      if (cached) {
        return cached.teams;
      }
      
      return [];
    }
  }

  async getMLBGames(): Promise<Game[]> {
    const cached = this.cache.get('mlb');
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      return cached.games;
    }

    try {
      const games = await sportsDataService.getMLBGames();
      const teams = await sportsDataService.getMLBTeams();
      
      this.cache.set('mlb', {
        games,
        teams,
        players: [],
        lastUpdated: new Date()
      });
      
      return games;
    } catch (error) {
      console.error('❌ Error fetching MLB data:', error);
      return cached?.games || [];
    }
  }

  async getMLBTeams(): Promise<Team[]> {
    const cached = this.cache.get('mlb');
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      return cached.teams;
    }

    try {
      const teams = await sportsDataService.getMLBTeams();
      
      const existingCache = this.cache.get('mlb') || { games: [], teams: [], players: [], lastUpdated: new Date() };
      this.cache.set('mlb', {
        ...existingCache,
        teams,
        lastUpdated: new Date()
      });
      
      return teams;
    } catch (error) {
      console.error('❌ Error fetching MLB teams:', error);
      return cached?.teams || [];
    }
  }

  async getNBAGames(): Promise<Game[]> {
    const cached = this.cache.get('nba');
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      return cached.games;
    }

    try {
      const games = await sportsDataService.getNBAGames();
      const teams = await sportsDataService.getNBATeams();
      
      this.cache.set('nba', {
        games,
        teams,
        players: [],
        lastUpdated: new Date()
      });
      
      return games;
    } catch (error) {
      console.error('❌ Error fetching NBA data:', error);
      return cached?.games || [];
    }
  }

  async getNBATeams(): Promise<Team[]> {
    const cached = this.cache.get('nba');
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      return cached.teams;
    }

    try {
      const teams = await sportsDataService.getNBATeams();
      
      const existingCache = this.cache.get('nba') || { games: [], teams: [], players: [], lastUpdated: new Date() };
      this.cache.set('nba', {
        ...existingCache,
        teams,
        lastUpdated: new Date()
      });
      
      return teams;
    } catch (error) {
      console.error('❌ Error fetching NBA teams:', error);
      return cached?.teams || [];
    }
  }

  // Clear cache for a specific sport
  clearCache(sportId: string): void {
    this.cache.delete(sportId);
    console.log(`🗑️ Cleared cache for ${sportId.toUpperCase()}`);
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
    console.log('🗑️ Cleared all cache');
  }

  // Get cache status
  getCacheStatus(): Record<string, { games: number; teams: number; lastUpdated: Date }> {
    const status: Record<string, { games: number; teams: number; lastUpdated: Date }> = {};
    
    for (const [sport, data] of this.cache.entries()) {
      status[sport] = {
        games: data.games.length,
        teams: data.teams.length,
        lastUpdated: data.lastUpdated
      };
    }
    
    return status;
  }
}

export const realDataCache = new RealDataCache();
