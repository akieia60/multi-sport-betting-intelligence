#!/usr/bin/env bash
set -euo pipefail

say() { printf "\n▶ %s\n" "$*"; }

# 0) Make sure we're in the project root; clone if needed
if [ ! -f "app.py" ] || [ ! -d ".git" ]; then
  cd "$HOME"
  if [ -d "multi-sport-betting-intelligence" ]; then
    cd "multi-sport-betting-intelligence"
  else
    say "Cloning repo…"
    if ! command -v gh >/dev/null 2>&1; then
      echo "GitHub CLI (gh) not found. Install with: brew install gh"
      exit 1
    fi
    gh auth status >/dev/null 2>&1 || gh auth login
    gh repo clone akieia60/multi-sport-betting-intelligence
    cd multi-sport-betting-intelligence
  fi
fi

say "Project root: $PWD"

# 1) Backup and patch app.py to serve the React build from /dist
if [ -f app.py ]; then
  ts=$(date +%Y%m%d-%H%M%S)
  say "Backing up app.py -> app.py.bak.$ts"
  cp app.py "app.py.bak.$ts"
fi

say "Writing app.py (serves ./dist)"
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

# 2) Build the React app if needed
say "Checking for build outputs (client/dist or ./dist)"
BUILD_OK=false
if [ -f client/dist/index.html ]; then
  say "Found client/dist/index.html"
  BUILD_OK=true
elif [ -f dist/index.html ]; then
  say "Found repo-root dist/index.html"
  BUILD_OK=true
fi

if [ "$BUILD_OK" = false ]; then
  if [ -d client ]; then
    say "Building client: npm install && npm run build (in client/)"
    pushd client >/dev/null
    npm install
    npm run build
    popd >/dev/null
  else
    echo "No client/ directory found and no dist/ build present. Aborting."
    exit 1
  fi
fi

# 3) Normalize build output into ./dist
if [ -d client/dist ]; then
  say "Copying client/dist -> ./dist"
  rm -rf dist || true
  cp -R client/dist dist
elif [ -d dist ]; then
  say "Using existing ./dist"
else
  echo "ERROR: build output not found in client/dist or ./dist"
  exit 1
fi

say "dist contents:" 
ls -la dist | sed -n '1,120p' || true

# 4) Ensure Procfile will make gunicorn available and start the app
say "Ensuring Procfile starts gunicorn after installing Python deps"
cat > Procfile <<'PF'
web: bash -lc "python -m pip install --no-cache-dir -r requirements.txt && gunicorn app:app --bind 0.0.0.0:$PORT"
PF

say "Procfile contents:" 
cat Procfile

# 5) Commit and push changes (small, descriptive commits)
say "Preparing git commit"
git config user.name "Akieia Davis"
git config user.email "akieia60@gmail.com"

git add app.py Procfile dist || true
if git diff --staged --quiet; then
  say "No staged changes to commit"
else
  git commit -m "Serve React build from Flask (./dist); ensure Procfile installs Python deps and starts gunicorn"
fi

say "Pushing to origin main (if configured)"
git push origin main || say "Push failed or no remote configured; please push manually"

# 6) Link and deploy with Railway CLI (interactive selection expected)
say "Running: railway link (choose: Workspace 'Akieia Davis\'s Projects' -> Project 'attractive-appreciation' -> Environment 'production' -> Service 'multi-sport-betting-intelligence')"
railway link || say "railway link exited non-zero or was cancelled"

say "Running: railway up (this will build & deploy)"
railway up || say "railway up exited non-zero"

say "Done. When deployment finishes, test: / , /api/health , /api/status"

echo
echo "If the container fails because 'gunicorn: command not found', make sure 'gunicorn' is present in requirements.txt and that Railway installs Python packages before starting (Procfile above installs them)."
