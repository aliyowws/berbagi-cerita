let mapInstance = null;

const homeView = {
  render() {
    return `
      <section>
        <h2>Beranda Cerita</h2>
        <div id="story-list">Loading cerita...</div>
        <div id="map" style="height: 300px; margin-top: 16px;"></div>
      </section>
    `;
  },

  showLoading() {
    const listElement = document.getElementById('story-list');
    if (listElement) {
      listElement.innerHTML = '<p>Loading cerita...</p>';
    }
  },

  async renderStories(stories, onFavoriteClick) {
    const listElement = document.getElementById('story-list');
    const mapElement = document.getElementById('map');

    if (!listElement) {
      console.error('Elemen #story-list tidak ditemukan.');
      return;
    }

    if (!stories || stories.length === 0) {
      listElement.innerHTML = '<p>Belum ada cerita yang tersedia.</p>';
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      return;
    }

    listElement.innerHTML = stories.map(story => {
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
            <button class="add-favorite" data-id="${story.id}">❤️ Tambah ke Favorit</button>
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll('.add-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        onFavoriteClick(id);
      });
    });

    const storiesWithLocation = stories.filter(s => s.lat && s.lon);
    if (mapElement && storiesWithLocation.length > 0) {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      const first = storiesWithLocation[0];
      mapInstance = L.map(mapElement).setView([first.lat, first.lon], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      for (const story of storiesWithLocation) {
        const marker = L.marker([story.lat, story.lon]).addTo(mapInstance);
        const locationName = story.locationName || '(Tidak diketahui)';
        marker.bindPopup(`
          <div style="max-width: 200px;">
            <b>${story.name}</b><br>
            <p>${story.description}</p>
            <small>Lokasi: ${locationName}</small>
          </div>
        `);
      }
    } else if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  },

  showError(message) {
    const listElement = document.getElementById('story-list');
    if (listElement) {
      listElement.innerHTML = `<p class="error">${message}</p>`;
    }

    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  }
};

export default homeView;