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

export class SportsDataService {
  private readonly sportsDbUrl = "https://www.thesportsdb.com/api/v1/json/3";
  private readonly weatherUrl = "https://api.open-meteo.com/v1";

  constructor() {
    console.log("🏟️ Using The Sports DB (Free) + Open-Meteo Weather");
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
      const currentSeason = season || new Date().getFullYear();
      const currentWeek = week || 1;
      const games = await this.makeRequest<SportsDataGameResponse[]>(`/nfl/scores/json/ScoresByWeek/${currentSeason}REG/${currentWeek}`);
      
      return games.map(game => ({
        id: `nfl-${game.GameID}`,
        sportId: "nfl",
        homeTeamId: `nfl-${game.HomeTeamID}`,
        awayTeamId: `nfl-${game.AwayTeamID}`,
        gameDate: new Date(game.DateTime),
        venue: game.Stadium || null,
        weather: game.Temperature ? {
          temperature: game.Temperature,
          humidity: game.Humidity || null,
          windSpeed: game.WindSpeed || null,
          windDirection: game.WindDirection || null,
          conditions: null
        } : null,
        gameTotal: null,
        isCompleted: game.Status === "Final" || game.Status === "Closed",
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error("Error fetching NFL games:", error);
      return [];
    }
  }

  async getNBAGames(date?: string): Promise<Game[]> {
    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const games = await this.makeRequest<SportsDataGameResponse[]>(`/nba/scores/json/GamesByDate/${dateStr}`);
      
      return games.map(game => ({
        id: `nba-${game.GameID}`,
        sportId: "nba",
        homeTeamId: `nba-${game.HomeTeamID}`,
        awayTeamId: `nba-${game.AwayTeamID}`,
        gameDate: new Date(game.DateTime),
        venue: game.Stadium || null,
        weather: null, // NBA games are typically indoors
        gameTotal: null,
        isCompleted: game.Status === "Final" || game.Status === "Closed",
        lastUpdated: new Date()
      }));
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
      const teams = await this.makeRequest<SportsDataTeamResponse[]>("/nfl/scores/json/Teams");
      
      return teams
        .filter(team => team.Active)
        .map(team => ({
          id: `nfl-${team.TeamID}`,
          sportId: "nfl",
          name: team.Name,
          city: team.City,
          abbreviation: team.Key,
          logoUrl: team.WikipediaLogoUrl || null,
          primaryColor: team.PrimaryColor || "#000000",
          secondaryColor: team.SecondaryColor || "#FFFFFF",
          conference: team.Conference || null,
          division: team.Division || null
        }));
    } catch (error) {
      console.error("Error fetching NFL teams:", error);
      return [];
    }
  }

  async getNBATeams(): Promise<Team[]> {
    try {
      const teams = await this.makeRequest<SportsDataTeamResponse[]>("/nba/scores/json/teams");
      
      return teams
        .filter(team => team.Active)
        .map(team => ({
          id: `nba-${team.TeamID}`,
          sportId: "nba",
          name: team.Name,
          city: team.City,
          abbreviation: team.Key,
          logoUrl: team.WikipediaLogoUrl || null,
          primaryColor: team.PrimaryColor || "#000000",
          secondaryColor: team.SecondaryColor || "#FFFFFF",
          conference: team.Conference || null,
          division: team.Division || null
        }));
    } catch (error) {
      console.error("Error fetching NBA teams:", error);
      return [];
    }
  }

  async getMLBPlayers(teamKey?: string): Promise<Player[]> {
    try {
      const endpoint = teamKey 
        ? `/mlb/scores/json/Players/${teamKey}`
        : "/mlb/scores/json/Players";
      const players = await this.makeRequest<SportsDataPlayerResponse[]>(endpoint);
      
      return players
        .filter(player => player.Active)
        .map(player => ({
          id: `mlb-${player.PlayerID}`,
          teamId: `mlb-${player.TeamID}`,
          sportId: "mlb",
          name: `${player.FirstName} ${player.LastName}`,
          position: player.Position,
          isActive: player.Active,
          jerseyNumber: player.Jersey || null,
          createdAt: new Date()
        }));
    } catch (error) {
      console.error("Error fetching MLB players:", error);
      return [];
    }
  }

  async getNFLPlayers(teamKey?: string): Promise<Player[]> {
    try {
      const endpoint = teamKey 
        ? `/nfl/scores/json/Players/${teamKey}`
        : "/nfl/scores/json/Players";
      const players = await this.makeRequest<SportsDataPlayerResponse[]>(endpoint);
      
      return players
        .filter(player => player.Active)
        .map(player => ({
          id: `nfl-${player.PlayerID}`,
          teamId: `nfl-${player.TeamID}`,
          sportId: "nfl",
          name: `${player.FirstName} ${player.LastName}`,
          position: player.Position,
          isActive: player.Active,
          jerseyNumber: player.Jersey || null,
          createdAt: new Date()
        }));
    } catch (error) {
      console.error("Error fetching NFL players:", error);
      return [];
    }
  }

  async getNBAPlayers(teamKey?: string): Promise<Player[]> {
    try {
      const endpoint = teamKey 
        ? `/nba/scores/json/Players/${teamKey}`
        : "/nba/scores/json/Players";
      const players = await this.makeRequest<SportsDataPlayerResponse[]>(endpoint);
      
      return players
        .filter(player => player.Active)
        .map(player => ({
          id: `nba-${player.PlayerID}`,
          teamId: `nba-${player.TeamID}`,
          sportId: "nba",
          name: `${player.FirstName} ${player.LastName}`,
          position: player.Position,
          isActive: player.Active,
          jerseyNumber: player.Jersey || null,
          createdAt: new Date()
        }));
    } catch (error) {
      console.error("Error fetching NBA players:", error);
      return [];
    }
  }
}

export const sportsDataService = new SportsDataService();