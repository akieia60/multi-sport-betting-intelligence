#!/usr/bin/env python3
"""
NFL Analytics Empire - Complete Full-Stack Application
Your real backend engines connected to React frontend
"""
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import your real engines
from data_engine import ProfessionalDataEngine
from twitter_engine import TwitterGrowthEngine
from newsletter_engine import NewsletterAutomationEngine
from config import Brand, Schedule, Monetization

app = Flask(__name__)
CORS(app)

# Initialize your real engines
print("🚀 Initializing NFL Analytics Empire...")

# Data Engine with your real API keys
data_engine = None
try:
    data_engine = ProfessionalDataEngine()
    print("✅ Data Engine loaded with your real API keys")
except Exception as e:
    print(f"❌ Data Engine failed: {e}")

# Twitter Engine
twitter_engine = None
try:
    twitter_engine = TwitterGrowthEngine()
    print("✅ Twitter Engine loaded")
except Exception as e:
    print(f"❌ Twitter Engine failed: {e}")

# Newsletter Engine
newsletter_engine = None
try:
    newsletter_engine = NewsletterAutomationEngine()
    print("✅ Newsletter Engine loaded")
except Exception as e:
    print(f"❌ Newsletter Engine failed: {e}")

# Static file serving for React frontend
@app.route("/")
def index():
    return send_from_directory("client/dist", "index.html")

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory("client/dist/assets", filename)

# === API ROUTES - YOUR REAL DATA ===

@app.route("/api/status")
def status():
    return jsonify({
        "platform": "NFL Analytics Empire - SportEdge Pro",
        "status": "operational",
        "brand": Brand.NAME,
        "tagline": Brand.TAGLINE,
        "engines": {
            "data": "active" if data_engine else "offline",
            "twitter": "active" if twitter_engine else "offline",
            "newsletter": "active" if newsletter_engine else "offline"
        },
        "apis": {
            "odds_api": "connected" if os.getenv("ODDS_API_KEY") else "missing",
            "twitter_api": "connected" if os.getenv("TWITTER_API_KEY") else "missing"
        }
    })

@app.route("/api/games")
def get_games():
    """Get live NFL games with real betting data"""
    if not data_engine:
        return jsonify({"error": "Data engine not available"}), 503

    try:
        games = data_engine.get_nfl_games()
        return jsonify({
            "success": True,
            "games": games,
            "timestamp": datetime.now().isoformat(),
            "source": "The Odds API"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/odds")
def get_odds():
    """Get live betting odds from real sportsbooks"""
    if not data_engine:
        return jsonify({"error": "Data engine not available"}), 503

    try:
        odds = data_engine.get_live_odds()
        return jsonify({
            "success": True,
            "odds": odds,
            "timestamp": datetime.now().isoformat(),
            "sportsbooks": ["DraftKings", "FanDuel", "BetMGM", "Caesars"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/player-props")
def get_player_props():
    """Get NFL player props from real sportsbooks"""
    if not data_engine:
        return jsonify({"error": "Data engine not available"}), 503

    try:
        props = data_engine.get_player_props()
        return jsonify({
            "success": True,
            "props": props,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/twitter/post", methods=['POST'])
def twitter_post():
    """Post tweet using your real Twitter account"""
    if not twitter_engine:
        return jsonify({"error": "Twitter engine not available"}), 503

    try:
        data = request.get_json()
        message = data.get('message', '')
        result = twitter_engine.post_insight(message)
        return jsonify({
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/newsletter/send", methods=['POST'])
def send_newsletter():
    """Send newsletter using your real system"""
    if not newsletter_engine:
        return jsonify({"error": "Newsletter engine not available"}), 503

    try:
        result = newsletter_engine.generate_weekly_report()
        return jsonify({
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics")
def get_analytics():
    """Get your NFL analytics and insights"""
    if not data_engine:
        return jsonify({"error": "Data engine not available"}), 503

    try:
        analytics = data_engine.generate_insights()
        return jsonify({
            "success": True,
            "analytics": analytics,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "empire": "operational"})

# Catch-all for React routing
@app.route("/<path:path>")
def catch_all(path):
    return send_from_directory("client/dist", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"🏈 NFL Analytics Empire starting on port {port}")
    print(f"🎯 Brand: {Brand.NAME}")
    print(f"🚀 Ready to serve real betting data!")
    app.run(host="0.0.0.0", port=port, debug=False)