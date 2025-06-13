import favoriteView from '../views/favoriteView.js';
import { getAllFavorites, removeFavorite } from '../models/favoriteModel.js';

export async function renderFavorites() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = favoriteView.render();

  try {
    const stories = await getAllFavorites(); 
    favoriteView.showStories(stories);

    favoriteView.bindRemoveHandler(async (id) => {
      try {
        await removeFavorite(id);
        renderFavorites(); 
      } catch (err) {
        console.error('Gagal menghapus favorit:', err);
      }
    });

  } catch (error) {
    console.error('Gagal memuat cerita favorit:', error);
    favoriteView.showError('Gagal memuat cerita favorit.');
  }
}