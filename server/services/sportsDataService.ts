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
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.sportsdata.io/v3";

  constructor() {
    this.apiKey = process.env.SPORTS_DATA_API_KEY!;
    if (!this.apiKey) {
      throw new Error("SPORTS_DATA_API_KEY environment variable is required");
    }
    console.log("🏈 Using SportsDataIO with key:", this.apiKey.substring(0, 8) + "...");
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    // SportsDataIO uses query parameter authentication
    const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;
    
    console.log(`📡 Fetching SportsDataIO: ${endpoint}`);
    console.log(`🔗 Full URL: ${url.replace(this.apiKey, "***KEY***")}`);
    
    const response = await fetch(url);
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SportsDataIO error details:`, errorText);
      throw new Error(`SportsDataIO API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched data, type: ${typeof data}, length: ${Array.isArray(data) ? data.length : 'not array'}`);
    
    return data;
  }

  async getMLBGames(date?: string): Promise<Game[]> {
    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const games = await this.makeRequest<SportsDataGameResponse[]>(`/mlb/scores/json/GamesByDate/${dateStr}`);
      
      return games.map(game => ({
        id: `mlb-${game.GameID}`,
        sportId: "mlb",
        homeTeamId: `mlb-${game.HomeTeamID}`,
        awayTeamId: `mlb-${game.AwayTeamID}`,
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
      console.error("Error fetching MLB games:", error);
      return [];
    }
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
      const teams = await this.makeRequest<SportsDataTeamResponse[]>("/mlb/scores/json/teams");
      
      return teams
        .filter(team => team.Active)
        .map(team => ({
          id: `mlb-${team.TeamID}`,
          sportId: "mlb",
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