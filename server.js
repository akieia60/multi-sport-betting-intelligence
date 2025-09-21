import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// API routes - proxy to your backend
app.use('/api', async (req, res) => {
  try {
    // Import and start your backend server
    const { default: backendApp } = await import('./dist/index.js');
    // Forward the request to your backend
    res.json({ message: 'Backend integration needed' });
  } catch (error) {
    res.status(500).json({ error: 'Backend not available' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SportEdge Pro deployed on port ${PORT}`);
});
