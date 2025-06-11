const express = require('express');
const dns = require('dns');
const { URL } = require('url');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const URLModel = mongoose.model('URL', urlSchema);

// Helper function to validate URL
const validateUrl = async (urlString) => {
  try {
    const urlObj = new URL(urlString);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Verify DNS lookup
    await new Promise((resolve, reject) => {
      dns.lookup(urlObj.hostname, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return true;
  } catch (err) {
    return false;
  }
};

// Routes
app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;
  
  if (!originalUrl || !(await validateUrl(originalUrl))) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if URL already exists
    const existingUrl = await URLModel.findOne({ original_url: originalUrl });
    
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    
    // Get next short URL number
    const count = await URLModel.countDocuments();
    const shortUrl = count + 1;
    
    // Create new URL entry
    const newUrl = new URLModel({
      original_url: originalUrl,
      short_url: shortUrl
    });
    
    await newUrl.save();
    
    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const urlDoc = await URLModel.findOne({ short_url: req.params.short_url });
    
    if (!urlDoc) {
      return res.status(404).json({ error: 'No short URL found for the given input' });
    }
    
    res.redirect(urlDoc.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});