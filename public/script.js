document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('url_input').value;
  const resultDiv = document.getElementById('result');
  
  try {
    const response = await fetch('/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(urlInput)}`
    });
    
    const data = await response.json();
    
    if (data.error) {
      resultDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
    } else {
      const fullUrl = window.location.href.replace(/\/$/, '');
      resultDiv.innerHTML = `
        <p>Original URL: <a href="${data.original_url}" target="_blank">${data.original_url}</a></p>
        <p>Short URL: <a href="${fullUrl}/api/shorturl/${data.short_url}" target="_blank">${fullUrl}/api/shorturl/${data.short_url}</a></p>
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});