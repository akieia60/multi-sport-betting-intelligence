#!/usr/bin/env python3
"""
Flask wrapper for the multi-sport betting intelligence platform
This serves the built React frontend and proxies API calls to the Node.js backend
"""

import os
import subprocess
import threading
import time
import requests
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variable to track Node.js process
node_process = None

def start_node_server():
    """Start the Node.js server in the background"""
    global node_process
    try:
        # Change to the project directory
        os.chdir('/home/ubuntu/multi-sport-betting-intelligence')
        
        # Start the Node.js server
        node_process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=dict(os.environ, NODE_ENV='production')
        )
        
        # Wait a moment for the server to start
        time.sleep(5)
        
        print("✅ Node.js server started successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to start Node.js server: {e}")
        return False

def wait_for_node_server():
    """Wait for Node.js server to be ready"""
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = requests.get('http://localhost:5000/api/health', timeout=2)
            if response.status_code == 200:
                print("✅ Node.js server is ready")
                return True
        except:
            pass
        time.sleep(1)
    return False

# Start Node.js server in a background thread
def init_node_server():
    if start_node_server():
        wait_for_node_server()

# Initialize the Node.js server
threading.Thread(target=init_node_server, daemon=True).start()

@app.route('/')
def serve_index():
    """Serve the main React app"""
    try:
        return send_from_directory('/home/ubuntu/multi-sport-betting-intelligence/client/dist', 'index.html')
    except Exception as e:
        return f"Error serving index: {e}", 500

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve static assets"""
    try:
        return send_from_directory('/home/ubuntu/multi-sport-betting-intelligence/client/dist/assets', filename)
    except Exception as e:
        return f"Asset not found: {filename}", 404

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the React build or fallback to index.html for React Router"""
    # Skip API routes
    if path.startswith('api/'):
        return "API route - should be handled by proxy", 404
    
    try:
        # Try to serve the file directly
        return send_from_directory('/home/ubuntu/multi-sport-betting-intelligence/client/dist', path)
    except:
        # If file not found, serve index.html for React Router (SPA routing)
        try:
            return send_from_directory('/home/ubuntu/multi-sport-betting-intelligence/client/dist', 'index.html')
        except Exception as e:
            return f"Error serving app: {e}", 500

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(path):
    """Proxy API calls to the Node.js backend"""
    try:
        # Forward the request to the Node.js server
        url = f'http://localhost:5000/api/{path}'
        
        if request.method == 'GET':
            response = requests.get(url, params=request.args, timeout=30)
        elif request.method == 'POST':
            response = requests.post(url, json=request.get_json(), params=request.args, timeout=30)
        elif request.method == 'PUT':
            response = requests.put(url, json=request.get_json(), params=request.args, timeout=30)
        elif request.method == 'DELETE':
            response = requests.delete(url, params=request.args, timeout=30)
        
        # Return the response from Node.js
        return jsonify(response.json()) if response.headers.get('content-type', '').startswith('application/json') else response.text, response.status_code
        
    except Exception as e:
        return jsonify({'error': f'Backend unavailable: {str(e)}'}), 503

@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        # Check if Node.js backend is responding
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            return jsonify({
                'status': 'healthy',
                'frontend': 'ok',
                'backend': 'ok',
                'message': 'Multi-sport betting intelligence platform is running'
            })
    except:
        pass
    
    return jsonify({
        'status': 'degraded',
        'frontend': 'ok',
        'backend': 'unavailable',
        'message': 'Frontend running, backend starting up'
    }), 503

if __name__ == '__main__':
    print("🚀 Starting Multi-Sport Betting Intelligence Platform")
    print("📊 Frontend: React + TypeScript")
    print("🔧 Backend: Node.js + Express")
    print("🐦 Twitter: Integrated and Ready")
    
    # Run Flask on 0.0.0.0 to allow external access
    app.run(host='0.0.0.0', port=8080, debug=False)
