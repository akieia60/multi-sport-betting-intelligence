import type { IStorage } from "./storage";
import type {
  User,
  UpsertUser,
  Sport,
  Team,
  Player,
  Game,
  PlayerStats,
  PlayerEdge,
  AttackBoard,
  Parlay,
  Future,
  InsertPlayer,
  InsertGame,
  InsertPlayerEdge,
  InsertFuture,
} from "@shared/schema";

// Mock data for testing
const mockSports: Sport[] = [
  { id: "nfl", name: "NFL", displayName: "NFL", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "nba", name: "NBA", displayName: "NBA", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "mlb", name: "MLB", displayName: "MLB", isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const mockTeams: Team[] = [
  { id: "nfl-chiefs", sportId: "nfl", name: "Kansas City Chiefs", abbreviation: "KC", city: "Kansas City", conference: "AFC", division: "West", createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-bills", sportId: "nfl", name: "Buffalo Bills", abbreviation: "BUF", city: "Buffalo", conference: "AFC", division: "East", createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-cowboys", sportId: "nfl", name: "Dallas Cowboys", abbreviation: "DAL", city: "Dallas", conference: "NFC", division: "East", createdAt: new Date(), updatedAt: new Date() },
];

const mockPlayers: Player[] = [
  { id: "nfl-mahomes", sportId: "nfl", teamId: "nfl-chiefs", name: "Patrick Mahomes", position: "QB", jerseyNumber: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-allen", sportId: "nfl", teamId: "nfl-bills", name: "Josh Allen", position: "QB", jerseyNumber: 17, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-dak", sportId: "nfl", teamId: "nfl-cowboys", name: "Dak Prescott", position: "QB", jerseyNumber: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-kelce", sportId: "nfl", teamId: "nfl-chiefs", name: "Travis Kelce", position: "TE", jerseyNumber: 87, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "nfl-diggs", sportId: "nfl", teamId: "nfl-bills", name: "Stefon Diggs", position: "WR", jerseyNumber: 14, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const mockGames: Game[] = [
  {
    id: "nfl-game-1",
    sportId: "nfl",
    homeTeamId: "nfl-chiefs",
    awayTeamId: "nfl-bills",
    gameDate: new Date(),
    status: "scheduled",
    week: 3,
    season: 2025,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "nfl-game-2", 
    sportId: "nfl",
    homeTeamId: "nfl-cowboys",
    awayTeamId: "nfl-chiefs",
    gameDate: new Date(),
    status: "scheduled",
    week: 3,
    season: 2025,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockPlayerEdges: PlayerEdge[] = [
  {
    id: "edge-1",
    playerId: "nfl-mahomes",
    gameId: "nfl-game-1",
    edgeScore: "87.5",
    confidence: 4,
    bestPropType: "Passing Yards",
    bestPropLine: "O 285.5",
    notes: "Strong matchup vs Bills secondary",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "edge-2",
    playerId: "nfl-kelce",
    gameId: "nfl-game-1", 
    edgeScore: "82.3",
    confidence: 5,
    bestPropType: "Receiving Yards",
    bestPropLine: "O 75.5",
    notes: "Elite target share in red zone",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "edge-3",
    playerId: "nfl-allen",
    gameId: "nfl-game-1",
    edgeScore: "79.1", 
    confidence: 4,
    bestPropType: "Rushing Yards",
    bestPropLine: "O 45.5",
    notes: "Mobile QB vs weak run defense",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class MockStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return {
      id,
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return {
      id: userData.id,
      email: userData.email || "test@example.com",
      name: userData.name || "Test User",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getSports(): Promise<Sport[]> {
    return mockSports;
  }

  async getSport(id: string): Promise<Sport | undefined> {
    return mockSports.find(s => s.id === id);
  }

  async getTeams(sportId?: string): Promise<Team[]> {
    if (sportId) {
      return mockTeams.filter(t => t.sportId === sportId);
    }
    return mockTeams;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return mockTeams.find(t => t.id === id);
  }

  async createTeam(team: any): Promise<Team> {
    return team;
  }

  async getPlayers(teamId?: string, sportId?: string): Promise<Player[]> {
    let filtered = mockPlayers;
    if (teamId) filtered = filtered.filter(p => p.teamId === teamId);
    if (sportId) filtered = filtered.filter(p => p.sportId === sportId);
    return filtered;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return mockPlayers.find(p => p.id === id);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    return {
      ...player,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Player;
  }

  async getGames(sportId: string, date?: Date): Promise<Game[]> {
    return mockGames.filter(g => g.sportId === sportId);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return mockGames.find(g => g.id === id);
  }

  async createGame(game: InsertGame): Promise<Game> {
    return {
      ...game,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Game;
  }

  async getTodaysGames(sportId: string): Promise<Game[]> {
    return mockGames.filter(g => g.sportId === sportId);
  }

  async getPlayerStats(playerId: string, gameId?: string): Promise<PlayerStats[]> {
    return [];
  }

  async getPlayerEdges(gameId?: string, sportId?: string): Promise<PlayerEdge[]> {
    let filtered = mockPlayerEdges;
    if (gameId) filtered = filtered.filter(e => e.gameId === gameId);
    return filtered;
  }

  async getElitePlayers(sportId: string, limit = 50): Promise<PlayerEdge[]> {
    return mockPlayerEdges.slice(0, limit);
  }

  async createPlayerEdge(edge: InsertPlayerEdge): Promise<PlayerEdge> {
    return {
      ...edge,
      createdAt: new Date(),
      updatedAt: new Date()
    } as PlayerEdge;
  }

  async getPlayerEdgesByPlayerId(playerId: string): Promise<PlayerEdge[]> {
    return mockPlayerEdges.filter(e => e.playerId === playerId);
  }

  async updatePlayerEdge(id: string, data: Partial<PlayerEdge>): Promise<PlayerEdge> {
    const edge = mockPlayerEdges.find(e => e.id === id);
    return { ...edge, ...data } as PlayerEdge;
  }

  async getAttackBoard(sportId: string): Promise<AttackBoard[]> {
    return [];
  }

  async getParlays(userId?: string): Promise<Parlay[]> {
    return [];
  }

  async createParlay(parlay: any): Promise<Parlay> {
    return {
      ...parlay,
      id: "mock-parlay-1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getFutures(sportId?: string, category?: string): Promise<Future[]> {
    return [];
  }

  async createFuture(future: InsertFuture): Promise<Future> {
    return {
      ...future,
      id: "mock-future-1",
      createdAt: new Date(),
      updatedAt: new Date()
    } as Future;
  }
}

export const mockStorage = new MockStorage();
