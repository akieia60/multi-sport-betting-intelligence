#!/usr/bin/env python3

from flask import Flask, send_from_directory, jsonify, request
import os
import mimetypes

# Set up proper MIME types
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Create Flask app
app = Flask(__name__)

# Configure static file serving
static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'client', 'dist')
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
    print(f"Serving asset: {filename} from {assets_dir}")
    return send_from_directory(assets_dir, filename)

# Health check endpoint
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy', 
        'platform': 'SportEdge Pro',
        'version': '2.1',
        'static_folder': static_folder,
        'static_exists': os.path.exists(static_folder)
    })

# API status endpoint
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
        'deployment': 'Railway Production',
        'version': '2.1'
    })

# Serve React App
@app.route('/')
def serve_react_app():
    index_path = os.path.join(static_folder, 'index.html')
    print(f"Serving index.html from: {index_path}")
    print(f"Index file exists: {os.path.exists(index_path)}")
    
    if os.path.exists(index_path):
        return send_from_directory(static_folder, 'index.html')
    else:
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>SportEdge Pro - Loading...</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    background: #1a1a1a; 
                    color: white; 
                    text-align: center; 
                    padding: 50px; 
                }}
                .status {{ background: #333; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 600px; }}
            </style>
        </head>
        <body>
            <h1>🚀 SportEdge Pro</h1>
            <div class="status">
                <h2>Platform Status</h2>
                <p><strong>API:</strong> ✅ Online</p>
                <p><strong>Static Folder:</strong> {static_folder}</p>
                <p><strong>Index Exists:</strong> {os.path.exists(index_path)}</p>
                <p><strong>Directory Contents:</strong></p>
                <pre>{os.listdir(static_folder) if os.path.exists(static_folder) else 'Directory not found'}</pre>
            </div>
            <p>Your multi-sport betting intelligence platform is initializing...</p>
        </body>
        </html>
        """

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
    index_path = os.path.join(static_folder, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_folder, 'index.html')
    else:
        return serve_react_app()

# Error handlers
@app.errorhandler(404)
def not_found(error):
    # For API routes, return JSON error
    if request.path.startswith('/api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # For all other routes, serve the React app
    return serve_react_app()

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'details': str(error)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 SportEdge Pro starting on port {port}")
    print(f"📁 Serving React app from: {static_folder}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
