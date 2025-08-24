import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sportsDataService } from "./services/sportsData";
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
      const slateData = await sportsDataService.getSlateSnapshot(sport);
      res.json(slateData);
    } catch (error) {
      console.error("Error fetching slate:", error);
      res.status(500).json({ message: "Failed to fetch slate data" });
    }
  });

  app.get('/api/:sport/games', async (req, res) => {
    try {
      const { sport } = req.params;
      const games = await storage.getTodaysGames(sport);
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
      
      if (sport) {
        await sportsDataService.refreshSportData(sport);
      } else {
        // Refresh all sports
        const sports = await storage.getSports();
        for (const sportData of sports) {
          await sportsDataService.refreshSportData(sportData.id);
        }
      }
      
      res.json({ 
        message: "Data refresh completed",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });

  // Sports metadata
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await storage.getSports();
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
      const teams = await storage.getTeams(sport);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
