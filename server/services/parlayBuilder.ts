import { storage } from "../storage";
import type { PlayerEdge, Parlay } from "@shared/schema";

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

export interface ParlayConfiguration {
  legCount: 4 | 6 | 8;
  targetPayout: number;
  riskTolerance: "conservative" | "balanced" | "aggressive";
  minConfidence: number;
  maxCorrelation: number;
}

export interface GeneratedParlay {
  legs: ParlayLeg[];
  totalOdds: number;
  potentialPayout: number;
  combinedConfidence: number;
  expectedValue: number;
  correlationRisk: number;
}

export class ParlayBuilder {
  
  async generateParlay(
    sportId: string, 
    config: ParlayConfiguration,
    userId?: string
  ): Promise<GeneratedParlay> {
    
    // Get eligible player edges for today's slate
    const eligibleEdges = await this.getEligibleEdges(sportId, config);
    
    // Build parlay using optimization algorithm
    const selectedLegs = await this.optimizeParlay(eligibleEdges, config);
    
    // Calculate parlay metrics
    const parlay = this.calculateParlayMetrics(selectedLegs, config);
    
    // Save parlay if user provided
    if (userId) {
      await this.saveParlay(userId, sportId, parlay, config);
    }
    
    return parlay;
  }

  async generateMultipleParlays(
    sportId: string,
    userId?: string
  ): Promise<{
    conservative: GeneratedParlay;
    balanced: GeneratedParlay;
    aggressive: GeneratedParlay;
  }> {
    
    const conservative = await this.generateParlay(sportId, {
      legCount: 4,
      targetPayout: 50000,
      riskTolerance: "conservative",
      minConfidence: 4,
      maxCorrelation: 0.3
    }, userId);

    const balanced = await this.generateParlay(sportId, {
      legCount: 6,
      targetPayout: 100000,
      riskTolerance: "balanced", 
      minConfidence: 3,
      maxCorrelation: 0.5
    }, userId);

    const aggressive = await this.generateParlay(sportId, {
      legCount: 8,
      targetPayout: 1000000,
      riskTolerance: "aggressive",
      minConfidence: 2,
      maxCorrelation: 0.7
    }, userId);

    return { conservative, balanced, aggressive };
  }

  private async getEligibleEdges(
    sportId: string, 
    config: ParlayConfiguration
  ): Promise<PlayerEdge[]> {
    
    const allEdges = await storage.getPlayerEdges(undefined, sportId);
    
    // Filter by minimum confidence
    return allEdges.filter(edge => 
      edge.confidence >= config.minConfidence &&
      edge.edgeScore && parseFloat(edge.edgeScore) >= 60
    );
  }

  private async optimizeParlay(
    edges: PlayerEdge[], 
    config: ParlayConfiguration
  ): Promise<ParlayLeg[]> {
    
    if (edges.length < config.legCount) {
      throw new Error(`Insufficient qualifying edges for ${config.legCount}-leg parlay`);
    }

    // Sort by edge score and confidence
    const sortedEdges = edges.sort((a, b) => {
      const scoreA = parseFloat(a.edgeScore || "0");
      const scoreB = parseFloat(b.edgeScore || "0");
      return scoreB - scoreA;
    });

    const selectedLegs: ParlayLeg[] = [];
    const usedPlayers = new Set<string>();
    const usedTeams = new Set<string>();

    for (const edge of sortedEdges) {
      if (selectedLegs.length >= config.legCount) break;
      
      // Avoid same player twice
      if (usedPlayers.has(edge.playerId)) continue;
      
      // Get player and team info for correlation checking
      const player = await storage.getPlayer(edge.playerId);
      if (!player) continue;
      
      // Limit same team selections based on risk tolerance
      const maxSameTeam = config.riskTolerance === "conservative" ? 1 : 
                          config.riskTolerance === "balanced" ? 2 : 3;
      
      if (usedTeams.has(player.teamId)) {
        const sameTeamCount = selectedLegs.filter(leg => {
          // This would need to lookup team for each leg
          return false; // Simplified for now
        }).length;
        
        if (sameTeamCount >= maxSameTeam) continue;
      }

      // Calculate implied odds based on edge and confidence
      const impliedOdds = this.calculateImpliedOdds(edge);
      
      selectedLegs.push({
        playerId: edge.playerId,
        playerName: player.name,
        team: player.teamId,
        propType: edge.bestPropType || "Points",
        propLine: edge.bestPropLine || "O 20.5",
        odds: impliedOdds,
        confidence: edge.confidence,
        edgeScore: parseFloat(edge.edgeScore || "0")
      });

      usedPlayers.add(edge.playerId);
      usedTeams.add(player.teamId);
    }

    if (selectedLegs.length < config.legCount) {
      throw new Error(`Could only find ${selectedLegs.length} qualifying legs`);
    }

    return selectedLegs;
  }

