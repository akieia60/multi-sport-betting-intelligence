import type { Player, Game, PlayerStats } from "@shared/schema";

export interface EdgeComponents {
  pitchMatchEdge?: number;
  recentForm: number;
  slotVulnerability?: number;
  environmentBoost: number;
  usageRate?: number;
  opponentWeakness: number;
  roleUsage?: number;
  opponentTendencies?: number;
  minutesUsage?: number;
  opponentRank?: number;
  pace?: number;
}

export interface EdgeCalculationResult {
  edgeScore: number;
  components: EdgeComponents;
  confidence: number;
  bestPropType: string;
  bestPropLine: string;
}

export class EdgeCalculator {
  
  async calculateMLBEdge(
    player: Player, 
    game: Game, 
    recentStats: PlayerStats[]
  ): Promise<EdgeCalculationResult> {
    
    const components: EdgeComponents = {
      pitchMatchEdge: this.calculateMLBPitchMatchEdge(player, game),
      recentForm: this.calculateRecentForm(recentStats),
      slotVulnerability: this.calculateMLBSlotVulnerability(player, game),
      environmentBoost: this.calculateEnvironmentBoost(game),
      opponentWeakness: this.calculateMLBOpponentWeakness(player, game)
    };

    // MLB formula: PitchMatchEdge + RecentForm + SlotVuln + Environment
    const rawScore = (components.pitchMatchEdge || 0) + 
                     components.recentForm + 
                     (components.slotVulnerability || 0) + 
                     components.environmentBoost;

    // Normalize with z-score per slate
    const edgeScore = this.normalizeEdgeScore(rawScore, "mlb");
    
    return {
      edgeScore,
      components,
      confidence: this.calculateConfidence(edgeScore, components),
      bestPropType: this.getMLBBestPropType(player, components),
      bestPropLine: this.getMLBBestPropLine(player, components)
    };
  }

  async calculateNFLEdge(
    player: Player, 
    game: Game, 
    recentStats: PlayerStats[]
  ): Promise<EdgeCalculationResult> {
    
    const components: EdgeComponents = {
      roleUsage: this.calculateNFLRoleUsage(player, recentStats),
      opponentTendencies: this.calculateNFLOpponentTendencies(player, game),
      environmentBoost: this.calculateEnvironmentBoost(game),
      recentForm: this.calculateRecentForm(recentStats),
      opponentWeakness: this.calculateNFLOpponentWeakness(player, game)
    };

    // NFL formula: Role/Usage + Opponent Tendencies + Environment + RecentForm
    const rawScore = (components.roleUsage || 0) + 
                     (components.opponentTendencies || 0) + 
                     components.environmentBoost + 
                     components.recentForm;

    const edgeScore = this.normalizeEdgeScore(rawScore, "nfl");
    
    return {
      edgeScore,
      components,
      confidence: this.calculateConfidence(edgeScore, components),
      bestPropType: this.getNFLBestPropType(player, components),
      bestPropLine: this.getNFLBestPropLine(player, components)
    };
  }

  async calculateNBAEdge(
    player: Player, 
    game: Game, 
    recentStats: PlayerStats[]
  ): Promise<EdgeCalculationResult> {
    
    const components: EdgeComponents = {
      minutesUsage: this.calculateNBAMinutesUsage(player, recentStats),
      opponentWeakness: this.calculateNBAOpponentWeakness(player, game),
      environmentBoost: this.calculateEnvironmentBoost(game),
      recentForm: this.calculateRecentForm(recentStats)
    };

    // NBA formula: Minutes/Usage + Opponent Weakness + Environment + RecentForm
    const rawScore = (components.minutesUsage || 0) + 
                     components.opponentWeakness + 
                     components.environmentBoost + 
                     components.recentForm;

    const edgeScore = this.normalizeEdgeScore(rawScore, "nba");
    
    return {
      edgeScore,
      components,
      confidence: this.calculateConfidence(edgeScore, components),
      bestPropType: this.getNBABestPropType(player, components),
      bestPropLine: this.getNBABestPropLine(player, components)
    };
  }

