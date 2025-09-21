from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

@app.route("/")
def index():
    try:
        static_dir = os.path.join(os.getcwd(), "dist", "public")
        return send_from_directory(static_dir, "index.html")
    except Exception as e:
        return jsonify({"error": "Frontend not found", "details": str(e), "cwd": os.getcwd()}), 404

@app.route("/assets/<path:filename>")
def assets(filename):
    try:
        assets_dir = os.path.join(os.getcwd(), "dist", "public", "assets")
        return send_from_directory(assets_dir, filename)
    except Exception as e:
        return jsonify({"error": "Asset not found", "file": filename}), 404

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
    return jsonify({"platform": "railway", "app": "sportedge-pro"})

@app.route("/<path:path>")
def catch_all(path):
    try:
        static_dir = os.path.join(os.getcwd(), "dist", "public")
        return send_from_directory(static_dir, "index.html")
    except Exception:
        return jsonify({"error": "Route not found", "path": path}), 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
