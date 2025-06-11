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
    
    if (!response.ok) {
      throw new Error(data.error || 'Unknown error');
    }
    
    resultDiv.innerHTML = `
      <div class="result-box">
        <p><strong>Original URL:</strong> ${data.original_url}</p>
        <p><strong>Short URL:</strong> 
          <a href="/api/shorturl/${data.short_url}">/api/shorturl/${data.short_url}</a>
        </p>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
  }
});