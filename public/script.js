document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('url_input').value;
  const resultDiv = document.getElementById('result');
  
  try {
    const response = await fetch('/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlInput })
    });
    
    const data = await response.json();
    
    if (data.error) {
      resultDiv.innerHTML = `<div class="error">${data.error}</div>`;
      return;
    }
    
    const fullShortUrl = `${window.location.origin}/api/shorturl/${data.short_url}`;
    
    resultDiv.innerHTML = `
      <div class="result">
        <p><strong>Original URL:</strong> ${data.original_url}</p>
        <p><strong>Short URL:</strong> <a href="${fullShortUrl}" target="_blank">${fullShortUrl}</a></p>
        <div class="json">${JSON.stringify(data, null, 2)}</div>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
});