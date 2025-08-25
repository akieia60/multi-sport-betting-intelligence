import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, standard, vip
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sports and leagues
export const sports = pgTable("sports", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  colorCode: varchar("color_code").notNull(),
  isActive: boolean("is_active").default(true),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey(),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  name: varchar("name").notNull(),
  abbreviation: varchar("abbreviation").notNull(),
  city: varchar("city").notNull(),
  division: varchar("division"),
  conference: varchar("conference"),
  logoUrl: varchar("logo_url"),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey(),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  name: varchar("name").notNull(),
  position: varchar("position").notNull(),
  jerseyNumber: integer("jersey_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey(),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  homeTeamId: varchar("home_team_id").notNull().references(() => teams.id),
  awayTeamId: varchar("away_team_id").notNull().references(() => teams.id),
  gameDate: timestamp("game_date").notNull(),
  venue: varchar("venue"),
  weather: jsonb("weather"), // {temp, wind, conditions, etc}
  gameTotal: decimal("game_total", { precision: 4, scale: 1 }),
  isCompleted: boolean("is_completed").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  gameId: varchar("game_id").references(() => games.id),
  date: date("date").notNull(),
  stats: jsonb("stats").notNull(), // sport-specific stats object
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerEdges = pgTable("player_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  edgeScore: decimal("edge_score", { precision: 5, scale: 2 }).notNull(),
  pitchMatchEdge: decimal("pitch_match_edge", { precision: 5, scale: 2 }),
  recentForm: decimal("recent_form", { precision: 5, scale: 2 }),
  slotVulnerability: decimal("slot_vulnerability", { precision: 5, scale: 2 }),
  environmentBoost: decimal("environment_boost", { precision: 5, scale: 2 }),
  usageRate: decimal("usage_rate", { precision: 5, scale: 2 }),
  opponentWeakness: decimal("opponent_weakness", { precision: 5, scale: 2 }),
  confidence: integer("confidence").notNull(), // 1-5 stars
  bestPropType: varchar("best_prop_type"),
  bestPropLine: varchar("best_prop_line"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const attackBoard = pgTable("attack_board", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  opponentId: varchar("opponent_id").notNull().references(() => teams.id),
  opponentType: varchar("opponent_type").notNull(), // pitcher, defense, etc
  exploitabilityScore: decimal("exploitability_score", { precision: 5, scale: 2 }).notNull(),
  weaknesses: jsonb("weaknesses").notNull(),
  targetCount: integer("target_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Futures betting (MVP, Championships, Season Props)
export const futures = pgTable("futures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  category: varchar("category").notNull(), // 'MVP', 'CHAMPION', 'ROOKIE_YEAR', 'SEASON_TOTAL'
  title: varchar("title").notNull(), // 'NFL MVP', 'Super Bowl Winner'
  description: text("description"),
  playerId: varchar("player_id").references(() => players.id),
  teamId: varchar("team_id").references(() => teams.id),
  market: varchar("market").notNull(), // 'MVP', 'CHAMPION', 'OVER_UNDER'
  selection: varchar("selection").notNull(), // 'Lamar Jackson', 'Ravens', 'Over 4500'
  line: varchar("line"), // For totals like 'Over 4500 yards'
  odds: integer("odds").notNull(), // American odds
  priceDecimal: decimal("price_decimal", { precision: 8, scale: 4 }).notNull(),
  edgeScore: decimal("edge_score", { precision: 5, scale: 2 }).default('0'),
  confidence: integer("confidence").default(1), // 1-5 scale
  season: varchar("season").notNull().default('2024-25'),
  expiresAt: timestamp("expires_at"), // When the bet closes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parlays = pgTable("parlays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  legCount: integer("leg_count").notNull(),
  totalOdds: integer("total_odds").notNull(),
  potentialPayout: decimal("potential_payout", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  legs: jsonb("legs").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const capperPortals = pgTable("capper_portals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  handle: varchar("handle").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  revenueShare: decimal("revenue_share", { precision: 5, scale: 2 }).default("0.15"),
  isActive: boolean("is_active").default(true),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const sportsRelations = relations(sports, ({ many }) => ({
  teams: many(teams),
  players: many(players),
  games: many(games),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  sport: one(sports, { fields: [teams.sportId], references: [sports.id] }),
  players: many(players),
  homeGames: many(games, { relationName: "homeTeam" }),
  awayGames: many(games, { relationName: "awayTeam" }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, { fields: [players.teamId], references: [teams.id] }),
  sport: one(sports, { fields: [players.sportId], references: [sports.id] }),
  stats: many(playerStats),
  edges: many(playerEdges),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  sport: one(sports, { fields: [games.sportId], references: [sports.id] }),
  homeTeam: one(teams, { fields: [games.homeTeamId], references: [teams.id], relationName: "homeTeam" }),
  awayTeam: one(teams, { fields: [games.awayTeamId], references: [teams.id], relationName: "awayTeam" }),
  playerStats: many(playerStats),
  playerEdges: many(playerEdges),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertPlayerSchema = createInsertSchema(players);
export const insertGameSchema = createInsertSchema(games);
export const insertPlayerEdgeSchema = createInsertSchema(playerEdges);

export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Sport = typeof sports.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Game = typeof games.$inferSelect;
export type PlayerStats = typeof playerStats.$inferSelect;
export type PlayerEdge = typeof playerEdges.$inferSelect;
export type AttackBoard = typeof attackBoard.$inferSelect;
export type Parlay = typeof parlays.$inferSelect;
export type CapperPortal = typeof capperPortals.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPlayerEdge = z.infer<typeof insertPlayerEdgeSchema>;

export type Future = typeof futures.$inferSelect;
export type InsertFuture = typeof futures.$inferInsert;
