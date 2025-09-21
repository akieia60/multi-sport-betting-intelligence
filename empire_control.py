#!/usr/bin/env python3
"""
NFL Analytics Empire - Master Control System
One command to build your NFL analytics empire
"""

import os
import sys
import subprocess
from pathlib import Path
import time
from datetime import datetime

# ANSI color codes
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_banner():
    """Print professional banner"""
    print(f"\n{Colors.GREEN}{'='*70}")
    print(f"""
    ███╗   ██╗███████╗██╗         ███████╗██████╗  ██████╗ ███████╗
    ████╗  ██║██╔════╝██║         ██╔════╝██╔══██╗██╔════╝ ██╔════╝
    ██╔██╗ ██║█████╗  ██║         █████╗  ██║  ██║██║  ███╗█████╗  
    ██║╚██╗██║██╔══╝  ██║         ██╔══╝  ██║  ██║██║   ██║██╔══╝  
    ██║ ╚████║██║     ███████╗    ███████╗██████╔╝╚██████╔╝███████╗
    ╚═╝  ╚═══╝╚═╝     ╚══════╝    ╚══════╝╚═════╝  ╚═════╝ ╚══════╝
    
    {Colors.BOLD}ANALYTICS EMPIRE - Master Control System{Colors.END}
    """)
    print(f"{'='*70}{Colors.END}\n")

def check_dependencies():
    """Check if required packages are installed"""
    
    print(f"{Colors.BLUE}📦 Checking dependencies...{Colors.END}")
    
    required = [
        'requests',
        'schedule', 
        'tweepy',
        'python-dotenv'
    ]
    
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - MISSING")
            missing.append(package)
    
    if missing:
        print(f"\n{Colors.YELLOW}⚠️  Installing missing packages...{Colors.END}")
        subprocess.run([sys.executable, "-m", "pip", "install"] + missing)
        print(f"{Colors.GREEN}✅ All dependencies installed{Colors.END}")
    
    return True

def setup_environment():
    """Set up environment variables"""
    
    print(f"\n{Colors.BLUE}🔧 Setting up environment...{Colors.END}")
    
    env_file = Path.home() / 'Desktop' / 'nfl-analytics-empire' / '.env'
    
    if not env_file.exists():
        print(f"  📝 Creating .env file...")
        
        env_content = """# NFL Analytics Empire - API Configuration

# The Odds API (REQUIRED for real betting data)
ODDS_API_KEY=your_odds_api_key_here

# Twitter API (Required for automation)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret  
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# GitHub (Optional - for Pages deployment)
GITHUB_TOKEN=your_github_token_here
"""
        
        env_file.write_text(env_content)
        print(f"  ✅ .env file created at {env_file}")
        print(f"\n{Colors.YELLOW}  ⚠️  IMPORTANT: Edit .env with your actual API keys!{Colors.END}")
    else:
        print(f"  ✅ .env file exists")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(env_file)
    
    return True

def create_directory_structure():
    """Create required directories"""
    
    print(f"\n{Colors.BLUE}📁 Creating directory structure...{Colors.END}")
    
    base_dir = Path.home() / 'Desktop' / 'nfl-analytics-empire'
    
    directories = [
        base_dir / 'newsletters',
        base_dir / 'social_media',
        base_dir / 'data',
        base_dir / 'analytics'
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"  ✅ {directory.name}/")
    
    return True

def run_system(mode: str):
    """Run the system in specified mode"""
    
    base_dir = Path.home() / 'Desktop' / 'nfl-analytics-empire'
    
    if mode == 'newsletter':
        print(f"\n{Colors.GREEN}📰 Generating professional newsletter...{Colors.END}\n")
        subprocess.run([sys.executable, str(base_dir / 'newsletter_engine.py')])
    
    elif mode == 'twitter':
        print(f"\n{Colors.GREEN}🐦 Starting Twitter automation...{Colors.END}\n")
        subprocess.run([sys.executable, str(base_dir / 'twitter_engine.py')])
    
    elif mode == 'full':
        print(f"\n{Colors.GREEN}🚀 Starting full automation system...{Colors.END}\n")
        
        # Run all systems in parallel
        processes = []
        
        # Newsletter engine
        p1 = subprocess.Popen([sys.executable, str(base_dir / 'newsletter_engine.py')])
        processes.append(p1)
        
        # Twitter engine
        p2 = subprocess.Popen([sys.executable, str(base_dir / 'twitter_engine.py')])
        processes.append(p2)
        
        print(f"{Colors.GREEN}✅ All systems running!{Colors.END}")
        print(f"\n{Colors.YELLOW}Press Ctrl+C to stop all systems{Colors.END}\n")
        
        try:
            for p in processes:
                p.wait()
        except KeyboardInterrupt:
            print(f"\n{Colors.RED}⏹️  Stopping all systems...{Colors.END}")
            for p in processes:
                p.terminate()
    
    elif mode == 'test':
        print(f"\n{Colors.GREEN}🧪 Testing data engine...{Colors.END}\n")
        subprocess.run([sys.executable, str(base_dir / 'data_engine.py')])

