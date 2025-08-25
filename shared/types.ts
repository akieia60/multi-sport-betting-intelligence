export type Market =
  | 'TEAM_MONEYLINE' | 'TEAM_SPREAD' | 'TEAM_TOTAL'
  | 'PLAYER_TD' | 'PLAYER_HR' | 'PLAYER_RBI' | 'PLAYER_HITS'
  | 'PLAYER_POINTS' | 'PLAYER_ASSISTS' | 'PLAYER_REBOUNDS'
  | 'PLAYER_PASSING_YARDS' | 'PLAYER_RUSHING_YARDS' | 'PLAYER_RECEIVING_YARDS'
  | 'PLAYER_2PLUS_TD' | 'PLAYER_4PLUS_RBI' | 'PLAYER_400PLUS_PASS_YDS';

export type PickLeg = {
  id: string;
  league: 'MLB'|'NFL'|'NBA';
  gameId: string;
  teamId?: string;
  playerId?: string;
  market: Market;
  selection: string;          // e.g., "ATL ML", "Acuna Jr. o1.5 TB"
  priceAmerican: number;
  priceDecimal: number;       // used for payout math
  kickOrFirstPitchISO: string;
  confidence: number;         // 0–100
  reason: string;             // short justification (1–3 sentences)
  riskFlags?: string[];       // ['injury','rain','back-to-back'] → exclude
  source: 'model'|'analyst'|'mixed';
  createdAt: string;
};