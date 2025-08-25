import {
  users,
  sports,
  teams,
  players,
  games,
  playerStats,
  playerEdges,
  attackBoard,
  parlays,
  type User,
  type UpsertUser,
  type Sport,
  type Team,
  type Player,
  type Game,
  type PlayerStats,
  type PlayerEdge,
  type AttackBoard,
  type Parlay,
  type InsertPlayer,
  type InsertGame,
  type InsertPlayerEdge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Sports operations
  getSports(): Promise<Sport[]>;
  getSport(id: string): Promise<Sport | undefined>;
  
  // Team operations
  getTeams(sportId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: any): Promise<Team>;
  
  // Player operations
  getPlayers(teamId?: string, sportId?: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  
  // Game operations
  getGames(sportId: string, date?: Date): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  getTodaysGames(sportId: string): Promise<Game[]>;
  
  // Player stats operations
  getPlayerStats(playerId: string, gameId?: string): Promise<PlayerStats[]>;
  
  // Player edges operations
  getPlayerEdges(gameId?: string, sportId?: string): Promise<PlayerEdge[]>;
  getElitePlayers(sportId: string, limit?: number): Promise<PlayerEdge[]>;
  createPlayerEdge(edge: InsertPlayerEdge): Promise<PlayerEdge>;
  getPlayerEdgesByPlayerId(playerId: string): Promise<PlayerEdge[]>;
  updatePlayerEdge(id: string, data: Partial<PlayerEdge>): Promise<PlayerEdge>;
  
  // Attack board operations
  getAttackBoard(sportId: string): Promise<AttackBoard[]>;
  
  // Parlay operations
  getParlays(userId?: string): Promise<Parlay[]>;
  createParlay(parlay: any): Promise<Parlay>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getSports(): Promise<Sport[]> {
    return await db.select().from(sports).where(eq(sports.isActive, true));
  }

  async getSport(id: string): Promise<Sport | undefined> {
    const [sport] = await db.select().from(sports).where(eq(sports.id, id));
    return sport;
  }

  async getTeams(sportId?: string): Promise<Team[]> {
    if (sportId) {
      return await db.select().from(teams).where(eq(teams.sportId, sportId));
    }
    return await db.select().from(teams);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getPlayers(teamId?: string, sportId?: string): Promise<Player[]> {
    if (teamId && sportId) {
      return await db.select().from(players).where(
        and(
          eq(players.isActive, true),
          eq(players.teamId, teamId), 
          eq(players.sportId, sportId)
        )
      );
    } else if (teamId) {
      return await db.select().from(players).where(
        and(
          eq(players.isActive, true),
          eq(players.teamId, teamId)
        )
      );
    } else if (sportId) {
      return await db.select().from(players).where(
        and(
          eq(players.isActive, true),
          eq(players.sportId, sportId)
        )
      );
    }
    
    return await db.select().from(players).where(eq(players.isActive, true));
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async getGames(sportId: string, date?: Date): Promise<Game[]> {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await db.select().from(games).where(
        and(
          eq(games.sportId, sportId),
          gte(games.gameDate, startOfDay),
          lte(games.gameDate, endOfDay)
        )
      ).orderBy(games.gameDate);
    }
    
    return await db.select().from(games).where(eq(games.sportId, sportId)).orderBy(games.gameDate);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async getTodaysGames(sportId: string): Promise<Game[]> {
    const today = new Date();
    return await this.getGames(sportId, today);
  }

  async getPlayerStats(playerId: string, gameId?: string): Promise<PlayerStats[]> {
    if (gameId) {
      return await db.select().from(playerStats).where(
        and(
          eq(playerStats.playerId, playerId), 
          eq(playerStats.gameId, gameId)
        )
      ).orderBy(desc(playerStats.date));
    }
    
    return await db.select().from(playerStats).where(
      eq(playerStats.playerId, playerId)
    ).orderBy(desc(playerStats.date));
  }

  async getPlayerEdges(gameId?: string, sportId?: string): Promise<PlayerEdge[]> {
    if (gameId && sportId) {
      return await db.select().from(playerEdges).where(
        eq(playerEdges.gameId, gameId)
      ).orderBy(desc(playerEdges.edgeScore));
    } else if (sportId) {
      // Get edges for today's games in the sport
      const today = new Date();
      const todaysGames = await this.getTodaysGames(sportId);
      const gameIds = todaysGames.map(g => g.id);
      
      if (gameIds.length > 0) {
        return await db.select().from(playerEdges).where(
          or(...gameIds.map(id => eq(playerEdges.gameId, id)))
        ).orderBy(desc(playerEdges.edgeScore));
      }
    }
    
    return await db.select().from(playerEdges).orderBy(desc(playerEdges.edgeScore));
  }

  async getElitePlayers(sportId: string, limit = 50): Promise<PlayerEdge[]> {
    const today = new Date();
    const todaysGames = await this.getTodaysGames(sportId);
    const gameIds = todaysGames.map(g => g.id);
    
    if (gameIds.length === 0) return [];
    
    return await db.select()
      .from(playerEdges)
      .where(or(...gameIds.map(id => eq(playerEdges.gameId, id))))
      .orderBy(desc(playerEdges.edgeScore))
      .limit(limit);
  }

  async createPlayerEdge(edge: InsertPlayerEdge): Promise<PlayerEdge> {
    const [newEdge] = await db.insert(playerEdges).values(edge).returning();
    return newEdge;
  }

  async getAttackBoard(sportId: string): Promise<AttackBoard[]> {
    return await db.select()
      .from(attackBoard)
      .where(eq(attackBoard.sportId, sportId))
      .orderBy(desc(attackBoard.exploitabilityScore));
  }

  async getParlays(userId?: string): Promise<Parlay[]> {
    if (userId) {
      return await db.select().from(parlays).where(
        eq(parlays.userId, userId)
      ).orderBy(desc(parlays.createdAt));
    }
    
    return await db.select().from(parlays).orderBy(desc(parlays.createdAt));
  }

  async createParlay(parlayData: any): Promise<Parlay> {
    const [newParlay] = await db.insert(parlays).values(parlayData).returning();
    return newParlay;
  }

  async createTeam(teamData: any): Promise<Team> {
    try {
      const [newTeam] = await db.insert(teams).values(teamData).onConflictDoNothing().returning();
      if (!newTeam) {
        const [existing] = await db.select().from(teams).where(eq(teams.id, teamData.id));
        return existing;
      }
      return newTeam;
    } catch (error) {
      const [existing] = await db.select().from(teams).where(eq(teams.id, teamData.id));
      return existing;
    }
  }

  async getPlayerEdgesByPlayerId(playerId: string): Promise<PlayerEdge[]> {
    return await db.select()
      .from(playerEdges)
      .where(eq(playerEdges.playerId, playerId))
      .orderBy(desc(playerEdges.edgeScore));
  }

  async updatePlayerEdge(id: string, data: Partial<PlayerEdge>): Promise<PlayerEdge> {
    const [updated] = await db.update(playerEdges)
      .set(data)
      .where(eq(playerEdges.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
