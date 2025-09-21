from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

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
    return jsonify({
        "platform": "SportEdge Pro - Multi-Sport Betting Intelligence",
        "status": "operational",
        "deployment": "Railway Production",
        "features": ["SportsDataIO Integration", "Twitter Automation", "Advanced Parlay Builder", "Revenue Ready"]
    })

@app.route("/api/data/status")
def data_status():
    return jsonify({
        "status": "initializing",
        "message": "Data engines starting up - refresh in a moment",
        "apis": {
            "odds_api": "configured" if os.getenv("ODDS_API_KEY") else "missing",
            "sportsdata_api": "configured" if os.getenv("SPORTSDATA_API_KEY") else "missing"
        }
    })

@app.route("/api/twitter/status")
def twitter_status():
    return jsonify({
        "status": "configured" if os.getenv("TWITTER_API_KEY") else "offline",
        "automation": "enabled" if os.getenv("TWITTER_ENABLED") == "true" else "disabled"
    })

@app.route("/<path:path>")
def catch_all(path):
    return send_from_directory("client/dist", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)