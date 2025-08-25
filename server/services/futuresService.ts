import { storage } from "../storage";

// Sample futures data to populate the system
export const SAMPLE_FUTURES = [
  // NFL MVP
  {
    sportId: "nfl",
    category: "MVP", 
    title: "NFL MVP",
    market: "MVP",
    selection: "Lamar Jackson",
    playerId: "nfl-lamar-jackson",
    odds: 325, // +325
    priceDecimal: "4.25",
    edgeScore: 42,
    confidence: 4,
    season: "2024-25"
  },
  {
    sportId: "nfl",
    category: "MVP",
    title: "NFL MVP", 
    market: "MVP",
    selection: "Josh Allen",
    playerId: "nfl-josh-allen",
    odds: 280,
    priceDecimal: "3.80",
    edgeScore: 38,
    confidence: 4,
    season: "2024-25"
  },
  
  // Super Bowl Winner
  {
    sportId: "nfl",
    category: "CHAMPION",
    title: "Super Bowl Winner",
    market: "CHAMPION", 
    selection: "Baltimore Ravens",
    teamId: "nfl-ravens",
    odds: 650,
    priceDecimal: "7.50",
    edgeScore: 35,
    confidence: 3,
    season: "2024-25"
  },
  
  // Season Totals
  {
    sportId: "nfl",
    category: "SEASON_TOTAL",
    title: "Lamar Jackson Passing Yards",
    market: "OVER_UNDER",
    selection: "Over 3800.5 Passing Yards",
    playerId: "nfl-lamar-jackson",
    line: "3800.5",
    odds: -110,
    priceDecimal: "1.91",
    edgeScore: 55,
    confidence: 4,
    season: "2024-25"
  },
  
  // MLB Futures  
  {
    sportId: "mlb",
    category: "MVP",
    title: "AL MVP",
    market: "MVP",
    selection: "Aaron Judge", 
    playerId: "mlb-aaron-judge",
    odds: 450,
    priceDecimal: "5.50",
    edgeScore: 40,
    confidence: 3,
    season: "2024"
  },
  
  // NBA Futures
  {
    sportId: "nba", 
    category: "MVP",
    title: "NBA MVP",
    market: "MVP",
    selection: "Luka Doncic",
    playerId: "nba-luka-doncic", 
    odds: 380,
    priceDecimal: "4.80",
    edgeScore: 45,
    confidence: 4,
    season: "2024-25"
  },
  
  // Championship
  {
    sportId: "nba",
    category: "CHAMPION", 
    title: "NBA Championship",
    market: "CHAMPION",
    selection: "Boston Celtics",
    teamId: "nba-celtics",
    odds: 280,
    priceDecimal: "3.80",
    edgeScore: 32,
    confidence: 3, 
    season: "2024-25"
  }
];

export class FuturesService {
  
  async seedSampleFutures(): Promise<void> {
    console.log('🎯 Seeding sample futures data...');
    
    for (const future of SAMPLE_FUTURES) {
      try {
        await storage.createFuture({
          ...future,
          expiresAt: new Date('2025-02-15'), // All expire mid-February
          isActive: true
        });
      } catch (error) {
        console.log(`Future already exists: ${future.selection}`);
      }
    }
    
    console.log(`✅ Sample futures seeded: ${SAMPLE_FUTURES.length} items`);
  }
  
  async getFuturesForParlays(sportId: string): Promise<any[]> {
    const futures = await storage.getFutures(sportId);
    
    // Convert futures to leg format for parlay building
    return futures
      .filter((f: any) => f.isActive && parseFloat(f.edgeScore || '0') >= 25)
      .map((f: any) => ({
        id: f.id,
        gameId: f.id, // Use future ID as gameId for uniqueness
        market: 'Future',
        selection: f.selection,
        priceDecimal: parseFloat(f.priceDecimal),
        edgeScore: parseFloat(f.edgeScore || '0'),
        startTime: f.expiresAt || new Date('2025-02-15').toISOString(),
        playerName: f.selection,
        teamName: f.selection,
        propType: f.category,
        line: f.line,
        category: f.category
      }));
  }
}