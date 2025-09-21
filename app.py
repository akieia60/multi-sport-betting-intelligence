from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

@app.route("/")
def root_index():
    static_dir = "dist/static" if os.path.exists("dist/static") else "dist/public"
    return send_from_directory(static_dir, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    static_dir = "dist/static" if os.path.exists("dist/static") else "dist/public"
    try:
        return send_from_directory(static_dir, path)
    except Exception:
        return send_from_directory(static_dir, "index.html")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
    return jsonify({"platform": "railway", "app": "sportedge-pro"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
