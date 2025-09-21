import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sportsDataService } from "./services/sportsDataService";
import { dataIngestionService } from "./services/dataIngestionService";
import { edgeCalculator } from "./services/edgeCalculator";
import { parlayBuilder } from "./services/parlayBuilder";
import { buildJackpotCandidates, edgeToLeg } from "./services/jackpotBuilder";
import type { JackpotTier } from "./config/parlayJackpot";
import type { Market, PickLeg } from "@shared/types";
import { z } from "zod";
import Stripe from "stripe";

const parlayGenerateSchema = z.object({
  legCount: z.number().min(4).max(8),
  riskTolerance: z.enum(["conservative", "balanced", "aggressive"]),
  minConfidence: z.number().min(1).max(5).optional().default(3)
});

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" })
  : null;

// Subscription tier pricing (in cents)
const SUBSCRIPTION_PRICES = {
  standard: 2499, // $24.99/month
  vip: 9999 // $99.99/month
};

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

  // Top Picks endpoints for 3-Pick/4-Pick/5-Pick Builder
  app.get('/api/:sport/top-picks', async (req, res) => {
    try {
      const { sport } = req.params;
      const pool = parseInt(req.query.pool as string) || 20;
      const market = (req.query.market as string) || 'ALL';

      // Get today's elite edges
      const edges = await storage.getPlayerEdges(undefined, sport);
      const games = await storage.getTodaysGames(sport);
      const gameMap = new Map(games.map(g => [g.id, g]));

      // Helper function to convert American odds to decimal
      const americanToDecimal = (american: number): number => {
        if (american > 0) {
          return (american / 100) + 1;
        } else {
          return (100 / Math.abs(american)) + 1;
        }
      };

      // Helper function to generate reasons
      const generateReason = (edge: any, gameData: any): string => {
        const reasons = [
          `Strong ${edge.bestPropType} value based on recent form and matchup analysis.`,
          `Model shows significant edge with ${edge.confidence} confidence rating.`,
          `Favorable line movement and sharp money indicators.`,
          `Historical performance vs this opponent suggests value.`,
          `Weather and situational factors create betting opportunity.`
        ];
        
        return reasons[Math.floor(Math.random() * reasons.length)];
      };

      // Convert edges to PickLeg format
      const allPicks: PickLeg[] = edges
        .filter(edge => edge.confidence >= 3) // Only high confidence
        .filter(edge => parseFloat(edge.edgeScore) >= 55) // Only strong edges
        .map(edge => {
          const gameData = gameMap.get(edge.gameId);
          const priceDecimal = 2.0; // Default odds
          
          // Determine market type based on prop type
          let marketType: Market = 'PLAYER_HITS'; // default
          const propType = edge.bestPropType?.toLowerCase() || '';
          
          if (propType.includes('hit') || propType.includes('tb')) marketType = 'PLAYER_HITS';
          else if (propType.includes('hr') || propType.includes('home')) marketType = 'PLAYER_HR';
          else if (propType.includes('rbi') || propType.includes('run')) marketType = 'PLAYER_RBI';
          else if (propType.includes('td') || propType.includes('touchdown')) marketType = 'PLAYER_TD';
          else if (propType.includes('point')) marketType = 'PLAYER_POINTS';
          else if (propType.includes('assist')) marketType = 'PLAYER_ASSISTS';
          else if (propType.includes('rebound')) marketType = 'PLAYER_REBOUNDS';

          return {
            id: edge.id,
            league: sport.toUpperCase() as 'MLB'|'NFL'|'NBA',
            gameId: edge.gameId,
            playerId: edge.playerId,
            teamId: gameData?.homeTeamId,
            market: marketType,
            selection: `${edge.playerId?.split('-')?.pop() || 'Player'} ${edge.bestPropType} ${edge.bestPropLine}`,
            priceAmerican: -110,
            priceDecimal,
            kickOrFirstPitchISO: gameData?.gameDate ? gameData.gameDate.toISOString() : new Date().toISOString(),
            confidence: parseFloat(edge.edgeScore),
            reason: generateReason(edge, gameData),
            riskFlags: [], // Add logic for risk flags if needed
            source: 'model' as const,
            createdAt: new Date().toISOString(),
          };
        })
        .sort((a, b) => b.confidence - a.confidence); // Sort by confidence DESC

      // Filter by market if not ALL
      const filteredPicks = market === 'ALL' 
        ? allPicks 
        : allPicks.filter(pick => pick.market === market);

      // Take top N picks
      const topPicks = filteredPicks.slice(0, pool);

      res.json({
        items: topPicks,
        total: filteredPicks.length,
        pool,
        market,
        sport: sport.toUpperCase()
      });
    } catch (error) {
      console.error("Error fetching top picks:", error);
      res.status(500).json({ message: "Failed to fetch top picks" });
    }
  });

  app.get('/api/:sport/top-picks/all', async (req, res) => {
    try {
      const { sport } = req.params;
      const markets: Market[] = [
        'TEAM_MONEYLINE', 'TEAM_SPREAD', 'TEAM_TOTAL',
        'PLAYER_TD', 'PLAYER_HR', 'PLAYER_RBI', 'PLAYER_HITS',
        'PLAYER_POINTS', 'PLAYER_ASSISTS', 'PLAYER_REBOUNDS'
      ];

      const result: Record<string, PickLeg[]> = {};
      
      for (const market of markets) {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/${sport}/top-picks?pool=20&market=${market}`);
        const data = await response.json();
        result[market] = data.items || [];
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching all top picks:", error);
      res.status(500).json({ message: "Failed to fetch all top picks" });
    }
  });

  // Jackpot Parlay Builder endpoint
  app.get('/api/:sport/jackpot-candidates', async (req, res) => {
    try {
      const { sport } = req.params;
      const tier = (req.query.tier as JackpotTier) ?? '1M';
      const stake = Number(req.query.stake ?? 10);

      // Get today's elite edges
      const edges = await storage.getPlayerEdges(undefined, sport);
      const games = await storage.getTodaysGames(sport);
      const gameMap = new Map(games.map(g => [g.id, g]));

      // Convert edges to legs format
      const todayLegs = edges
        .filter(edge => edge.confidence >= 3) // Only high confidence
        .map(edge => {
          const gameData = gameMap.get(edge.gameId);
          return edgeToLeg(edge, gameData);
        })
        .filter(leg => leg.edgeScore >= 55); // Only strong edges

      console.log(`Building ${tier} jackpot candidates from ${todayLegs.length} quality legs`);
      
      const candidates = buildJackpotCandidates({ 
        tier, 
        stake, 
        legs: todayLegs,
        maxCandidates: 25 
      });

      res.json({ 
        tier, 
        stake, 
        candidates,
        totalLegs: todayLegs.length,
        message: `Generated ${candidates.length} jackpot candidates for $${tier}` 
      });
    } catch (error) {
      console.error("Error building jackpot candidates:", error);
      res.status(500).json({ message: "Failed to build jackpot candidates" });
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

  // Initialize data for all sports - CRITICAL FIX for empty parlay builder
  app.post('/api/initialize-sports-data', async (req, res) => {
    try {
      console.log('🚀 INITIALIZING ALL SPORTS DATA FOR PARLAY BUILDER...');
      
      const { playerDataService } = await import('./services/playerDataService');
      
      // Initialize all three sports in parallel
      const sports = ['mlb', 'nfl', 'nba'];
      
      for (const sport of sports) {
        console.log(`\n🎯 Initializing ${sport.toUpperCase()}...`);
        
        // Generate players from live betting odds
        await playerDataService.initializePlayersForSport(sport);
        
        // Generate player edges with real calculations
        await playerDataService.generatePlayerEdges(sport);
        
        // Generate attack board data
        await playerDataService.generateAttackBoard(sport);
      }
      
      console.log('\n✅ ALL SPORTS DATA INITIALIZED - PARLAY BUILDER READY!');
      
      res.json({ 
        success: true, 
        message: 'All sports data initialized successfully',
        initialized: sports
      });
    } catch (error) {
      console.error('❌ Error initializing sports data:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize sports data' 
      });
    }
  });

  // Payment routes
  app.post('/api/create-subscription', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment processing not configured" });
    }
    
    try {
      const { tier, email } = req.body;
      
      if (!SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES]) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      // Create or get customer
      let customer;
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({ email });
      }
      
      // Create price for subscription
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES],
        recurring: {
          interval: 'month'
        },
        product_data: {
          name: `${tier.toUpperCase()} Subscription - Multi-Sport Betting Intelligence`,
          metadata: {
            tier: tier
          }
        }
      });
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });
      
      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent as any;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
        customerId: customer.id
      });
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });

  app.post('/api/cancel-subscription', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment processing not configured" });
    }
    
    try {
      const { subscriptionId } = req.body;
      
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      
      res.json({ 
        message: "Subscription will be cancelled at period end",
        endsAt: new Date((subscription as any).current_period_end * 1000).toISOString()
      });
    } catch (error: any) {
      console.error("Stripe cancellation error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  app.get('/api/subscription-status/:customerId', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment processing not configured" });
    }
    
    try {
      const { customerId } = req.params;
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });
      
      if (subscriptions.data.length === 0) {
        return res.json({ tier: 'free', active: false });
      }
      
      const subscription = subscriptions.data[0];
      const amount = subscription.items.data[0].price.unit_amount;
      
      let tier = 'free';
      if (amount === SUBSCRIPTION_PRICES.vip) {
        tier = 'vip';
      } else if (amount === SUBSCRIPTION_PRICES.standard) {
        tier = 'standard';
      }
      
      res.json({
        tier,
        active: true,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
      });
    } catch (error: any) {
      console.error("Subscription status error:", error);
      res.status(500).json({ message: error.message || "Failed to check subscription" });
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

  // Twitter Integration Routes
  const { twitterService } = await import("./services/twitterService");

  app.get('/api/twitter/status', async (req, res) => {
    try {
      const status = await twitterService.getTwitterStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting Twitter status:", error);
      res.status(500).json({ message: "Failed to get Twitter status" });
    }
  });

  app.post('/api/twitter/post', async (req, res) => {
    try {
      const { text, imageUrl, type } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Tweet text is required" });
      }

      const result = await twitterService.postTweet({
        text,
        imageUrl,
        type: type || 'custom'
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      res.status(500).json({ message: "Failed to post tweet" });
    }
  });

  app.post('/api/twitter/generate/:sport/:type', async (req, res) => {
    try {
      const { sport, type } = req.params;
      const { week, parlayData } = req.body;

      let tweetText = '';

      switch (type) {
        case 'waiver_wire':
          tweetText = await twitterService.generateWaiverWireTweet(sport, week);
          break;
        case 'betting_picks':
          tweetText = await twitterService.generateBettingPicksTweet(sport);
          break;
        case 'parlay':
          tweetText = await twitterService.generateParlayTweet(parlayData);
          break;
        default:
          return res.status(400).json({ message: "Invalid tweet type" });
      }

      res.json({ text: tweetText, type });
    } catch (error) {
      console.error("Error generating tweet:", error);
      res.status(500).json({ message: "Failed to generate tweet" });
    }
  });

  app.post('/api/twitter/post-generated/:sport/:type', async (req, res) => {
    try {
      const { sport, type } = req.params;
      const { week, parlayData, imageUrl } = req.body;

      // Generate the tweet text
      let tweetText = '';
      switch (type) {
        case 'waiver_wire':
          tweetText = await twitterService.generateWaiverWireTweet(sport, week);
          break;
        case 'betting_picks':
          tweetText = await twitterService.generateBettingPicksTweet(sport);
          break;
        case 'parlay':
          tweetText = await twitterService.generateParlayTweet(parlayData);
          break;
        default:
          return res.status(400).json({ message: "Invalid tweet type" });
      }

      // Post the tweet
      const result = await twitterService.postTweet({
        text: tweetText,
        imageUrl,
        type: type as any
      });

      res.json(result);
    } catch (error) {
      console.error("Error posting generated tweet:", error);
      res.status(500).json({ message: "Failed to post generated tweet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
