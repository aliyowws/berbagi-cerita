const favoriteView = {
  render() {
    return `
      <section>
        <h2>Cerita Favorit</h2>
        <div id="favorite-list">Loading cerita favorit...</div>
      </section>
    `;
  },

  showStories(stories) {
    const container = document.getElementById('favorite-list');

    if (!stories || stories.length === 0) {
      container.innerHTML = '<p>Belum ada cerita favorit.</p>';
      return;
    }

    container.innerHTML = stories.map(story => {
      const createdAt = new Date(story.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return `
        <article class="card">
          <img class="card-image" src="${story.photoUrl}" alt="Foto oleh ${story.name}" loading="lazy" />
          <div class="card-content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small>Dibuat pada: ${createdAt}</small>
          </div>
        </article>
      `;
    }).join('');
  },

  showError(message) {
    const container = document.getElementById('favorite-list');
    container.innerHTML = `<p class="error">${message}</p>`;
  }
};

export default favoriteView;