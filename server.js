const express = require('express');
const dns = require('dns');
const url = require('url');
const { promisify } = require('util');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database simulation
let urlDatabase = [];
let urlCounter = 1;

// Helper function to validate URL
const validateUrl = async (inputUrl) => {
  try {
    // Check if URL has valid protocol
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = 'http://' + inputUrl;
    }

    const parsedUrl = new URL(inputUrl);
    const hostname = parsedUrl.hostname;

    // DNS lookup to verify the domain exists
    await promisify(dns.lookup)(hostname);
    return inputUrl;
  } catch (err) {
    return null;
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl', async (req, res) => {
  const { url: inputUrl } = req.body;

  try {
    const validatedUrl = await validateUrl(inputUrl);
    
    if (!validatedUrl) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists in database
    const existingUrl = urlDatabase.find(entry => entry.original_url === validatedUrl);
    
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    // Add new URL to database
    const newUrl = {
      original_url: validatedUrl,
      short_url: urlCounter
    };

    urlDatabase.push(newUrl);
    urlCounter++;

    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const urlEntry = urlDatabase.find(entry => entry.short_url == short_url);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});