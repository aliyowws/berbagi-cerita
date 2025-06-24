// favoriteView.js
const FavoriteView = {
  render() {
    return `
      <section class="favorite-section">
        <h2>Daftar Cerita Favorit</h2>
        <div id="favorite-list" class="story-list"></div>
      </section>
    `;
  },

  async afterRender(stories, onDelete) {
    const container = document.querySelector('#favorite-list');
    container.innerHTML = '';

    if (stories.length === 0) {
      container.innerHTML = '<p>Belum ada cerita favorit.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyEl = document.createElement('div');
      storyEl.classList.add('story-item');
      storyEl.innerHTML = `
        <article class="card">
          <img class="card-image" src="${story.photoUrl}" alt="Foto oleh ${story.name}" loading="lazy" />
          <div class="card-content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <button class="delete-favorite" data-id="${story.id}">Hapus dari Favorit</button>
          </div>
        </article>
      `;
      container.appendChild(storyEl);
    });

    document.querySelectorAll('.delete-favorite').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        onDelete(id);
      });
    });
  }
};

export default FavoriteView;
