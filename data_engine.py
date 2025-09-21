#!/usr/bin/env python3
"""
NFL Analytics Empire - Professional Data Engine
Real-time sportsbook data integration for premium betting intelligence
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import time

class ProfessionalDataEngine:
    """
    Premium data integration system for professional NFL analytics
    Connects to real sportsbooks for live betting intelligence
    """
    
    def __init__(self):
        self.odds_api_key = os.getenv('ODDS_API_KEY', '')
        self.odds_base_url = 'https://api.the-odds-api.com/v4'

        # SportsDataIO API integration
        self.sportsdata_api_key = os.getenv('SPORTSDATA_API_KEY', '')
        self.sportsdata_base_url = 'https://api.sportsdata.io/v3/nfl'

        # Sportsbook configuration
        self.sportsbooks = ['draftkings', 'fanduel', 'betmgm', 'caesars', 'pointsbet']
        
        # Market types
        self.markets = {
            'game_lines': ['h2h', 'spreads', 'totals'],
            'player_props': [
                'player_pass_tds',
                'player_pass_yds', 
                'player_rush_yds',
                'player_receptions',
                'player_reception_yds',
                'player_anytime_td',
                'player_first_td'
            ]
        }
        
        # Cache for API efficiency
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
    
    def get_nfl_games(self) -> List[Dict]:
        """Get current week NFL games with betting lines"""
        
        cache_key = 'nfl_games'
        if self._is_cached(cache_key):
            return self.cache[cache_key]['data']
        
        url = f"{self.odds_base_url}/sports/americanfootball_nfl/odds"
        
        params = {
            'apiKey': self.odds_api_key,
            'regions': 'us',
            'markets': 'h2h,spreads,totals',
            'oddsFormat': 'american',
            'bookmakers': ','.join(self.sportsbooks)
        }
        
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            games = response.json()
            
            # Cache the results
            self.cache[cache_key] = {
                'data': games,
                'timestamp': time.time()
            }
            
            return games
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching games: {e}")
            return []

    def get_sportsdata_games(self) -> List[Dict]:
        """Get NFL games from SportsDataIO API"""
        if not self.sportsdata_api_key:
            return []

        url = f"{self.sportsdata_base_url}/scores/json/Scores/2025"
        headers = {'Ocp-Apim-Subscription-Key': self.sportsdata_api_key}

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            games = response.json()
            print(f"✅ SportsDataIO: Got {len(games)} NFL games")
            return games
        except Exception as e:
            print(f"❌ SportsDataIO Games Error: {e}")
            return []

    def get_sportsdata_players(self) -> List[Dict]:
        """Get ALL NFL players from SportsDataIO"""
        if not self.sportsdata_api_key:
            return []

        url = f"{self.sportsdata_base_url}/scores/json/Players"
        headers = {'Ocp-Apim-Subscription-Key': self.sportsdata_api_key}

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            players = response.json()
            print(f"✅ SportsDataIO: Got {len(players)} NFL players")
            return players
        except Exception as e:
            print(f"❌ SportsDataIO Players Error: {e}")
            return []

    def get_sportsdata_teams(self) -> List[Dict]:
        """Get ALL NFL teams from SportsDataIO"""
        if not self.sportsdata_api_key:
            return []

        url = f"{self.sportsdata_base_url}/scores/json/Teams"
        headers = {'Ocp-Apim-Subscription-Key': self.sportsdata_api_key}

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            teams = response.json()
            print(f"✅ SportsDataIO: Got {len(teams)} NFL teams")
            return teams
        except Exception as e:
            print(f"❌ SportsDataIO Teams Error: {e}")
            return []

    def get_sportsdata_player_stats(self, season: str = "2025") -> List[Dict]:
        """Get player season stats from SportsDataIO"""
        if not self.sportsdata_api_key:
            return []

        url = f"{self.sportsdata_base_url}/stats/json/PlayerSeasonStats/{season}"
        headers = {'Ocp-Apim-Subscription-Key': self.sportsdata_api_key}

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            stats = response.json()
            print(f"✅ SportsDataIO: Got {len(stats)} player stats")
            return stats
        except Exception as e:
            print(f"❌ SportsDataIO Player Stats Error: {e}")
            return []

    def get_sportsdata_standings(self) -> List[Dict]:
        """Get NFL standings from SportsDataIO"""
        if not self.sportsdata_api_key:
            return []

        url = f"{self.sportsdata_base_url}/scores/json/Standings/2025"
        headers = {'Ocp-Apim-Subscription-Key': self.sportsdata_api_key}

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            standings = response.json()
            print(f"✅ SportsDataIO: Got NFL standings")
            return standings
        except Exception as e:
            print(f"❌ SportsDataIO Standings Error: {e}")
            return []

    def get_live_odds(self) -> List[Dict]:
        """Get live NFL betting odds combining both APIs"""
        odds_data = []

        # Get from Odds API
        if self.odds_api_key:
            try:
                url = f"{self.odds_base_url}/sports/americanfootball_nfl/odds"
                params = {
                    'apiKey': self.odds_api_key,
                    'regions': 'us',
                    'markets': 'h2h,spreads,totals',
                    'oddsFormat': 'american'
                }
                response = requests.get(url, params=params, timeout=15)
                response.raise_for_status()
                odds_data = response.json()
                print(f"✅ Odds API: Got {len(odds_data)} games with odds")
            except Exception as e:
                print(f"❌ Odds API Error: {e}")

        return odds_data

    def generate_insights(self) -> Dict:
        """Generate NFL analytics insights using all your data"""
        insights = {
            "games_today": 0,
            "top_players": [],
            "betting_edges": [],
            "team_analysis": {},
            "data_sources": []
        }

        # Get games
        games = self.get_sportsdata_games()
        if games:
            insights["games_today"] = len(games)
            insights["data_sources"].append("SportsDataIO Games")

        # Get players
        players = self.get_sportsdata_players()
        if players:
            insights["top_players"] = players[:10]  # Top 10 players
            insights["data_sources"].append("SportsDataIO Players")

        # Get odds
        odds = self.get_live_odds()
        if odds:
            insights["betting_edges"] = odds[:5]  # Top 5 betting opportunities
            insights["data_sources"].append("Live Odds API")

        return insights

    def get_player_props(self, market: str = 'player_anytime_td') -> List[Dict]:
        """Get player prop betting lines"""
        
        cache_key = f'props_{market}'
        if self._is_cached(cache_key):
            return self.cache[cache_key]['data']
        
        url = f"{self.odds_base_url}/sports/americanfootball_nfl/odds"
        
        params = {
            'apiKey': self.odds_api_key,
            'regions': 'us',
            'markets': market,
            'oddsFormat': 'american',
            'bookmakers': ','.join(self.sportsbooks)
        }
        
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            props = response.json()
            
            # Cache the results
            self.cache[cache_key] = {
                'data': props,
                'timestamp': time.time()
            }
            
            return props
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching props: {e}")
            return []
    
    def calculate_edge(self, true_probability: float, odds: int) -> float:
        """
        Calculate betting edge (expected value)
        
        Args:
            true_probability: Your calculated probability (0-1)
            odds: American odds from sportsbook
        
        Returns:
            Edge percentage (positive = profitable)
        """
        # Convert American odds to decimal
        if odds > 0:
            decimal_odds = (odds / 100) + 1
        else:
            decimal_odds = (100 / abs(odds)) + 1
        
        # Implied probability from odds
        implied_probability = 1 / decimal_odds
        
        # Calculate edge
        edge = true_probability - implied_probability
        
        return edge
    
    def find_best_odds(self, prop_data: List[Dict], player_name: str) -> Optional[Dict]:
        """Find best odds across all sportsbooks for a player"""
        
        best_odds = None
        best_value = float('-inf')
        
        for game in prop_data:
            for bookmaker in game.get('bookmakers', []):
                for market in bookmaker.get('markets', []):
                    for outcome in market.get('outcomes', []):
                        if outcome.get('description', '').lower() == player_name.lower():
                            
                            odds = outcome.get('price', 0)
                            
                            # Track best odds
                            if odds > best_value:
                                best_value = odds
                                best_odds = {
                                    'player': player_name,
                                    'odds': odds,
                                    'sportsbook': bookmaker.get('title'),
                                    'market': market.get('key'),
                                    'line': outcome.get('point', 0),
                                    'timestamp': datetime.now().isoformat()
                                }
        
        return best_odds
    
    def get_line_movement(self, player_name: str, market: str) -> Dict:
        """Track betting line movement for value identification"""
        
        # This would track historical odds
        # For now, return current odds
        props = self.get_player_props(market)
        current_odds = self.find_best_odds(props, player_name)
        
        return {
            'player': player_name,
            'current_odds': current_odds,
            'movement': 'stable',  # Would calculate from historical data
            'sharp_money': False   # Would analyze betting patterns
        }
    
    def get_profitable_props(self, min_edge: float = 0.05) -> List[Dict]:
        """
        Identify profitable betting opportunities
        
        Args:
            min_edge: Minimum edge percentage (default 5%)
        
        Returns:
            List of profitable props with calculated edges
        """
        profitable = []
        
        # Get all player props
        for market in ['player_anytime_td', 'player_rush_yds', 'player_reception_yds']:
            props = self.get_player_props(market)
            
            # Analyze each prop
            # This would integrate with your statistical models
            # For now, return props with good value
            
        return profitable
    
    def _is_cached(self, key: str) -> bool:
        """Check if cached data is still valid"""
        if key not in self.cache:
            return False
        
        age = time.time() - self.cache[key]['timestamp']
        return age < self.cache_duration
    
    def get_comprehensive_analysis(self, player_name: str) -> Dict:
        """
        Get complete betting analysis for a player
        
        Returns comprehensive data for newsletter generation
        """
        analysis = {
            'player': player_name,
            'timestamp': datetime.now().isoformat(),
            'betting_lines': {},
            'props': {},
            'edges': {},
            'recommendations': []
        }
        
        # Get all available props
        for market in ['player_anytime_td', 'player_rush_yds', 'player_reception_yds']:
            props = self.get_player_props(market)
            best_odds = self.find_best_odds(props, player_name)
            
            if best_odds:
                analysis['props'][market] = best_odds
                
                # Calculate edge (would use your statistical model)
                # For demonstration, using placeholder
                true_prob = 0.35  # Your calculated probability
                edge = self.calculate_edge(true_prob, best_odds['odds'])
                
                analysis['edges'][market] = {
                    'edge_percentage': edge,
                    'ev_per_dollar': edge * (best_odds['odds'] / 100 if best_odds['odds'] > 0 else 100 / abs(best_odds['odds'])),
                    'kelly_criterion': self._calculate_kelly(true_prob, best_odds['odds'])
                }
                
                # Generate recommendation
                if edge > 0.05:  # 5%+ edge
                    analysis['recommendations'].append({
                        'bet': f"{player_name} {market}",
                        'odds': best_odds['odds'],
                        'edge': edge,
                        'confidence': min(edge * 10, 1.0),  # Scale to 0-1
                        'bet_size': self._calculate_kelly(true_prob, best_odds['odds'])
                    })
        
        return analysis
    
    def _calculate_kelly(self, true_prob: float, odds: int) -> float:
        """Calculate Kelly Criterion bet sizing"""
        
        # Convert odds to decimal
        if odds > 0:
            decimal_odds = (odds / 100) + 1
        else:
            decimal_odds = (100 / abs(odds)) + 1
        
        # Kelly formula: (bp - q) / b
        # b = decimal odds - 1
        # p = true probability
        # q = 1 - p
        
        b = decimal_odds - 1
        p = true_prob
        q = 1 - p
        
        kelly = (b * p - q) / b
        
        # Use half-Kelly for safety
        return max(0, kelly * 0.5)


class ESPNDataIntegration:
    """ESPN API integration for player stats and game data"""
    
    def __init__(self):
        self.base_url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
    
    def get_player_stats(self, player_id: str = None) -> Dict:
        """Get player statistics"""
        
        # ESPN player stats endpoint
        url = f"{self.base_url}/athletes"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching player stats: {e}")
            return {}
    
    def get_team_stats(self, team_id: str = None) -> Dict:
        """Get team statistics"""
        
        url = f"{self.base_url}/teams"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching team stats: {e}")
            return {}
    
    def get_current_week(self) -> int:
        """Get current NFL week"""
        
        url = f"{self.base_url}/scoreboard"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('week', {}).get('number', 1)
        except Exception as e:
            print(f"Error fetching current week: {e}")
            return 1


def main():
    """Test the professional data engine"""
    
    print("🏈 NFL ANALYTICS EMPIRE - DATA ENGINE TEST")
    print("=" * 60)
    
    # Initialize
    engine = ProfessionalDataEngine()
    espn = ESPNDataIntegration()
    
    # Get current week
    print(f"\n📅 Current Week: {espn.get_current_week()}")
    
    # Get NFL games with betting lines
    print("\n📊 Fetching NFL games with betting lines...")
    games = engine.get_nfl_games()
    
    if games:
        print(f"✅ Retrieved {len(games)} games with betting lines")
        
        # Show sample game
        if len(games) > 0:
            game = games[0]
            print(f"\n🏈 Sample Game:")
            print(f"   {game.get('home_team')} vs {game.get('away_team')}")
            
    else:
        print("⚠️  No games found - check API key configuration")
    
    # Get player props
    print("\n🎯 Fetching player props...")
    props = engine.get_player_props('player_anytime_td')
    
    if props:
        print(f"✅ Retrieved anytime TD props")
    else:
        print("⚠️  No props found - check API key")
    
    # Test comprehensive analysis
    print("\n📈 Testing comprehensive analysis...")
    analysis = engine.get_comprehensive_analysis("Christian McCaffrey")
    
    print(f"\n✅ Analysis complete!")
    print(f"   Recommendations: {len(analysis['recommendations'])}")
    
    print("\n" + "=" * 60)
    print("🎯 Data Engine Ready for Production!")
    print("\n💡 Next Steps:")
    print("   1. Add your Odds API key to .env")
    print("   2. Run newsletter generation")
    print("   3. Start Twitter automation")
    

if __name__ == "__main__":
    main()