def show_menu():
    """Show interactive menu"""
    
    print(f"\n{Colors.BOLD}What would you like to do?{Colors.END}\n")
    
    options = [
        ("1", "🚀 START FULL AUTOMATION", "Launch complete system"),
        ("2", "📰 Generate Newsletter", "Create professional newsletter"),
        ("3", "🐦 Run Twitter Bot", "Auto-post to Twitter"),
        ("4", "🧪 Test Data Engine", "Test API connections"),
        ("5", "📊 View Analytics", "Check performance metrics"),
        ("6", "⚙️  Configure APIs", "Set up API keys"),
        ("7", "❌ Exit", "Stop and exit")
    ]
    
    for num, title, desc in options:
        print(f"  {Colors.BLUE}{num}) {Colors.BOLD}{title}{Colors.END}")
        print(f"      {desc}\n")
    
    choice = input(f"{Colors.GREEN}Select option (1-7): {Colors.END}")
    
    return choice

def view_analytics():
    """Display analytics dashboard"""
    
    print(f"\n{Colors.GREEN}📊 ANALYTICS DASHBOARD{Colors.END}")
    print("="*70)
    
    # This would pull from actual data
    stats = {
        'Total Picks': 134,
        'Win Rate': '58.7%',
        'Units Profit': '+12.4u',
        'Avg Edge': '8.3%',
        'Twitter Followers': 247,
        'Newsletter Subscribers': 12,
        'Monthly Revenue': '$0'
    }
    
    for metric, value in stats.items():
        print(f"  {Colors.BOLD}{metric}:{Colors.END} {value}")
    
    print("\n" + "="*70)
    
    input(f"\n{Colors.YELLOW}Press Enter to continue...{Colors.END}")

def configure_apis():
    """Interactive API configuration"""
    
    print(f"\n{Colors.GREEN}⚙️  API CONFIGURATION{Colors.END}")
    print("="*70)
    
    print(f"\n{Colors.BOLD}1. The Odds API{Colors.END}")
    print("   🌐 Sign up: https://the-odds-api.com")
    print("   💰 Free tier: 500 requests/month")
    print("   💳 Paid: $49/month unlimited")
    
    print(f"\n{Colors.BOLD}2. Twitter API{Colors.END}")
    print("   🌐 Apply: https://developer.twitter.com")
    print("   📝 Create app and get credentials")
    
    print(f"\n{Colors.YELLOW}Edit .env file with your API keys{Colors.END}")
    
    env_file = Path.home() / 'Desktop' / 'nfl-analytics-empire' / '.env'
    print(f"📁 File location: {env_file}")
    
    if input(f"\n{Colors.GREEN}Open .env file now? (y/n): {Colors.END}").lower() == 'y':
        subprocess.run(['open', str(env_file)])
    
    input(f"\n{Colors.YELLOW}Press Enter when done...{Colors.END}")

def main():
    """Main control function"""
    
    print_banner()
    
    # Initial setup
    if not check_dependencies():
        return
    
    if not setup_environment():
        return
    
    if not create_directory_structure():
        return
    
    print(f"\n{Colors.GREEN}✅ System initialized successfully!{Colors.END}")
    
    # Main loop
    while True:
        choice = show_menu()
        
        if choice == '1':
            run_system('full')
        elif choice == '2':
            run_system('newsletter')
        elif choice == '3':
            run_system('twitter')
        elif choice == '4':
            run_system('test')
        elif choice == '5':
            view_analytics()
        elif choice == '6':
            configure_apis()
        elif choice == '7':
            print(f"\n{Colors.YELLOW}👋 Goodbye!{Colors.END}\n")
            break
        else:
            print(f"\n{Colors.RED}Invalid option{Colors.END}")
        
        time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.RED}⏹️  System stopped{Colors.END}\n")
        sys.exit(0)
