export const JACKPOT_TIERS = {
  '50k': 50_000,
  '100k': 100_000,
  '1M': 1_000_000,
} as const;

export const PARLAY_CONSTRAINTS = {
  minLegs: 3,     // Allow 3-pick parlays
  maxLegs: 12,
  minOdds: 1.2,   // More lenient odds
  maxOdds: 5.0,   // Allow higher odds
  minEdge: 25,    // Much more lenient edge requirement  
  maxPerTeam: 2,  // Allow some team correlation
};

export type JackpotTier = keyof typeof JACKPOT_TIERS;