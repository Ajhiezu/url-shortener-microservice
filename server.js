const express = require('express');
const { URL } = require('url');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database sederhana
const urlDatabase = [];
let urlCounter = 1;

// Fungsi validasi URL yang diperbaiki
const isValidUrl = (urlString) => {
  try {
    // Harus dimulai dengan http:// atau https://
    if (!urlString.match(/^https?:\/\//i)) {
      return false;
    }
    
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

// Route untuk POST URL
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
    short_url: urlCounter
  };

  urlDatabase.push(newEntry);
  urlCounter++;

  res.json({
    original_url: newEntry.original_url,
    short_url: newEntry.short_url
  });
});

// Route untuk redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

// Route untuk frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});