from flask import Flask, send_from_directory, jsonify
import subprocess
import os

app = Flask(__name__)

# Serve static files
@app.route('/')
@app.route('/<path:path>')
def serve_static(path='index.html'):
    try:
        return send_from_directory('dist/public', path)
    except:
        return send_from_directory('dist/public', 'index.html')

# API proxy (placeholder)
@app.route('/api/<path:path>')
def api_proxy(path):
    return jsonify({"message": "API endpoint", "path": path})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
