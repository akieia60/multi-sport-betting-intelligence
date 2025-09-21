from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

@app.route("/")
def root_index():
    return send_from_directory("dist/public", "index.html")

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory("dist/public/assets", filename)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
    return jsonify({"platform": "railway", "app": "sportedge-pro"})

@app.route("/<path:path>")
def catch_all(path):
    # For SPA routing, serve index.html for any unmatched routes
    return send_from_directory("dist/public", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
