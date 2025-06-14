document.addEventListener('DOMContentLoaded', async () => {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  try {
    const res = await fetch('https://spotify.noir.ac');
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    if (!data.playing) {
      widget.textContent = 'Not Listening to anything';
      widget.classList.add('text-only');
      return;
    }

    widget.innerHTML = `
      <div class="info">
        <a href="${data.url}" target="_blank" rel="noopener">${data.song}</a>
        <hr />
        <div class="meta">${data.artist} | ${data.album}</div>
      </div>
      <img class="album-art" src="${data.album_art}" alt="Album art" />
    `;
  } catch (err) {
    widget.textContent = 'Failed to load';
    widget.classList.add('text-only');
  }
});
