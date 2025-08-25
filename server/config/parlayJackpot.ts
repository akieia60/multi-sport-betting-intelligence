export const JACKPOT_TIERS = {
  '50k': 50_000,
  '100k': 100_000,
  '1M': 1_000_000,
} as const;

export const PARLAY_CONSTRAINTS = {
  minLegs: 6,
  maxLegs: 12,
  minOdds: 1.3,   // don't allow micro-odds
  maxOdds: 3.5,   // avoid wild longshots
  minEdge: 55,    // only use edges our model likes
  maxPerTeam: 1,  // no stacking same team/market
};

export type JackpotTier = keyof typeof JACKPOT_TIERS;