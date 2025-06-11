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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
    } else {
      resultDiv.innerHTML = `
        <div class="alert alert-success">
          <p><strong>Original URL:</strong> <a href="${data.original_url}" target="_blank">${data.original_url}</a></p>
          <p><strong>Short URL:</strong> <a href="/api/shorturl/${data.short_url}">/api/shorturl/${data.short_url}</a></p>
        </div>
      `;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    console.error('Error:', error);
  }
});