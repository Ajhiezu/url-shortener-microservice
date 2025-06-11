document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const urlInput = document.getElementById('url_input').value;
  const resultDiv = document.getElementById('result');
  
  try {
    const response = await fetch('http://localhost:3000/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlInput })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.error) {
      resultDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
    } else {
      resultDiv.innerHTML = `
        <p>Original URL: <a href="${data.original_url}" target="_blank">${data.original_url}</a></p>
        <p>Short URL: <a href="/api/shorturl/${data.short_url}" target="_blank">/api/shorturl/${data.short_url}</a></p>
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    console.error('Error:', err);
  }
});