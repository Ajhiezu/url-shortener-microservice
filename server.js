require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory storage
let urlDatabase = [];
let urlCounter = 1;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// URL Shortener API endpoint
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  try {
    // Validate URL format
    const parsedUrl = new URL(originalUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.json({ error: 'invalid url' });
    }
    
    // Verify URL exists using DNS lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      
      // Check if URL already exists
      const existingUrl = urlDatabase.find(item => item.original_url === originalUrl);
      
      if (existingUrl) {
        return res.json({
          original_url: existingUrl.original_url,
          short_url: existingUrl.short_url
        });
      }
      
      // Create new short URL
      const newUrl = {
        original_url: originalUrl,
        short_url: urlCounter
      };
      
      urlDatabase.push(newUrl);
      urlCounter++;
      
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// Redirect short URL to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  
  const urlDoc = urlDatabase.find(item => item.short_url === shortUrl);
  
  if (urlDoc) {
    return res.redirect(urlDoc.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});