import { JACKPOT_TIERS, PARLAY_CONSTRAINTS } from '../config/parlayJackpot';
import type { JackpotTier } from '../config/parlayJackpot';

export type Leg = {
  id: string;
  gameId: string;
  market: 'H2H' | 'Total' | 'Prop';
  selection: string;  // e.g., "Acuna Jr. o1.5 TB"
  priceDecimal: number; // e.g., 2.05  (American +105)
  edgeScore: number;    // our model advantage, 0–100
  startTime: string;    // ISO
  riskFlags?: string[]; // e.g., ['probable_injury','rain']
  playerName?: string;
  teamName?: string;
  propType?: string;
  line?: string;
};

type BuildInput = {
  tier: JackpotTier;   // '50k' | '100k' | '1M'
  stake: number;                      // e.g., 10, 25, 100
  legs: Leg[];                        // prefiltered (today only, not started)
  maxCandidates?: number;             // default 20
};

export type Candidate = {
  legIds: string[];
  payout: number;
  decimalProduct: number;
  estHitProb: number;   // (optional) product of modeled hit probs
  legs: Leg[];
};

export function buildJackpotCandidates({
  tier, stake, legs, maxCandidates = 20,
}: BuildInput): Candidate[] {
  const T = JACKPOT_TIERS[tier];
  const C = PARLAY_CONSTRAINTS;

  // 1) filter for quality + valid odds
  const pool = legs
    .filter(L => L.priceDecimal >= C.minOdds && L.priceDecimal <= C.maxOdds)
    .filter(L => (L.edgeScore ?? 0) >= C.minEdge)
    .filter(L => !L.riskFlags || L.riskFlags.length === 0) // exclude risk flags
    .sort((a,b) => (b.edgeScore - a.edgeScore) || (b.priceDecimal - a.priceDecimal));

  if (pool.length < C.minLegs) {
    console.log(`Insufficient quality legs: ${pool.length} < ${C.minLegs}`);
    return [];
  }

  const out: Candidate[] = [];
  const usedKeys = new Set<string>();

  // 2) greedy + random mix to assemble many candidate combos
  for (let attempt = 0; attempt < 2000 && out.length < maxCandidates; attempt++) {
    const pickCount = randInt(C.minLegs, C.maxLegs);
    const chosen: Leg[] = [];
    const usedGames = new Set<string>();

    // seed with top edges, then diversify randomly
    const seed = Math.min(3, pickCount);
    for (let i = 0; i < seed && i < pool.length; i++) {
      const L = pool[i];
      if (L && !usedGames.has(L.gameId)) {
        chosen.push(L); 
        usedGames.add(L.gameId);
      }
    }
    
    // fill remaining with random high-edge legs respecting constraints
    let safety = 0;
    while (chosen.length < pickCount && safety++ < 2000) {
      const idx = Math.floor(Math.random() * Math.min(pool.length, 200));
      const L = pool[idx];
      if (!L) continue;
      if (usedGames.has(L.gameId)) continue;
      chosen.push(L); 
      usedGames.add(L.gameId);
    }

    if (chosen.length < C.minLegs) continue;

    const decimalProduct = chosen.reduce((p, l) => p * l.priceDecimal, 1);
    const payout = stake * decimalProduct;
    if (payout < T) continue;

    // de-dupe by sorted leg ids
    const key = chosen.map(l => l.id).sort().join('|');
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);

    out.push({
      legIds: chosen.map(l => l.id),
      payout: Math.round(payout * 100) / 100,
      decimalProduct,
      estHitProb: estimateParlayProb(chosen),
      legs: chosen,
    });
  }

  // 3) sort: highest est EV first (or highest edge density)
  return out.sort((a,b) => (b.estHitProb * b.payout) - (a.estHitProb * a.payout));
}

function estimateParlayProb(legs: Leg[]): number {
  // Convert edge score to estimated probability
  const toProb = (edgeScore: number) => Math.min(0.8, 0.5 + (edgeScore - 50) * 0.01);
  return legs.reduce((p, l) => p * toProb(l.edgeScore ?? 50), 1);
}

function randInt(a: number, b: number): number { 
  return a + Math.floor(Math.random() * (b - a + 1)); 
}

// Convert American odds to decimal
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

// Convert our edge data to Leg format
export function edgeToLeg(edge: any, gameData: any): Leg {
  const priceDecimal = americanToDecimal(edge.odds || -110); // Default to -110 if no odds
  
  return {
    id: edge.id,
    gameId: edge.gameId,
    market: edge.bestPropType?.includes('Total') ? 'Total' : 'Prop',
    selection: `${edge.playerId} ${edge.bestPropType} ${edge.bestPropLine}`,
    priceDecimal,
    edgeScore: parseFloat(edge.edgeScore),
    startTime: gameData?.gameDate || new Date().toISOString(),
    playerName: `Player ${edge.playerId?.split('-')?.pop()}`,
    teamName: gameData?.homeTeam?.name || 'Unknown Team',
    propType: edge.bestPropType,
    line: edge.bestPropLine,
  };
}