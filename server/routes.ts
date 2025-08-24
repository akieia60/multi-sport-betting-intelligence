import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sportsDataService } from "./services/sportsDataService";
import { dataIngestionService } from "./services/dataIngestionService";
import { edgeCalculator } from "./services/edgeCalculator";
import { parlayBuilder } from "./services/parlayBuilder";
import { z } from "zod";

const parlayGenerateSchema = z.object({
  legCount: z.number().min(4).max(8),
  riskTolerance: z.enum(["conservative", "balanced", "aggressive"]),
  minConfidence: z.number().min(1).max(5).optional().default(3)
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Sports data routes
  app.get('/api/:sport/slate', async (req, res) => {
    try {
      const { sport } = req.params;
      // Get today's games and edges count
      const games = await storage.getTodaysGames(sport);
      const edges = await storage.getPlayerEdges(undefined, sport);
      const elitePlayers = await storage.getElitePlayers(sport, 20);
      
      const slateData = {
        games: games.length,
        totalEdges: edges.length,
        eliteCount: elitePlayers.length,
        highConfidenceProps: edges.filter(e => e.confidence >= 4).length,
        avgEdgeScore: edges.length ? Math.round(edges.reduce((acc, e) => acc + parseInt(e.edgeScore), 0) / edges.length) : 0,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(slateData);
    } catch (error) {
      console.error("Error fetching slate:", error);
      res.status(500).json({ message: "Failed to fetch slate data" });
    }
  });

  app.get('/api/:sport/games', async (req, res) => {
    try {
      const { sport } = req.params;
      let games = await storage.getTodaysGames(sport);
      
      // If no games in database, try to fetch from API
      if (games.length === 0) {
        try {
          switch (sport) {
            case "mlb":
              games = await sportsDataService.getMLBGames();
              break;
            case "nfl":
              games = await sportsDataService.getNFLGames();
              break;
            case "nba":
              games = await sportsDataService.getNBAGames();
              break;
          }
          
          // Store games in database for next time
          for (const game of games) {
            try {
              await storage.createGame({
                ...game,
                weather: game.weather as any
              });
            } catch (error) {
              // Game might already exist
            }
          }
        } catch (apiError) {
          console.error(`Error fetching ${sport} games from API:`, apiError);
        }
      }
      
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/:sport/game/:id', async (req, res) => {
    try {
      const { sport, id } = req.params;
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Get player edges for this game
      const edges = await storage.getPlayerEdges(id);
      
      res.json({
        game,
        playerEdges: edges
      });
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game data" });
    }
  });

  app.get('/api/:sport/elite-players', async (req, res) => {
    try {
      const { sport } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const elitePlayers = await storage.getElitePlayers(sport, limit);
      res.json(elitePlayers);
    } catch (error) {
      console.error("Error fetching elite players:", error);
      res.status(500).json({ message: "Failed to fetch elite players" });
    }
  });

  app.get('/api/:sport/attack-board', async (req, res) => {
    try {
      const { sport } = req.params;
      const attackBoard = await storage.getAttackBoard(sport);
      res.json(attackBoard);
    } catch (error) {
      console.error("Error fetching attack board:", error);
      res.status(500).json({ message: "Failed to fetch attack board" });
    }
  });

  app.get('/api/:sport/props/suggest', async (req, res) => {
    try {
      const { sport } = req.params;
      // This would analyze best prop types for current slate
      res.json({
        suggestedProps: [
          { type: "Total Bases", confidence: 85, count: 12 },
          { type: "Hits", confidence: 78, count: 18 },
          { type: "RBIs", confidence: 72, count: 15 }
        ]
      });
    } catch (error) {
      console.error("Error fetching prop suggestions:", error);
      res.status(500).json({ message: "Failed to fetch prop suggestions" });
    }
  });

  // Player routes
  app.get('/api/player/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      const stats = await storage.getPlayerStats(id);
      const edges = await storage.getPlayerEdges(undefined, player.sportId);
      const playerEdge = edges.find(e => e.playerId === id);
      
      res.json({
        player,
        recentStats: stats.slice(0, 10),
        currentEdge: playerEdge
      });
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Failed to fetch player data" });
    }
  });

  // Parlay routes
  app.post('/api/:sport/parlay/generate', async (req, res) => {
    try {
      const { sport } = req.params;
      const validatedData = parlayGenerateSchema.parse(req.body);
      
      const config = {
        legCount: validatedData.legCount as 4 | 6 | 8,
        targetPayout: validatedData.legCount === 4 ? 50000 : 
                      validatedData.legCount === 6 ? 100000 : 1000000,
        riskTolerance: validatedData.riskTolerance,
        minConfidence: validatedData.minConfidence,
        maxCorrelation: 0.5
      };
      
      const parlay = await parlayBuilder.generateParlay(sport, config);
      res.json(parlay);
    } catch (error) {
      console.error("Error generating parlay:", error);
      res.status(500).json({ message: "Failed to generate parlay" });
    }
  });

  app.post('/api/:sport/parlay/generate-multiple', async (req, res) => {
    try {
      const { sport } = req.params;
      const parlays = await parlayBuilder.generateMultipleParlays(sport);
      res.json(parlays);
    } catch (error) {
      console.error("Error generating multiple parlays:", error);
      res.status(500).json({ message: "Failed to generate parlays" });
    }
  });

  app.post('/api/:sport/parlay/:id/swap-suggestions', async (req, res) => {
    try {
      const { sport } = req.params;
      const { originalParlay } = req.body;
      
      const suggestions = await parlayBuilder.suggestSwaps(originalParlay, sport);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting swap suggestions:", error);
      res.status(500).json({ message: "Failed to get swap suggestions" });
    }
  });

  // Data refresh routes
  app.post('/api/refresh', async (req, res) => {
    try {
      const { sport } = req.body;
      
      const result = await dataIngestionService.triggerRefresh(sport);
      
      if (result.success) {
        res.json({ 
          message: result.message,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });

  // Sports metadata
  app.get('/api/sports', async (req, res) => {
    try {
      // Return hardcoded sports for now since we don't store them in database
      const sports = [
        {
          id: "mlb",
          name: "Major League Baseball",
          displayName: "MLB",
          colorCode: "#003087",
          isActive: true
        },
        {
          id: "nfl", 
          name: "National Football League",
          displayName: "NFL",
          colorCode: "#013369",
          isActive: true
        },
        {
          id: "nba",
          name: "National Basketball Association", 
          displayName: "NBA",
          colorCode: "#C8102E",
          isActive: true
        }
      ];
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ message: "Failed to fetch sports" });
    }
  });

  // Teams
  app.get('/api/:sport/teams', async (req, res) => {
    try {
      const { sport } = req.params;
      let teams = await storage.getTeams(sport);
      
      // If no teams in database, fetch from API
      if (teams.length === 0) {
        try {
          switch (sport) {
            case "mlb":
              teams = await sportsDataService.getMLBTeams();
              break;
            case "nfl":
              teams = await sportsDataService.getNFLTeams();
              break;
            case "nba":
              teams = await sportsDataService.getNBATeams();
              break;
          }
        } catch (apiError) {
          console.error(`Error fetching ${sport} teams from API:`, apiError);
        }
      }
      
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Additional edge endpoint for specific sport
  app.get('/api/:sport/edges', async (req, res) => {
    try {
      const { sport } = req.params;
      const edges = await storage.getPlayerEdges(undefined, sport);
      res.json(edges);
    } catch (error) {
      console.error("Error fetching edges:", error);
      res.status(500).json({ message: "Failed to fetch edges" });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  // Initialize data on server start
  setTimeout(async () => {
    try {
      console.log("Initializing sports data...");
      await dataIngestionService.initializeSports();
      
      // Try to refresh data for each sport
      const sports = ["mlb", "nfl", "nba"];
      for (const sport of sports) {
        try {
          console.log(`Attempting initial data load for ${sport.toUpperCase()}...`);
          await dataIngestionService.triggerRefresh(sport);
        } catch (error) {
          console.log(`Initial ${sport} data load failed (will try again later):`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } catch (error) {
      console.error("Error during initial data setup:", error);
    }
  }, 5000); // Wait 5 seconds after server start

  const httpServer = createServer(app);
  return httpServer;
}
