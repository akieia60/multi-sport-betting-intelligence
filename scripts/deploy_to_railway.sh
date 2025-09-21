#!/usr/bin/env zsh
set -euo pipefail

# Deployment helper script following user's plan. Run from repo root.
ROOT="$HOME/multi-sport-betting-intelligence"
cd "$ROOT"

echo "Working directory: $(pwd)"
ls -1

ts=$(date +%Y%m%d-%H%M%S)
if [ -f app.py ]; then
  echo "Backing up existing app.py to app.py.bak.$ts"
  cp app.py "app.py.bak.$ts"
fi

echo "Writing new app.py"
cat > app.py <<'PY'
from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder="dist", static_url_path="")

@app.route("/")
def root_index():
  return send_from_directory(app.static_folder, "index.html")

@app.route("/api/health")
def health():
  return jsonify({"status": "ok"})

@app.route("/api/status")
def status():
  return jsonify({"platform": "railway", "app": "sportedge-pro"})

@app.errorhandler(404)
def not_found(e):
  try:
    return send_from_directory(app.static_folder, "index.html")
  except Exception:
    return jsonify({"error": "Not found"}), 404

if __name__ == "__main__":
  port = int(os.environ.get("PORT", 8080))
  app.run(host="0.0.0.0", port=port)
PY

echo "Checking for React build outputs"
BUILD_OK=false
if [ -f client/dist/index.html ]; then
  echo "Found client/dist/index.html"
  BUILD_OK=true
elif [ -f dist/index.html ]; then
  echo "Found repo-root dist/index.html"
  BUILD_OK=true
fi

if [ "$BUILD_OK" = false ]; then
  echo "No existing build found — building React app inside client/"
  cd client
  npm install
  npm run build
  cd ..
fi

# After build, prefer client/dist if present; otherwise use repo-root dist
if [ -d client/dist ]; then
  echo "Copying client/dist => ./dist"
  rm -rf dist || true
  cp -R client/dist dist
elif [ -d dist ]; then
  echo "Using existing repo-root ./dist (build output already there)"
else
  echo "ERROR: build output not found in client/dist or ./dist"
  exit 1
fi

echo "dist contents:"
ls -la dist | sed -n '1,120p' || true

echo "Ensuring Procfile contains gunicorn start line"
if [ ! -f Procfile ]; then
  echo 'web: gunicorn app:app --bind 0.0.0.0:$PORT' > Procfile
else
  if ! grep -q 'gunicorn app:app' Procfile; then
    echo 'web: gunicorn app:app --bind 0.0.0.0:$PORT' > Procfile
  fi
fi

echo "Procfile contents:"
cat Procfile || true

echo "Configuring git author"
git config user.name "Akieia Davis"
git config user.email "akieia60@gmail.com"

echo "Staging changes"
git add app.py Procfile || true

echo "Committing changes"
git commit -m "Serve React build from Flask; ensure gunicorn Procfile" || echo "No changes to commit"

echo "Pushing to origin main (if permitted)"
git push origin main || echo "Push failed or no remote configured"

echo "Linking and deploying with Railway CLI (interactive prompts may appear)"
railway link || true
railway status || true
railway up || true

echo "Deployment script finished"
