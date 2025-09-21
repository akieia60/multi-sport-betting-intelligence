import { storage } from "../storage";
import { spawn } from "child_process";
import path from "path";

export interface TwitterPostData {
  text: string;
  imageUrl?: string;
  type: 'waiver_wire' | 'betting_picks' | 'parlay' | 'custom';
}

export interface TwitterConfig {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

class TwitterService {
  private config: TwitterConfig = {
    enabled: false
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // Load Twitter configuration from environment variables
    this.config = {
      enabled: process.env.TWITTER_ENABLED === 'true',
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };
  }

  async generateWaiverWireTweet(sport: string, week?: number): Promise<string> {
    try {
      // Get top edges for waiver wire candidates
      const edges = await storage.getPlayerEdges(undefined, sport);
      const topEdges = edges
        .filter(edge => edge.confidence >= 4)
        .sort((a, b) => parseFloat(b.edgeScore) - parseFloat(a.edgeScore))
        .slice(0, 3);

      if (topEdges.length === 0) {
        return `🔥 **Top Value Plays - ${sport.toUpperCase()}** 🔥\n\nNo high-confidence plays available right now.\nCheck back soon for updated analysis!\n\n#${sport} #sportsbetting #valuebet`;
      }

      const weekText = week ? `Week ${week}` : 'Today';
      let tweet = `🔥 **Top Value Plays - ${weekText}** 🔥\n\n`;

      topEdges.forEach((edge, index) => {
        const playerName = edge.playerId?.split('-')?.pop() || 'Player';
        tweet += `${index + 1}. ${playerName} ${edge.bestPropType} - ${edge.edgeScore}% edge\n`;
      });

      tweet += `\nFull analysis & more picks available on the platform!\n\n#${sport} #sportsbetting #valuebet`;

      return tweet;
    } catch (error) {
      console.error('Error generating waiver wire tweet:', error);
      throw error;
    }
  }

  async generateBettingPicksTweet(sport: string): Promise<string> {
    try {
      // Get today's best betting edges
      const edges = await storage.getPlayerEdges(undefined, sport);
      const games = await storage.getTodaysGames(sport);
      
      const topBets = edges
        .filter(edge => edge.confidence >= 4 && parseFloat(edge.edgeScore) >= 60)
        .sort((a, b) => parseFloat(b.edgeScore) - parseFloat(a.edgeScore))
        .slice(0, 3);

      if (topBets.length === 0) {
        return `💰 **Best Value Bets - ${sport.toUpperCase()}** 💰\n\nNo high-confidence bets available right now.\nStay disciplined and wait for the right spots!\n\n#${sport} #sportsbetting #discipline`;
      }

      let tweet = `💰 **Best Value Bets - ${sport.toUpperCase()}** 💰\n\n`;

      topBets.forEach((bet, index) => {
        const playerName = bet.playerId?.split('-')?.pop() || 'Player';
        tweet += `${index + 1}. ${playerName} ${bet.bestPropType} ${bet.bestPropLine}\n`;
      });

      tweet += `\nConfidence: HIGH on all picks. Full breakdown available!\n\n#${sport} #sportsbetting #valuebet`;

      return tweet;
    } catch (error) {
      console.error('Error generating betting picks tweet:', error);
      throw error;
    }
  }

  async generateParlayTweet(parlayData: any): Promise<string> {
    try {
      const legs = parlayData.legs || [];
      const payout = parlayData.expectedPayout || 0;
      const odds = parlayData.totalOdds || 0;

      let tweet = `🎯 **${legs.length}-Leg Parlay Builder** 🎯\n\n`;

      legs.slice(0, 3).forEach((leg: any, index: number) => {
        const selection = leg.selection || `Leg ${index + 1}`;
        tweet += `${index + 1}. ${selection}\n`;
      });

      if (legs.length > 3) {
        tweet += `+ ${legs.length - 3} more legs\n`;
      }

      tweet += `\nOdds: ${odds > 0 ? '+' : ''}${odds}\n`;
      tweet += `Potential Payout: $${payout.toFixed(2)}\n\n`;
      tweet += `Build your own parlays with our advanced tools!\n\n#parlay #sportsbetting #parlaybuilder`;

      return tweet;
    } catch (error) {
      console.error('Error generating parlay tweet:', error);
      throw error;
    }
  }

  async postTweet(data: TwitterPostData): Promise<{ success: boolean; message: string; tweetId?: string }> {
    try {
      if (!this.config.enabled || !this.isConfigured()) {
        // Simulate posting for development
        console.log('🐦 **Simulating Tweet Post** 🐦');
        console.log('-'.repeat(40));
        console.log(data.text);
        if (data.imageUrl) {
          console.log(`📷 Attaching image: ${data.imageUrl}`);
        }
        console.log('-'.repeat(40));
        console.log('✅ Tweet successfully posted (simulation).');
        
        return {
          success: true,
          message: 'Tweet posted successfully (simulation mode)',
          tweetId: `sim_${Date.now()}`
        };
      }

      // Use the real Twitter engine for live posting
      return await this.postWithTwitterEngine(data.text);

    } catch (error) {
      console.error('Error posting tweet:', error);
      return {
        success: false,
        message: `Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async postWithTwitterEngine(tweetText: string): Promise<{ success: boolean; message: string; tweetId?: string }> {
    return new Promise((resolve) => {
      try {
        const pythonPath = path.join(process.cwd(), 'twitter_engine.py');
        const python = spawn('python3', [pythonPath, '--post', tweetText], {
          env: { ...process.env },
          cwd: process.cwd()
        });

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
          output += data.toString();
        });

        python.stderr.on('data', (data) => {
          error += data.toString();
        });

        python.on('close', (code) => {
          if (code === 0) {
            // Extract tweet ID from output if available
            const tweetIdMatch = output.match(/Tweet ID: (\d+)/);
            const tweetId = tweetIdMatch ? tweetIdMatch[1] : `live_${Date.now()}`;
            
            resolve({
              success: true,
              message: 'Tweet posted successfully to Twitter!',
              tweetId
            });
          } else {
            resolve({
              success: false,
              message: `Twitter posting failed: ${error || 'Unknown error'}`
            });
          }
        });

        python.on('error', (err) => {
          resolve({
            success: false,
            message: `Failed to execute Twitter engine: ${err.message}`
          });
        });

      } catch (error) {
        resolve({
          success: false,
          message: `Twitter engine error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    });
  }

  async getTwitterStatus(): Promise<{ enabled: boolean; configured: boolean; message: string }> {
    const configured = this.isConfigured();
    
    return {
      enabled: this.config.enabled,
      configured,
      message: configured && this.config.enabled
        ? 'Twitter integration is fully configured and ready for live posting!'
        : configured 
          ? 'Twitter API credentials configured. Set TWITTER_ENABLED=true to enable live posting.'
          : 'Twitter API credentials not configured. Using simulation mode.'
    };
  }

  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret && this.config.accessToken && this.config.accessTokenSecret);
  }

  updateConfig(newConfig: Partial<TwitterConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const twitterService = new TwitterService();
