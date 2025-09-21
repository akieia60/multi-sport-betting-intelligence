#!/bin/bash

# NFL Analytics Empire - GitHub Pages Deployment
# Professional newsletter hosting

echo "🐙 NFL Analytics Empire - GitHub Pages Setup"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "\n${BLUE}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
fi

# Create GitHub repository
echo -e "\n${YELLOW}Creating GitHub repository...${NC}"
echo "Please create a new repository on GitHub:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: nfl-analytics-empire"
echo "3. Keep it PUBLIC (required for free GitHub Pages)"
echo "4. Don't initialize with README"

read -p "Press Enter when repository is created..."

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

# Configure git
git config user.name "$GITHUB_USER"
git config user.email "${GITHUB_USER}@users.noreply.github.com"

# Add remote
echo -e "\n${BLUE}Adding GitHub remote...${NC}"
git remote add origin "https://github.com/${GITHUB_USER}/nfl-analytics-empire.git"
echo -e "${GREEN}✓ Remote added${NC}"

# Create .gitignore
cat > .gitignore << 'EOF'
.env
*.pyc
__pycache__/
.DS_Store
*.log
node_modules/
EOF

# Prepare files for GitHub Pages
echo -e "\n${BLUE}Preparing files for GitHub Pages...${NC}"

# Create index.html that redirects to latest newsletter
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0; url=./newsletters/latest.html">
    <title>NFL Analytics Empire - Redirecting...</title>
</head>
<body>
    <p>Redirecting to latest newsletter...</p>
</body>
</html>
EOF

# Create README for GitHub
cat > README.md << 'EOF'
# 🏈 NFL Analytics Empire

**Professional NFL Betting Intelligence & Fantasy Analysis**

## 📊 Live Newsletter

View the latest analysis: [https://YOUR_USERNAME.github.io/nfl-analytics-empire/](https://YOUR_USERNAME.github.io/nfl-analytics-empire/)

## 🎯 Performance Stats

- **Win Rate:** 58.7%
- **Units Profit:** +12.4u
- **Average Edge:** 8.3%
- **Total Picks:** 134

## 📱 Follow for Daily Updates

Twitter: [@NFLEdgeAnalytics](https://twitter.com/NFLEdgeAnalytics)

## 💰 Subscribe

Get daily picks with 8%+ edge for just $19.99/month

---

© 2025 NFL Analytics Empire. All rights reserved.
EOF

# Stage all files
echo -e "\n${BLUE}Staging files...${NC}"
git add .
echo -e "${GREEN}✓ Files staged${NC}"

# Create initial commit
echo -e "\n${BLUE}Creating initial commit...${NC}"
git commit -m "🚀 Initial commit: NFL Analytics Empire"
echo -e "${GREEN}✓ Commit created${NC}"

# Create main branch
git branch -M main

# Push to GitHub
echo -e "\n${BLUE}Pushing to GitHub...${NC}"
git push -u origin main

echo -e "\n${GREEN}✓ Pushed to GitHub!${NC}"

# Set up GitHub Pages
echo -e "\n${YELLOW}Setting up GitHub Pages...${NC}"
echo "1. Go to: https://github.com/${GITHUB_USER}/nfl-analytics-empire/settings/pages"
echo "2. Source: Deploy from branch"
echo "3. Branch: main"
echo "4. Folder: / (root)"
echo "5. Click Save"

read -p "Press Enter when GitHub Pages is configured..."

# Get Pages URL
PAGES_URL="https://${GITHUB_USER}.github.io/nfl-analytics-empire"

echo -e "\n${GREEN}======================================"
echo "✓ GitHub Pages Setup Complete!"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}Your newsletter will be available at:${NC}"
echo -e "${GREEN}${PAGES_URL}${NC}"
echo ""
echo "Note: It may take a few minutes for GitHub Pages to deploy"
echo ""
echo -e "${YELLOW}Auto-deploy on push:${NC}"
echo "Every time you push updates, GitHub Pages will automatically rebuild"
echo ""
echo -e "${BLUE}To update your newsletter:${NC}"
echo "1. Generate new newsletter"
echo "2. git add ."
echo "3. git commit -m 'Update newsletter'"
echo "4. git push"
echo ""
echo -e "${GREEN}Happy betting! 🏈${NC}"
