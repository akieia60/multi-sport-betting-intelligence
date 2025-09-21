#!/usr/bin/env python3
"""
Production-ready app with all your data engines
"""
from flask import Flask, send_from_directory, jsonify, request
import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

# Initialize engines safely
engines = {
    'twitter': None,
    'data': None,
    'newsletter': None
}

def init_engines():
    """Initialize engines with proper error handling"""
    global engines

    # Twitter Engine
    try:
        from twitter_engine import TwitterGrowthEngine
        if all(os.getenv(key) for key in ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_TOKEN_SECRET']):
            engines['twitter'] = TwitterGrowthEngine()
            print("✅ Twitter Engine initialized")
        else:
            print("⚠ Twitter Engine: Missing API keys")
    except Exception as e:
        print(f"⚠ Twitter Engine failed: {e}")

    # Data Engine
    try:
        from data_engine import ProfessionalDataEngine
        if os.getenv('ODDS_API_KEY') and os.getenv('SPORTSDATA_API_KEY'):
            engines['data'] = ProfessionalDataEngine()
            print("✅ Data Engine initialized")
        else:
            print("⚠ Data Engine: Missing API keys")
    except Exception as e:
        print(f"⚠ Data Engine failed: {e}")

    # Newsletter Engine
    try:
        from newsletter_engine import NewsletterAutomationEngine
        engines['newsletter'] = NewsletterAutomationEngine()
        print("✅ Newsletter Engine initialized")
    except Exception as e:
        print(f"⚠ Newsletter Engine failed: {e}")

# Initialize engines on startup
init_engines()

# Static file serving
@app.route("/")
def index():
    try:
        # Check multiple possible locations
        static_paths = ["client/dist", "dist/public", "dist"]
        for path in static_paths:
            if os.path.exists(os.path.join(path, "index.html")):
                return send_from_directory(path, "index.html")

        # Debug info if none found
        return jsonify({
            "error": "Frontend not found",
            "checked_paths": static_paths,
            "current_dir": os.getcwd(),
            "files": os.listdir(".") if os.path.exists(".") else "no current dir"
        })
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory("client/dist/assets", filename)

# API Routes
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
    return jsonify({
        "platform": "SportEdge Pro - Multi-Sport Betting Intelligence",
        "status": "operational",
        "deployment": "Railway Production",
        "features": ["SportsDataIO Integration", "Twitter Automation", "Advanced Parlay Builder", "Revenue Ready"],
        "engines": {
            "twitter": "active" if engines['twitter'] else "offline",
            "data": "active" if engines['data'] else "offline",
            "newsletter": "active" if engines['newsletter'] else "offline"
        }
    })

@app.route("/api/data/status")
def data_status():
    if engines['data']:
        return jsonify({
            "status": "active",
            "apis": {
                "odds_api": "connected" if os.getenv("ODDS_API_KEY") else "missing",
                "sportsdata_api": "connected" if os.getenv("SPORTSDATA_API_KEY") else "missing"
            }
        })
    else:
        return jsonify({
            "status": "initializing",
            "message": "Data engine starting up"
        })

@app.route("/api/twitter/status")
def twitter_status():
    return jsonify({
        "status": "active" if engines['twitter'] else "offline",
        "automation": "enabled" if os.getenv("TWITTER_ENABLED") == "true" else "disabled"
    })

@app.route("/api/data/games")
def get_games():
    if engines['data']:
        try:
            games = engines['data'].get_live_games()
            return jsonify(games)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Data engine not initialized"}), 503

@app.route("/api/data/odds")
def get_odds():
    if engines['data']:
        try:
            odds = engines['data'].get_live_odds()
            return jsonify(odds)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Data engine not initialized"}), 503

@app.route("/api/twitter/post", methods=['POST'])
def twitter_post():
    if engines['twitter']:
        try:
            data = request.get_json()
            result = engines['twitter'].post_tweet(data.get('message', ''))
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Twitter engine not initialized"}), 503

# Catch-all for SPA routing
@app.route("/<path:path>")
def catch_all(path):
    return send_from_directory("client/dist", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Starting app on port {port}")
    app.run(host="0.0.0.0", port=port)