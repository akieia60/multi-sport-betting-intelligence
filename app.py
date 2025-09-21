from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Load your SportsData.io CSV files first (this always works)
sportsdata = None
try:
    from sportsdata_loader import SportsDataLoader
    sportsdata = SportsDataLoader()
    print("✅ SportsData.io files loaded")
except Exception as e:
    print(f"⚠️ SportsData loading failed: {e}")

# Try to load engines (optional - app works without them)
data_engine = None
twitter_engine = None
newsletter_engine = None

try:
    from data_engine import ProfessionalDataEngine
    from twitter_engine import TwitterGrowthEngine
    from newsletter_engine import NewsletterAutomationEngine
    from config import Brand, Schedule, Monetization

    # Initialize engines only if we have API keys
    if os.getenv('ODDS_API_KEY'):
        data_engine = ProfessionalDataEngine()
        print("✅ Data Engine loaded")

    if os.getenv('TWITTER_API_KEY'):
        twitter_engine = TwitterGrowthEngine()
        print("✅ Twitter Engine loaded")

    newsletter_engine = NewsletterAutomationEngine()
    print("✅ Newsletter Engine loaded")

except Exception as e:
    print(f"⚠️ Engine loading failed: {e}")
    print("✅ App will work with SportsData.io files only")

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return send_from_directory("client/dist", "index.html")

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory("client/dist/assets", filename)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
    # App is operational if SportsData is loaded (real NFL data available)
    is_operational = sportsdata is not None

    return jsonify({
        "platform": "NFL Analytics Empire - SportEdge Pro",
        "status": "operational" if is_operational else "loading",
        "offline": not is_operational,
        "data_sources": {
            "sportsdata_csv": "active" if sportsdata else "offline",
            "live_odds_api": "active" if data_engine else "offline",
            "twitter_api": "active" if twitter_engine else "offline"
        },
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
        return jsonify({"error": "Data engine not available", "status": "offline"}), 503

    try:
        games = data_engine.get_nfl_games()
        return jsonify({
            "success": True,
            "games": games,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/social-media/stats")
def social_media_stats():
    """Get social media stats for the dashboard"""
    if not twitter_engine:
        return jsonify({
            "followers": 1247,
            "engagement_rate": "8.3%",
            "posts_this_week": 12,
            "status": "offline"
        })

    try:
        # Get real Twitter stats from your engine
        stats = twitter_engine.get_account_stats()
        return jsonify({
            "followers": stats.get("followers", 1247),
            "engagement_rate": stats.get("engagement_rate", "8.3%"),
            "posts_this_week": stats.get("posts_this_week", 12),
            "status": "active"
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

@app.route("/api/players")
def get_players():
    """Get NFL players from your SportsData.io files"""
    if not sportsdata:
        return jsonify({"error": "SportsData not available"}), 503

    try:
        players = sportsdata.get_active_players(limit=100)
        return jsonify({
            "success": True,
            "players": players,
            "total": len(players),
            "source": "SportsData.io CSV"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/players/search")
def search_players():
    """Search NFL players"""
    if not sportsdata:
        return jsonify({"error": "SportsData not available"}), 503

    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Query parameter 'q' required"}), 400

    try:
        players = sportsdata.search_players(query)
        return jsonify({
            "success": True,
            "players": players,
            "query": query,
            "source": "SportsData.io CSV"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/teams")
def get_teams():
    """Get NFL teams from your SportsData.io files"""
    if not sportsdata:
        return jsonify({"error": "SportsData not available"}), 503

    try:
        teams = sportsdata.get_teams()
        return jsonify({
            "success": True,
            "teams": teams,
            "total": len(teams),
            "source": "SportsData.io CSV"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/<path:path>")
def catch_all(path):
    return send_from_directory("client/dist", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
