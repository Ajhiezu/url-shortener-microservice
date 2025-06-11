const express = require('express');
const dns = require('dns');
const { URL } = require('url');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Database sederhana
const urlDatabase = [];
let counter = 1;

// Fungsi validasi URL yang lebih robust
const isValidUrl = (urlString) => {
  try {
    // Harus memiliki protocol http/https
    if (!urlString.match(/^https?:\/\//)) {
      return false;
    }
    
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

// Routes
app.post('/api/shorturl', (req, res) => {
  const { url: inputUrl } = req.body;

  if (!isValidUrl(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Cek jika URL sudah ada
  const existingEntry = urlDatabase.find(entry => entry.original_url === inputUrl);
  if (existingEntry) {
    return res.json({
      original_url: existingEntry.original_url,
      short_url: existingEntry.short_url
    });
  }

  // Buat entry baru
  const newEntry = {
    original_url: inputUrl,
    short_url: counter
  };

  urlDatabase.push(newEntry);
  counter++;

  res.json({
    original_url: newEntry.original_url,
    short_url: newEntry.short_url
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});