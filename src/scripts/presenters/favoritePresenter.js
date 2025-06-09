import favoriteView from '../views/favoriteView.js';
import { FavoriteDB } from '/src/scripts/idb';

export async function renderFavorites() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = favoriteView.render();

  try {
    const stories = await FavoriteDB.getAll();
    favoriteView.showStories(stories);
  } catch (error) {
    console.error('Gagal memuat cerita favorit:', error);
    favoriteView.showError('Gagal memuat cerita favorit.');
  }
}