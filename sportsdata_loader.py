#!/usr/bin/env python3
"""
SportsData.io CSV Data Loader
Load and serve your downloaded NFL data
"""
import csv
import os
from typing import Dict, List

class SportsDataLoader:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data', 'sportsdata')
        self.players = []
        self.teams = []
        self.load_data()

    def load_data(self):
        """Load all CSV data files"""
        try:
            # Load players
            player_file = os.path.join(self.data_dir, 'Player.2025.csv')
            if os.path.exists(player_file):
                with open(player_file, 'r') as f:
                    reader = csv.DictReader(f)
                    self.players = list(reader)
                    print(f"✅ Loaded {len(self.players)} players from SportsData.io")

            # Load teams
            team_file = os.path.join(self.data_dir, 'Team.2025.csv')
            if os.path.exists(team_file):
                with open(team_file, 'r') as f:
                    reader = csv.DictReader(f)
                    self.teams = list(reader)
                    print(f"✅ Loaded {len(self.teams)} teams from SportsData.io")

        except Exception as e:
            print(f"⚠️ Error loading SportsData.io files: {e}")

    def get_active_players(self, limit=50):
        """Get active NFL players"""
        active_players = [p for p in self.players if p.get('Status') == 'Active'][:limit]
        return [{
            'name': f"{p.get('FirstName', '')} {p.get('LastName', '')}",
            'number': p.get('Number', ''),
            'height': p.get('Height', ''),
            'status': p.get('Status', ''),
            'injury_status': p.get('InjuryStatus', '')
        } for p in active_players]

    def get_teams(self):
        """Get NFL teams"""
        return [{
            'name': t.get('Name', ''),
            'key': t.get('Key', ''),
            'city': t.get('City', ''),
            'conference': t.get('Conference', ''),
            'division': t.get('Division', '')
        } for t in self.teams]

    def search_players(self, query: str, limit=20):
        """Search players by name"""
        query_lower = query.lower()
        matches = []

        for player in self.players:
            full_name = f"{player.get('FirstName', '')} {player.get('LastName', '')}".lower()
            if query_lower in full_name:
                matches.append({
                    'name': f"{player.get('FirstName', '')} {player.get('LastName', '')}",
                    'number': player.get('Number', ''),
                    'height': player.get('Height', ''),
                    'status': player.get('Status', ''),
                    'injury_status': player.get('InjuryStatus', '')
                })

                if len(matches) >= limit:
                    break

        return matches