const express = require('express');
const { URL } = require('url');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database
const urlDatabase = [];
let counter = 1;

// Validasi URL
const isValidUrl = (urlString) => {
  try {
    if (!urlString.match(/^https?:\/\//i)) {
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
    return res.json(existingEntry);
  }

  // Buat entry baru dengan counter acak besar
  const newEntry = {
    original_url: inputUrl,
    short_url: Math.floor(Math.random() * 90000) + 10000 // Generate 5-digit number
  };

  urlDatabase.push(newEntry);
  res.json(newEntry);
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});

// Frontend route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});