#!/bin/bash

# NFL Analytics Empire - One-Command Launcher
# Run this to start everything

clear

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║       🏈 NFL ANALYTICS EMPIRE 🏈                             ║
║                                                              ║
║       Building Your NFL Betting Authority                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

echo "🚀 Starting your NFL Analytics Empire..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Navigate to empire directory
cd ~/Desktop/nfl-analytics-empire

# Run master control
python3 empire_control.py
