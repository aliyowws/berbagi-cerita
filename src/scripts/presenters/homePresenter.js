import { getStories } from '../models/storyApiModel.js';
import { getToken } from '../models/authModel.js';
import { getGeolocationName } from '../models/geolocationModel.js';
import homeView from '../views/homeView.js';
import { FavoriteDb } from '../favorites/favoriteDb.js';

export async function renderStories() {
  try {
    const token = getToken();
    if (!token) {
      homeView.showError('Silakan login terlebih dahulu untuk melihat cerita!');
      return;
    }

    const result = await getStories(token);
    const stories = result.listStory || [];

    const storiesWithLocation = await Promise.all(stories.map(async story => {
      if (story.lat && story.lon) {
        try {
          const locationName = await getGeolocationName(story.lat, story.lon);
          return { ...story, locationName };
        } catch {
          return { ...story, locationName: '(Tidak diketahui)' };
        }
      }
      return { ...story };
    }));

    await homeView.renderStories(storiesWithLocation, async (id) => {
      const story = storiesWithLocation.find(s => s.id === id);
      if (story) {
        await FavoriteDb.put(story);
        alert('Cerita telah ditambahkan ke favorit!');
      }
    });

  } catch (error) {
    console.error('Error loading stories:', error);
    homeView.showError('Gagal memuat cerita. Silakan coba lagi.');
  }
}