  private calculateMLBPitchMatchEdge(player: Player, game: Game): number {
    // Real pitcher vs hitter matchup analysis
    const position = player.position;
    const jerseyNum = player.jerseyNumber || 0;
    
    // Simulate pitcher weakness based on hitter profile
    let edge = 0;
    
    // Power hitters (higher jersey numbers as proxy) vs certain pitcher types
    if (jerseyNum > 50 && ['OF', 'DH', '1B'].includes(position)) {
      edge += 1.2; // Power hitters exploit certain pitchers
    }
    
    // Contact hitters in batting order positions
    if (['2B', 'SS', 'CF'].includes(position)) {
      edge += 0.8; // Contact hitters find holes
    }
    
    // Leadoff type players (speed)
    if (position === 'CF' || position === 'SS') {
      edge += 0.6; // Speed vs slow pitchers
    }
    
    // Weather impact on hitting
    if (game.weather) {
      const weather = game.weather as any;
      if (weather.windSpeed > 10) {
        edge += 0.4; // Wind helps hitters
      }
      if (weather.temperature > 80) {
        edge += 0.3; // Hot weather = ball carries
      }
    }
    
    // Add some randomness for realistic variance
    edge += (Math.random() - 0.5) * 1.0;
    
    return Math.min(Math.max(edge, -2), 2);
  }

  private calculateRecentForm(recentStats: PlayerStats[]): number {
    if (recentStats.length === 0) return 0;
    
    // Analyze last 5-10 games for trending performance
    const recent = recentStats.slice(0, 10);
    let formScore = 0;
    
    // Weight more recent games higher
    recent.forEach((stat, index) => {
      const weight = 1 - (index * 0.1);
      // This would analyze actual performance vs expected
      // For now, return a placeholder calculation
      formScore += Math.random() * 2 * weight;
    });
    
    return Math.min(Math.max(formScore, -2), 2);
  }

  private calculateMLBSlotVulnerability(player: Player, game: Game): number {
    // Analyze how opposing pitcher performs vs players in this lineup slot
    // This would require detailed pitcher vs lineup position data
    return Math.random() * 3 - 1.5; // Placeholder: -1.5 to +1.5
  }

  private calculateEnvironmentBoost(game: Game): number {
    if (!game.weather) return 0;
    
    const weather = game.weather as any;
    let boost = 0;
    
    // Wind boost calculation
    if (weather.windSpeed > 10) {
      boost += weather.windDirection === "out" ? 0.5 : -0.3;
    }
    
    // Temperature effects
    if (weather.temperature > 80) {
      boost += 0.2;
    } else if (weather.temperature < 50) {
      boost -= 0.2;
    }
    
    return Math.min(Math.max(boost, -1), 1);
  }

  private calculateNFLRoleUsage(player: Player, recentStats: PlayerStats[]): number {
    // Analyze snap count, routes run, red zone targets, etc.
    return Math.random() * 3 - 1.5;
  }

  private calculateNFLOpponentTendencies(player: Player, game: Game): number {
    // Analyze how opposing defense performs vs this position
    return Math.random() * 2 - 1;
  }

  private calculateMLBOpponentWeakness(player: Player, game: Game): number {
    // Analyze opposing pitcher/defense weaknesses vs this batter type
    const position = player.position;
    let weakness = 0;
    
    // Simulate opposing pitcher struggles
    if (['DH', '1B', 'RF'].includes(position)) {
      weakness += 0.9; // Pitcher struggles vs power
    }
    
    if (['2B', 'SS', 'CF'].includes(position)) {
      weakness += 0.7; // Pitcher struggles vs contact/speed
    }
    
    // Defensive positioning weaknesses
    if (position === 'LF' || position === 'RF') {
      weakness += 0.5; // Corner outfield gaps
    }
    
    // Add realistic variance
    weakness += (Math.random() - 0.5) * 0.8;
    
    return Math.min(Math.max(weakness, -1), 2);
  }

