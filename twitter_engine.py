#!/usr/bin/env python3
"""
NFL Analytics Empire - Professional Twitter Automation
Build 10K+ followers with data-driven NFL content
"""

import os
import tweepy
import schedule
import time
from datetime import datetime
from pathlib import Path
import json

class TwitterGrowthEngine:
    """Professional Twitter automation for NFL analytics brand"""
    
    def __init__(self):
        # Twitter API credentials
        self.api_key = os.getenv('TWITTER_API_KEY', '')
        self.api_secret = os.getenv('TWITTER_API_SECRET', '')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN', '')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET', '')
        
        # Initialize Twitter client
        self.client = None
        self._setup_client()
        
        # Content templates
        self.templates = self._load_templates()
        
        # Performance tracking
        self.posts_made = 0
        self.engagement_rate = 0
        self.followers_gained = 0
    
    def _setup_client(self):
        """Initialize Twitter API client"""
        
        if not all([self.api_key, self.api_secret, self.access_token, self.access_token_secret]):
            print("⚠️  Twitter API credentials not configured")
            return
        
        try:
            self.client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret
            )
            print("✅ Twitter client initialized")
        except Exception as e:
            print(f"❌ Error setting up Twitter: {e}")
    
    def _load_templates(self) -> dict:
        """Load professional content templates"""
        
        return {
            'best_bet': """🎯 BEST BET ALERT

{player} {prop}
📊 Edge: {edge}% | Confidence: {confidence}/10
🏈 {sportsbook} {odds}

{analysis}

#NFL #NFLBetting #SportsBetting""",
            
            'top_plays': """🔥 TOP 3 PLAYS - WEEK {week}

1️⃣ {play1}
   Edge: {edge1}% | {confidence1}/10

2️⃣ {play2}
   Edge: {edge2}% | {confidence2}/10

3️⃣ {play3}
   Edge: {edge3}% | {confidence3}/10

Full analysis ⬇️
{newsletter_link}

#NFLPicks #FantasyFootball""",
            
            'breaking_news': """🚨 BREAKING

{news}

Impact: {impact}

Betting Implications:
{implications}

#NFL #InjuryReport""",
            
            'weekly_recap': """📊 WEEK {week} PERFORMANCE

✅ {wins}W - {losses}L ({win_rate}%)
💰 {units}u Profit
📈 Avg Edge: {avg_edge}%

Best Hit: {best_hit}
{result}

#NFLBetting #SportsBetting""",
            
            'thread_opener': """🧵 THREAD: Why {player} is a SMASH PLAY this week

Let's break down the data... (1/{thread_length})""",
            
            'engagement': """What's your LOCK for {game}? 

Drop your picks below 👇

I'm riding with {pick}

#NFLTwitter #NFLBetting"""
        }
    
    def post_best_bet(self, bet_data: dict) -> bool:
        """Post best bet to Twitter"""
        
        if not self.client:
            print("❌ Twitter not configured")
            return False
        
        tweet_text = self.templates['best_bet'].format(
            player=bet_data.get('player', ''),
            prop=bet_data.get('prop', ''),
            edge=bet_data.get('edge', 0),
            confidence=bet_data.get('confidence', 0),
            sportsbook=bet_data.get('sportsbook', ''),
            odds=bet_data.get('odds', ''),
            analysis=bet_data.get('analysis', '')
        )
        
        return self._send_tweet(tweet_text)
    
    def post_top_plays(self, plays: list, week: int, newsletter_link: str) -> bool:
        """Post top plays thread"""
        
        if not self.client or len(plays) < 3:
            return False
        
        tweet_text = self.templates['top_plays'].format(
            week=week,
            play1=plays[0].get('description', ''),
            edge1=plays[0].get('edge', 0),
            confidence1=plays[0].get('confidence', 0),
            play2=plays[1].get('description', ''),
            edge2=plays[1].get('edge', 0),
            confidence2=plays[1].get('confidence', 0),
            play3=plays[2].get('description', ''),
            edge3=plays[2].get('edge', 0),
            confidence3=plays[2].get('confidence', 0),
            newsletter_link=newsletter_link
        )
        
        return self._send_tweet(tweet_text)
    
    def post_thread(self, thread_content: list) -> bool:
        """Post a Twitter thread"""
        
        if not self.client or not thread_content:
            return False
        
        previous_tweet_id = None
        
        for tweet_text in thread_content:
            try:
                if previous_tweet_id:
                    response = self.client.create_tweet(
                        text=tweet_text,
                        in_reply_to_tweet_id=previous_tweet_id
                    )
                else:
                    response = self.client.create_tweet(text=tweet_text)
                
                previous_tweet_id = response.data['id']
                time.sleep(2)  # Avoid rate limits
                
            except Exception as e:
                print(f"❌ Error posting thread: {e}")
                return False
        
        print(f"✅ Thread posted: {len(thread_content)} tweets")
        return True
    
    def generate_player_thread(self, player_data: dict) -> list:
        """Generate detailed player analysis thread"""
        
        thread = []
        
        # Thread opener
        thread.append(self.templates['thread_opener'].format(
            player=player_data.get('name', ''),
            thread_length=5  # Adjust based on content
        ))
        
        # Statistical analysis
        thread.append(f"""📊 THE NUMBERS

🎯 Target Share: {player_data.get('target_share', 0)}%
📈 Routes Run: {player_data.get('routes', 0)}
🏃 Snap %: {player_data.get('snap_pct', 0)}%
🔴 RZ Targets: {player_data.get('rz_targets', 0)}

Elite usage = Elite opportunity (2/{5})""")
        
        # Matchup analysis
        thread.append(f"""🔍 THE MATCHUP

Facing: {player_data.get('opponent', '')}
Defense Rank: {player_data.get('def_rank', 'N/A')}

They've allowed:
• {player_data.get('yards_allowed', 0)} yds/game to {player_data.get('position', '')}s
• {player_data.get('tds_allowed', 0)} TDs last 4 weeks

Massive advantage here (3/{5})""")
        
        # Betting analysis
        thread.append(f"""💰 THE BET

Line: {player_data.get('line', '')}
Edge: {player_data.get('edge', 0)}%
Kelly Criterion: {player_data.get('kelly', 0)}% of bankroll

This is a HIGH CONVICTION play (4/{5})""")
        
        # Call to action
        thread.append(f"""🎯 THE VERDICT

{player_data.get('name', '')} is a {player_data.get('verdict', 'SMASH')} play

Confidence: {player_data.get('confidence', 0)}/10

Following? RT and let me know your plays 👇

Join the community: [link] (5/{5})""")
        
        return thread
    
    def schedule_daily_posts(self):
        """Schedule automated daily posts"""
        
        print("⏰ Setting up Twitter posting schedule...")
        
        # Morning: Market analysis
        schedule.every().day.at("07:00").do(self._morning_post)
        
        # Afternoon: Player spotlight
        schedule.every().day.at("14:00").do(self._afternoon_post)
        
        # Evening: Best bets
        schedule.every().day.at("19:00").do(self._evening_post)
        
        # Sunday: Live game day
        schedule.every().sunday.at("09:00").do(self._gameday_posts)
        
        print("✅ Twitter automation scheduled")
    
    def _morning_post(self):
        """Morning market analysis post"""
        
        tweet = f"""🌅 MORNING EDGE REPORT

Top line movements overnight:
• CMC O/U 85.5 → 88.5 ⬆️
• Hill Anytime TD +140 → +120 ⬆️
• Mahomes O/U 1.5 TD -130 → -145 ⬆️

Sharp money coming in on favorites

#NFLBetting #{datetime.now().strftime('%A')}"""
        
        self._send_tweet(tweet)
    
    def _afternoon_post(self):
        """Afternoon player analysis"""
        
        # This would pull from your data engine
        tweet = f"""📊 STAT OF THE DAY

Justin Jefferson has a 92% catch rate when targeted 10+ yards downfield vs zone coverage

This week: Playing vs GB (3rd most zone coverage in NFL)

Smash his receiving yards prop

#NFL #FantasyFootball"""
        
        self._send_tweet(tweet)
    
    def _evening_post(self):
        """Evening best bets"""
        
        tweet = f"""🎯 TONIGHT'S BEST BETS

1️⃣ Travis Kelce OVER 52.5 Rec Yds
   Edge: 8.2% | DK -110

2️⃣ Josh Jacobs Anytime TD
   Edge: 11.5% | FD +140

Full analysis in newsletter:
[link]

#NFLBetting #SportsBetting"""
        
        self._send_tweet(tweet)
    
    def _gameday_posts(self):
        """Sunday game day content"""
        
        tweets = [
            "🏈 GAME DAY! Here are my top plays...",
            "🔥 LAST MINUTE ADD: [player] prop just moved...",
            "⚡ LIVE BET ALERT: Jump on this now..."
        ]
        
        for tweet in tweets:
            self._send_tweet(tweet)
            time.sleep(3600)  # 1 hour between posts
    
    def _send_tweet(self, text: str) -> bool:
        """Send a single tweet"""
        
        if not self.client:
            print(f"📝 Would tweet: {text[:50]}...")
            return False
        
        try:
            response = self.client.create_tweet(text=text)
            self.posts_made += 1
            print(f"✅ Tweet posted: {text[:50]}...")
            return True
        except Exception as e:
            print(f"❌ Error posting tweet: {e}")
            return False
    
    def run_growth_campaign(self):
        """Run automated Twitter growth campaign"""
        
        print(f"\n🚀 Starting Twitter Growth Engine")
        print(f"{'='*60}\n")
        
        # Schedule posts
        self.schedule_daily_posts()
        
        print(f"✅ Growth campaign active")
        print(f"📊 Target: 10K followers in 6 months")
        print(f"📈 Current followers: {self._get_follower_count()}")
        print(f"⏹️  Press Ctrl+C to stop\n")
        
        # Run scheduler
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)
        except KeyboardInterrupt:
            print("\n\n⏹️  Growth engine stopped")
            print(f"📊 Total posts made: {self.posts_made}")
    
    def _get_follower_count(self) -> int:
        """Get current follower count"""
        
        if not self.client:
            return 0
        
        try:
            user = self.client.get_me(user_fields=['public_metrics'])
            return user.data.public_metrics['followers_count']
        except:
            return 0


def main():
    """Test Twitter automation"""
    
    print("🐦 NFL Analytics Empire - Twitter Automation")
    print("=" * 60)
    
    twitter = TwitterGrowthEngine()
    
    # Test tweet (won't actually post without credentials)
    sample_bet = {
        'player': 'Christian McCaffrey',
        'prop': 'OVER 85.5 Rush Yards',
        'edge': 11.2,
        'confidence': 9,
        'sportsbook': 'DraftKings',
        'odds': '-110',
        'analysis': 'Seahawks allow 142 rush yds/game. CMC averaging 94 yds. Smash play.'
    }
    
    twitter.post_best_bet(sample_bet)
    
    print("\n✅ Twitter automation ready!")
    print("\n💡 To enable:")
    print("   1. Get Twitter API credentials")
    print("   2. Add to .env file")
    print("   3. Run: python twitter_engine.py")


if __name__ == "__main__":
    main()
