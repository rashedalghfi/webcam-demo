/*
 * Simple Node.js backend to receive an image sent from the frontend.
 *
 * This example uses Express to set up an HTTP server with a single
 * POST endpoint at `/upload`. The endpoint accepts a JSON object with
 * an `image` property containing a data URL (base64 encoded PNG). It
 * decodes the image and writes it to the local filesystem. You can
 * adapt this logic to forward the image via email, store it in a
 * database, or perform further processing.
 *
 * To run this server locally:
 *   1. Ensure Node.js is installed.
 *   2. Install dependencies: npm install express
 *   3. Execute: node backend.js
 *   4. Access via: http://localhost:3000
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Increase the payload limit to handle large base64 images
app.use(express.json({ limit: '15mb' }));

/**
 * POST /upload
 * Receives JSON { image: "data:image/png;base64,..." }
 * Saves the image to a file and returns a success message.
 */
app.post('/upload', (req, res) => {
  const { image } = req.body;
  if (typeof image !== 'string' || !image.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Invalid image format' });
  }
  try {
    // Extract the base64 encoded part after the comma
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    // Use a timestamped filename to avoid collisions
    const filename = `photo-${Date.now()}.png`;
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved image to ${outputPath}`);
    return res.json({ status: 'ok', file: filename });
  } catch (err) {
    console.error('Failed to write image:', err);
    return res.status(500).json({ error: 'Failed to save image' });
  }
});

// A simple health check endpoint
app.get('/', (req, res) => {
  res.send('Image upload server is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