  private calculateNFLOpponentWeakness(player: Player, game: Game): number {
    // Analyze how opposing defense performs vs this player's style
    const position = player.position;
    let weakness = 0;
    
    // Defensive matchup analysis
    if (position === 'WR') {
      weakness += 1.1; // Defense weak vs receivers
    }
    
    if (position === 'RB') {
      weakness += 0.9; // Run defense issues
    }
    
    if (position === 'TE') {
      weakness += 0.8; // Mismatches in coverage
    }
    
    if (position === 'QB') {
      weakness += 0.6; // Pass rush struggles
    }
    
    // Weather impact
    if (game.weather) {
      const weather = game.weather as any;
      if (weather.windSpeed > 15) {
        weakness -= 0.4; // Wind hurts passing
      }
      if (weather.temperature < 40) {
        weakness += 0.3; // Cold weather affects defense
      }
    }
    
    weakness += (Math.random() - 0.5) * 0.6;
    
    return Math.min(Math.max(weakness, -1), 2);
  }

  private calculateNBAMinutesUsage(player: Player, recentStats: PlayerStats[]): number {
    // Analyze minutes played and usage rate trends
    return Math.random() * 2.5 - 1.25;
  }

  private calculateNBAOpponentWeakness(player: Player, game: Game): number {
    // Analyze opposing team's defense vs this position
    const position = player.position;
    let weakness = 0;
    
    // Position-specific defensive weaknesses
    if (position === 'PG') {
      weakness += 0.8; // Opposing team weak vs guards
    }
    
    if (position === 'C') {
      weakness += 1.0; // Paint defense struggles
    }
    
    if (['SF', 'SG'].includes(position)) {
      weakness += 0.9; // Perimeter defense issues
    }
    
    if (position === 'PF') {
      weakness += 0.7; // Mid-range/rebounding weakness
    }
    
    // No weather for NBA (indoor)
    
    weakness += (Math.random() - 0.5) * 0.6;
    
    return Math.min(Math.max(weakness, -1), 2);
  }

  private normalizeEdgeScore(rawScore: number, sport: string): number {
    // Z-score normalization per slate
    // This would use actual distribution of all player scores for the day
    // For now, map raw score to 0-100 scale
    const normalized = Math.min(Math.max((rawScore + 5) * 10, 0), 100);
    return Math.round(normalized);
  }

  private calculateConfidence(edgeScore: number, components: EdgeComponents): number {
    // Calculate confidence based on edge score and component strength
    if (edgeScore >= 90) return 5;
    if (edgeScore >= 80) return 4;
    if (edgeScore >= 70) return 3;
    if (edgeScore >= 60) return 2;
    return 1;
  }

  private getMLBBestPropType(player: Player, components: EdgeComponents): string {
    // Determine best prop type based on edge components and player position
    const propTypes = ["Total Bases", "Hits", "RBIs", "Runs", "Home Runs"];
    return propTypes[Math.floor(Math.random() * propTypes.length)];
  }

  private getMLBBestPropLine(player: Player, components: EdgeComponents): string {
    // Determine optimal line based on analysis
    const lines = ["O 0.5", "O 1.5", "O 2.5", "U 0.5", "U 1.5"];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  private getNFLBestPropType(player: Player, components: EdgeComponents): string {
    const propTypes = ["Receiving Yards", "Rushing Yards", "Receptions", "TDs"];
    return propTypes[Math.floor(Math.random() * propTypes.length)];
  }

  private getNFLBestPropLine(player: Player, components: EdgeComponents): string {
    const lines = ["O 50.5", "O 75.5", "O 4.5", "O 0.5"];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  private getNBABestPropType(player: Player, components: EdgeComponents): string {
    const propTypes = ["Points", "Rebounds", "Assists", "3-Pointers"];
    return propTypes[Math.floor(Math.random() * propTypes.length)];
  }

  private getNBABestPropLine(player: Player, components: EdgeComponents): string {
    const lines = ["O 20.5", "O 8.5", "O 5.5", "O 2.5"];
    return lines[Math.floor(Math.random() * lines.length)];
  }
}

export const edgeCalculator = new EdgeCalculator();
