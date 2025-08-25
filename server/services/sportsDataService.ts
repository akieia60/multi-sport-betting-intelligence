import type { Sport, Team, Game, Player, PlayerStats } from "@shared/schema";

interface SportsDataGameResponse {
  GameID: number;
  Season: number;
  SeasonType: number;
  Week?: number;
  Day: string;
  DateTime: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayTeamID: number;
  HomeTeamID: number;
  Stadium?: string;
  Temperature?: number;
  Humidity?: number;
  WindSpeed?: number;
  WindDirection?: string;
  Status: string;
}

interface SportsDataTeamResponse {
  TeamID: number;
  Key: string;
  Active: boolean;
  City: string;
  Name: string;
  StadiumID?: number;
  Conference?: string;
  Division?: string;
  PrimaryColor?: string;
  SecondaryColor?: string;
  WikipediaLogoUrl?: string;
}

interface SportsDataPlayerResponse {
  PlayerID: number;
  TeamID: number;
  Team: string;
  Jersey?: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Height?: string;
  Weight?: number;
  BirthDate?: string;
  Active: boolean;
}

interface BettingOdds {
  bookmaker: string;
  moneyline?: { home: number; away: number };
  spread?: { home: number; away: number; points: number };
  total?: { over: number; under: number; points: number };
  lastUpdated: Date;
}

export class SportsDataService {
  private readonly sportsDbUrl = "https://www.thesportsdb.com/api/v1/json/3";
  private readonly weatherUrl = "https://api.open-meteo.com/v1";
  private readonly oddsApiUrl = "https://api.the-odds-api.com/v4";
  private readonly oddsApiKey = process.env.ODDS_API_KEY;

  constructor() {
    if (this.oddsApiKey) {
      console.log("🎯 Using The Sports DB (Free) + Open-Meteo Weather + The Odds API (Live Betting)");
    } else {
      console.log("🏟️ Using The Sports DB (Free) + Open-Meteo Weather");
    }
  }