  private calculateImpliedOdds(edge: PlayerEdge): number {
    // Convert edge score and confidence to implied odds
    const edgeScore = parseFloat(edge.edgeScore || "0");
    const confidence = edge.confidence;
    
    // Higher edge score and confidence = better odds
    // This is a simplified calculation
    const baseOdds = 100 + (edgeScore * 2) + (confidence * 20);
    return Math.round(baseOdds);
  }

  private calculateParlayMetrics(
    legs: ParlayLeg[], 
    config: ParlayConfiguration
  ): GeneratedParlay {
    
    // Calculate total odds (multiplicative)
    const totalOdds = legs.reduce((acc, leg) => {
      const decimal = this.americanToDecimal(leg.odds);
      return acc * decimal;
    }, 1);

    const americanOdds = this.decimalToAmerican(totalOdds);
    
    // Calculate potential payout (assuming $100 bet)
    const potentialPayout = totalOdds * 100;
    
    // Calculate combined confidence (geometric mean)
    const confidenceProduct = legs.reduce((acc, leg) => acc * (leg.confidence / 5), 1);
    const combinedConfidence = Math.pow(confidenceProduct, 1 / legs.length) * 100;
    
    // Calculate expected value
    const impliedProbability = legs.reduce((acc, leg) => {
      const legProb = (leg.confidence / 5) * 0.9; // Adjust for house edge
      return acc * legProb;
    }, 1);
    
    const expectedValue = (impliedProbability * potentialPayout) - 100;
    
    // Calculate correlation risk (simplified)
    const sameTeamCount = new Set(legs.map(leg => leg.team)).size;
    const correlationRisk = 1 - (sameTeamCount / legs.length);

    return {
      legs,
      totalOdds: americanOdds,
      potentialPayout,
      combinedConfidence: Math.round(combinedConfidence),
      expectedValue,
      correlationRisk
    };
  }

  private americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }

  private decimalToAmerican(decimal: number): number {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100);
    } else {
      return Math.round(-100 / (decimal - 1));
    }
  }

  private async saveParlay(
    userId: string,
    sportId: string, 
    parlay: GeneratedParlay,
    config: ParlayConfiguration
  ): Promise<Parlay> {
    
    const parlayData = {
      userId,
      sportId,
      legCount: config.legCount,
      totalOdds: parlay.totalOdds,
      potentialPayout: parlay.potentialPayout.toString(),
      confidence: parlay.combinedConfidence.toString(),
      legs: parlay.legs
    };

    return await storage.createParlay(parlayData);
  }

  async suggestSwaps(
    originalParlay: GeneratedParlay,
    sportId: string
  ): Promise<ParlayLeg[]> {
    
    // Get alternative legs with similar or better metrics
    const allEdges = await storage.getPlayerEdges(undefined, sportId);
    const usedPlayerIds = new Set(originalParlay.legs.map(leg => leg.playerId));
    
    const alternatives: ParlayLeg[] = [];
    
    for (const edge of allEdges) {
      if (usedPlayerIds.has(edge.playerId)) continue;
      if (edge.confidence < 3) continue;
      
      const player = await storage.getPlayer(edge.playerId);
      if (!player) continue;
      
      const impliedOdds = this.calculateImpliedOdds(edge);
      
      alternatives.push({
        playerId: edge.playerId,
        playerName: player.name,
        team: player.teamId,
        propType: edge.bestPropType || "Points",
        propLine: edge.bestPropLine || "O 20.5",
        odds: impliedOdds,
        confidence: edge.confidence,
        edgeScore: parseFloat(edge.edgeScore || "0")
      });
    }

    // Return top 5 alternatives sorted by edge score
    return alternatives
      .sort((a, b) => b.edgeScore - a.edgeScore)
      .slice(0, 5);
  }
}

export const parlayBuilder = new ParlayBuilder();
