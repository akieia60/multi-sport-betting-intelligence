#!/usr/bin/env python3

from flask import Flask, send_from_directory, jsonify, request
import os
import sys
import mimetypes

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our engines
try:
    from twitter_engine import TwitterEngine
    from data_engine import DataEngine
    from newsletter_engine import NewsletterEngine
    from config import Config
except ImportError as e:
    print(f"Warning: Could not import engines: {e}")
    TwitterEngine = None
    DataEngine = None
    NewsletterEngine = None
    Config = None

# Set up proper MIME types
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Create Flask app with static file serving
app = Flask(__name__)

# Configure static file serving
static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'client', 'dist')
print(f"Static folder path: {static_folder}")

# Configure CORS for API routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Serve static assets (JS, CSS, images)
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    assets_dir = os.path.join(static_folder, 'assets')
    return send_from_directory(assets_dir, filename)

# Serve React App
@app.route('/')
def serve_react_app():
    return send_from_directory(static_folder, 'index.html')

# Health check endpoint
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy', 
        'platform': 'SportEdge Pro',
        'version': '2.0',
        'services': {
            'twitter': TwitterEngine is not None,
            'data': DataEngine is not None,
            'newsletter': NewsletterEngine is not None
        }
    })

# API Routes
@app.route('/api/status')
def api_status():
    return jsonify({
        'platform': 'SportEdge Pro - Multi-Sport Betting Intelligence',
        'status': 'operational',
        'features': [
            'SportsDataIO Integration',
            'Twitter Automation', 
            'Advanced Parlay Builder',
            'Revenue Ready'
        ],
        'deployment': 'Railway Production'
    })

@app.route('/api/twitter/status')
def twitter_status():
    if TwitterEngine is None:
        return jsonify({'error': 'Twitter engine not available'}), 503
    
    try:
        # Initialize Twitter engine and check status
        twitter = TwitterEngine()
        return jsonify({
            'status': 'connected',
            'ready': True,
            'message': 'Twitter automation ready'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'ready': False,
            'message': str(e)
        }), 500

@app.route('/api/data/status')
def data_status():
    if DataEngine is None:
        return jsonify({'error': 'Data engine not available'}), 503
    
    try:
        # Initialize data engine and check status
        data = DataEngine()
        return jsonify({
            'status': 'connected',
            'ready': True,
            'message': 'SportsDataIO integration ready'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'ready': False,
            'message': str(e)
        }), 500

@app.route('/api/newsletter/status')
def newsletter_status():
    if NewsletterEngine is None:
        return jsonify({'error': 'Newsletter engine not available'}), 503
    
    try:
        # Initialize newsletter engine and check status
        newsletter = NewsletterEngine()
        return jsonify({
            'status': 'connected',
            'ready': True,
            'message': 'Newsletter system ready'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'ready': False,
            'message': str(e)
        }), 500

# Twitter API endpoints
@app.route('/api/twitter/post', methods=['POST'])
def twitter_post():
    if TwitterEngine is None:
        return jsonify({'error': 'Twitter engine not available'}), 503
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        twitter = TwitterEngine()
        result = twitter.post_tweet(message)
        
        return jsonify({
            'success': True,
            'message': 'Tweet posted successfully',
            'result': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Data API endpoints
@app.route('/api/data/games')
def get_games():
    if DataEngine is None:
        return jsonify({'error': 'Data engine not available'}), 503
    
    try:
        data = DataEngine()
        games = data.get_current_games()
        
        return jsonify({
            'success': True,
            'games': games
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/data/odds')
def get_odds():
    if DataEngine is None:
        return jsonify({'error': 'Data engine not available'}), 503
    
    try:
        data = DataEngine()
        odds = data.get_betting_odds()
        
        return jsonify({
            'success': True,
            'odds': odds
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Catch all route for React Router (must be last)
@app.route('/<path:path>')
def serve_react_routes(path):
    # If it's an API route, return 404
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # If it's a static file that exists, serve it
    if '.' in path:
        try:
            return send_from_directory(static_folder, path)
        except:
            pass
    
    # Otherwise, serve the React app (for client-side routing)
    return send_from_directory(static_folder, 'index.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    # For API routes, return JSON error
    if request.path.startswith('/api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # For all other routes, serve the React app
    return send_from_directory(static_folder, 'index.html')

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 SportEdge Pro starting on port {port}")
    print(f"📁 Serving React app from: {static_folder}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