  private async makeRequest<T>(url: string, errorContext?: string): Promise<T> {
    console.log(`📡 Fetching: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error${errorContext ? ` (${errorContext})` : ''}:`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched data, records: ${Array.isArray(data) ? data.length : typeof data}`);
    
    return data;
  }

  // The Odds API Integration
  async getBettingOdds(sport: 'baseball_mlb' | 'americanfootball_nfl' | 'basketball_nba'): Promise<BettingOdds[]> {
    if (!this.oddsApiKey) {
      console.log("⚠️ Odds API key not configured - skipping betting odds");
      return [];
    }

    try {
      const url = `${this.oddsApiUrl}/sports/${sport}/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${this.oddsApiKey}`;
      const response = await this.makeRequest<any>(url, `${sport.toUpperCase()} Betting Odds`);
      
      if (!Array.isArray(response)) {
        console.log(`No betting odds found for ${sport}`);
        return [];
      }

      const allOdds: BettingOdds[] = [];
      
      response.forEach((game: any) => {
        if (game.bookmakers && Array.isArray(game.bookmakers)) {
          game.bookmakers.forEach((bookmaker: any) => {
            const odds: BettingOdds = {
              bookmaker: bookmaker.title || bookmaker.key,
              lastUpdated: new Date()
            };

            if (bookmaker.markets && Array.isArray(bookmaker.markets)) {
              bookmaker.markets.forEach((market: any) => {
                if (market.key === 'h2h' && market.outcomes) {
                  // Moneyline odds
                  const home = market.outcomes.find((o: any) => o.name === game.home_team);
                  const away = market.outcomes.find((o: any) => o.name === game.away_team);
                  if (home && away) {
                    odds.moneyline = { home: home.price, away: away.price };
                  }
                } else if (market.key === 'spreads' && market.outcomes) {
                  // Spread odds
                  const home = market.outcomes.find((o: any) => o.name === game.home_team);
                  const away = market.outcomes.find((o: any) => o.name === game.away_team);
                  if (home && away && home.point !== undefined) {
                    odds.spread = { 
                      home: home.price, 
                      away: away.price, 
                      points: Math.abs(home.point)
                    };
                  }
                } else if (market.key === 'totals' && market.outcomes) {
                  // Total (Over/Under) odds
                  const over = market.outcomes.find((o: any) => o.name === 'Over');
                  const under = market.outcomes.find((o: any) => o.name === 'Under');
                  if (over && under && over.point !== undefined) {
                    odds.total = {
                      over: over.price,
                      under: under.price,
                      points: over.point
                    };
                  }
                }
              });
            }

            allOdds.push(odds);
          });
        }
      });

      console.log(`🎯 Fetched ${allOdds.length} betting odds from ${response.length} games`);
      return allOdds;
    } catch (error) {
      console.error(`Error fetching betting odds for ${sport}:`, error);
      return [];
    }
  }

  async getWeatherForGame(latitude: number, longitude: number, date?: string): Promise<any> {
    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const url = `${this.weatherUrl}/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto`;
      
      return await this.makeRequest(url, 'Weather');
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  async getMLBGames(date?: string): Promise<Game[]> {
    try {
      // The Sports DB - Get current season MLB games
      const url = `${this.sportsDbUrl}/eventsseason.php?id=4424&s=2024`;
      const response = await this.makeRequest<any>(url, 'MLB Games');
      
      // Also fetch live betting odds
      const bettingOdds = await this.getBettingOdds('baseball_mlb');
      
      if (!response.events) {
        console.log("No MLB events found in response");
        return [];
      }

      // Filter to recent/today's games for live feel
      const today = new Date();
      const recentGames = response.events.filter((event: any) => {
        if (!event.dateEvent) return false;
        const gameDate = new Date(event.dateEvent);
        const daysDiff = Math.abs((today.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7; // Games within last week
      }).slice(0, 10); // Limit to 10 games
      
      const gamesWithWeather = await Promise.all(recentGames.map(async (event: any) => {
        const weather = event.strVenue ? await this.getWeatherForVenue(event.strVenue) : null;
        
        return {
          id: `mlb-${event.idEvent}`,
          sportId: "mlb",
          homeTeamId: `mlb-${event.strHomeTeam?.replace(/\s+/g, '')}`,
          awayTeamId: `mlb-${event.strAwayTeam?.replace(/\s+/g, '')}`,
          gameDate: new Date(event.strTimestamp || event.dateEvent),
          venue: event.strVenue || null,
          weather: weather ? {
            temperature: weather.daily?.temperature_2m_max?.[0] || null,
            humidity: null,
            windSpeed: weather.daily?.wind_speed_10m_max?.[0] || null,
            windDirection: null,
            conditions: weather.daily?.weather_code?.[0] ? this.getWeatherCondition(weather.daily.weather_code[0]) : null
          } : null,
          gameTotal: null,
          isCompleted: event.strStatus === "Match Finished",
          lastUpdated: new Date()
        };
      }));
      
      console.log(`🎯 MLB: ${gamesWithWeather.length} games, ${bettingOdds.length} betting lines available`);
      return gamesWithWeather;
    } catch (error) {
      console.error("Error fetching MLB games:", error);
      return [];
    }
  }

  private async getWeatherForVenue(venueName: string): Promise<any> {
    // MLB stadium coordinates (sample for major venues)
    const stadiumCoords: Record<string, {lat: number, lng: number}> = {
      'Yankee Stadium': {lat: 40.8296, lng: -73.9262},
      'Fenway Park': {lat: 42.3467, lng: -71.0972},
      'Wrigley Field': {lat: 41.9484, lng: -87.6553},
      'Dodger Stadium': {lat: 34.0739, lng: -118.2400},
      'Coors Field': {lat: 39.7559, lng: -104.9942},
      'Camden Yards': {lat: 39.2839, lng: -76.6218},
      'Progressive Field': {lat: 41.4961, lng: -81.6850}
    };

    const coords = stadiumCoords[venueName];
    if (coords) {
      return await this.getWeatherForGame(coords.lat, coords.lng);
    }
    return null;
  }

  private getWeatherCondition(code: number): string {
    // Open-Meteo weather codes
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy'; 
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Showers';
    if (code <= 99) return 'Thunderstorms';
    return 'Unknown';
  }

  async getNFLGames(week?: number, season?: number): Promise<Game[]> {
    try {
      // The Sports DB - Get NFL season games
      const url = `${this.sportsDbUrl}/eventsseason.php?id=4391&s=2024`;
      const response = await this.makeRequest<any>(url, 'NFL Games');
      
      // Also fetch live betting odds
      const bettingOdds = await this.getBettingOdds('americanfootball_nfl');
      
      if (!response.events) {
        console.log("No NFL events found in response");
        return [];
      }

      // Filter to recent games
      const today = new Date();
      const recentGames = response.events.filter((event: any) => {
        if (!event.dateEvent) return false;
        const gameDate = new Date(event.dateEvent);
        const daysDiff = Math.abs((today.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14; // Games within last 2 weeks
      }).slice(0, 10);
      
      const gamesWithWeather = await Promise.all(recentGames.map(async (event: any) => {
        const weather = event.strVenue ? await this.getWeatherForVenue(event.strVenue) : null;
        
        return {
          id: `nfl-${event.idEvent}`,
          sportId: "nfl",
          homeTeamId: `nfl-${event.strHomeTeam?.replace(/\s+/g, '')}`,
          awayTeamId: `nfl-${event.strAwayTeam?.replace(/\s+/g, '')}`,
          gameDate: new Date(event.strTimestamp || event.dateEvent),
          venue: event.strVenue || null,
          weather: weather ? {
            temperature: weather.daily?.temperature_2m_max?.[0] || null,
            humidity: null,
            windSpeed: weather.daily?.wind_speed_10m_max?.[0] || null,
            windDirection: null,
            conditions: weather.daily?.weather_code?.[0] ? this.getWeatherCondition(weather.daily.weather_code[0]) : null
          } : null,
          gameTotal: null,
          isCompleted: event.strStatus === "Match Finished",
          lastUpdated: new Date()
        };
      }));
      
      console.log(`🏈 NFL: ${gamesWithWeather.length} games, ${bettingOdds.length} betting lines available`);
      return gamesWithWeather;
    } catch (error) {
      console.error("Error fetching NFL games:", error);
      return [];
    }
  }

  async getNBAGames(date?: string): Promise<Game[]> {
    try {
      // The Sports DB - Get NBA season games
      const url = `${this.sportsDbUrl}/eventsseason.php?id=4387&s=2024`;
      const response = await this.makeRequest<any>(url, 'NBA Games');
      
      // Also fetch live betting odds
      const bettingOdds = await this.getBettingOdds('basketball_nba');
      
      if (!response.events) {
        console.log("No NBA events found in response");
        return [];
      }

      // Filter to recent games
      const today = new Date();
      const recentGames = response.events.filter((event: any) => {
        if (!event.dateEvent) return false;
        const gameDate = new Date(event.dateEvent);
        const daysDiff = Math.abs((today.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14; // Games within last 2 weeks
      }).slice(0, 10);
      
      const games = recentGames.map((event: any) => ({
        id: `nba-${event.idEvent}`,
        sportId: "nba",
        homeTeamId: `nba-${event.strHomeTeam?.replace(/\s+/g, '')}`,
        awayTeamId: `nba-${event.strAwayTeam?.replace(/\s+/g, '')}`,
        gameDate: new Date(event.strTimestamp || event.dateEvent),
        venue: event.strVenue || null,
        weather: null, // NBA games are typically indoors
        gameTotal: null,
        isCompleted: event.strStatus === "Match Finished",
        lastUpdated: new Date()
      }));
      
      console.log(`🏀 NBA: ${games.length} games, ${bettingOdds.length} betting lines available`);
      return games;
    } catch (error) {
      console.error("Error fetching NBA games:", error);
      return [];
    }
  }

  async getMLBTeams(): Promise<Team[]> {
    try {
      // The Sports DB - Get MLB teams 
      const url = `${this.sportsDbUrl}/search_all_teams.php?l=MLB`;
      const response = await this.makeRequest<any>(url, 'MLB Teams');
      
      if (!response.teams) {
        console.log("No MLB teams found in response");
        return [];
      }
      
      return response.teams.map((team: any) => ({
        id: `mlb-${team.strTeam?.replace(/\s+/g, '')}`,
        sportId: "mlb",
        name: team.strTeam || 'Unknown',
        city: team.strLocation || team.strTeam?.split(' ')[0] || 'Unknown',
        abbreviation: team.strTeamShort || team.strTeam?.substring(0, 3).toUpperCase() || 'UNK',
        logoUrl: team.strBadge || team.strLogo || null,
        primaryColor: team.strColour1 ? `#${team.strColour1}` : "#000000",
        secondaryColor: team.strColour2 ? `#${team.strColour2}` : "#FFFFFF",
        conference: team.strLeague || "MLB",
        division: team.strDivision || null
      }));
    } catch (error) {
      console.error("Error fetching MLB teams:", error);
      return [];
    }
  }

  async getNFLTeams(): Promise<Team[]> {
    try {
      // The Sports DB - Get NFL teams
      const url = `${this.sportsDbUrl}/search_all_teams.php?l=NFL`;
      const response = await this.makeRequest<any>(url, 'NFL Teams');
      
      if (!response.teams) {
        console.log("No NFL teams found in response");
        return [];
      }
      
      return response.teams.map((team: any) => ({
        id: `nfl-${team.strTeam?.replace(/\s+/g, '')}`,
        sportId: "nfl",
        name: team.strTeam || 'Unknown',
        city: team.strLocation || team.strTeam?.split(' ')[0] || 'Unknown',
        abbreviation: team.strTeamShort || team.strTeam?.substring(0, 3).toUpperCase() || 'UNK',
        logoUrl: team.strBadge || team.strLogo || null,
        primaryColor: team.strColour1 ? `#${team.strColour1}` : "#000000",
        secondaryColor: team.strColour2 ? `#${team.strColour2}` : "#FFFFFF",
        conference: team.strLeague || "NFL",
        division: team.strDivision || null
      }));
    } catch (error) {
      console.error("Error fetching NFL teams:", error);
      return [];
    }
  }

  async getNBATeams(): Promise<Team[]> {
    try {
      // The Sports DB - Get NBA teams
      const url = `${this.sportsDbUrl}/search_all_teams.php?l=NBA`;
      const response = await this.makeRequest<any>(url, 'NBA Teams');
      
      if (!response.teams) {
        console.log("No NBA teams found in response");
        return [];
      }
      
      return response.teams.map((team: any) => ({
          id: `nba-${team.strTeam?.replace(/\s+/g, '')}`,
          sportId: "nba",
          name: team.strTeam || 'Unknown',
          city: team.strLocation || team.strTeam?.split(' ')[0] || 'Unknown',
          abbreviation: team.strTeamShort || team.strTeam?.substring(0, 3).toUpperCase() || 'UNK',
          logoUrl: team.strBadge || team.strLogo || null,
          primaryColor: team.strColour1 ? `#${team.strColour1}` : "#000000",
          secondaryColor: team.strColour2 ? `#${team.strColour2}` : "#FFFFFF",
          conference: team.strLeague || "NBA",
          division: team.strDivision || null
        }));
    } catch (error) {
      console.error("Error fetching NBA teams:", error);
      return [];
    }
  }

  async getMLBPlayers(teamKey?: string): Promise<Player[]> {
    try {
      // The Sports DB doesn't have detailed player endpoints like SportsDataIO
      // For now, return empty array - could implement team-specific player search later
      console.log("MLB players endpoint not implemented with The Sports DB - using team data for now");
      return [];
    } catch (error) {
      console.error("Error fetching MLB players:", error);
      return [];
    }
  }

  async getNFLPlayers(teamKey?: string): Promise<Player[]> {
    try {
      // The Sports DB doesn't have detailed player endpoints like SportsDataIO  
      // For now, return empty array - could implement team-specific player search later
      console.log("NFL players endpoint not implemented with The Sports DB - using team data for now");
      return [];
    } catch (error) {
      console.error("Error fetching NFL players:", error);
      return [];
    }
  }

  async getNBAPlayers(teamKey?: string): Promise<Player[]> {
    try {
      // The Sports DB doesn't have detailed player endpoints like SportsDataIO
      // For now, return empty array - could implement team-specific player search later  
      console.log("NBA players endpoint not implemented with The Sports DB - using team data for now");
      return [];
    } catch (error) {
      console.error("Error fetching NBA players:", error);
      return [];
    }
  }
}

export const sportsDataService = new SportsDataService();