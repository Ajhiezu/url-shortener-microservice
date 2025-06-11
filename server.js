const express = require('express');
const dns = require('dns');
const { URL } = require('url');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Database
const urlDatabase = [];
let urlCounter = 1;

// Validasi URL sesuai test case
const validateUrl = (urlString) => {
  try {
    // Harus dimulai dengan http:// atau https://
    if (!/^https?:\/\//i.test(urlString)) {
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

  if (!validateUrl(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Cek jika URL sudah ada
  const existingUrl = urlDatabase.find(item => item.original_url === inputUrl);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }

  // Tambahkan URL baru
  const newUrl = {
    original_url: inputUrl,
    short_url: urlCounter
  };

  urlDatabase.push(newUrl);
  urlCounter++;

  res.json({
    original_url: newUrl.original_url,
    short_url: newUrl.short_url
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = Number(req.params.short_url);
  const urlEntry = urlDatabase.find(item => item.short_url === shortUrl);

  if (urlEntry) {
    return res.redirect(302, urlEntry.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

// Route untuk test
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});