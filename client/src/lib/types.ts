export interface Sport {
  id: string;
  name: string;
  displayName: string;
  colorCode: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  sportId: string;
  name: string;
  abbreviation: string;
  city: string;
  division?: string;
  conference?: string;
  logoUrl?: string;
}

export interface Player {
  id: string;
  teamId: string;
  sportId: string;
  name: string;
  position: string;
  jerseyNumber?: number;
  isActive: boolean;
}

export interface Game {
  id: string;
  sportId: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: string;
  venue?: string;
  weather?: WeatherData;
  gameTotal?: string;
  isCompleted: boolean;
  lastUpdated: string;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  humidity: number;
}

export interface PlayerEdge {
  id: string;
  playerId: string;
  gameId: string;
  edgeScore: string;
  pitchMatchEdge?: string;
  recentForm: string;
  slotVulnerability?: string;
  environmentBoost: string;
  usageRate?: string;
  opponentWeakness: string;
  confidence: number;
  bestPropType?: string;
  bestPropLine?: string;
  calculatedAt: string;
}

export interface PlayerWithEdge extends Player {
  edge?: PlayerEdge;
  team?: Team;
  initials?: string;
}

export interface GameWithTeams extends Game {
  homeTeam?: Team;
  awayTeam?: Team;
  playerEdges?: PlayerEdge[];
}

export interface SlateSnapshot {
  games: number;
  totalEdges: number;
  eliteCount: number;
  highConfidenceCount: number;
  lastUpdated: string;
}

export interface ParlayLeg {
  playerId: string;
  playerName: string;
  team: string;
  propType: string;
  propLine: string;
  odds: number;
  confidence: number;
  edgeScore: number;
}

export interface GeneratedParlay {
  legs: ParlayLeg[];
  totalOdds: number;
  potentialPayout: number;
  combinedConfidence: number;
  expectedValue: number;
  correlationRisk: number;
}

export interface AttackBoardEntry {
  id: string;
  sportId: string;
  opponentId: string;
  opponentType: string;
  exploitabilityScore: string;
  weaknesses: any;
  targetCount: number;
  lastUpdated: string;
}

export type SubscriptionTier = "free" | "standard" | "vip";

export interface FilterState {
  usageRate: string;
  opponentRank: string;
  venue: string;
  hotStreak: boolean;
  propType: string;
  confidence: number;
}
