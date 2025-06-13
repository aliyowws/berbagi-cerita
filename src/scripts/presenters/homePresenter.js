import { getStories } from '../models/storyApiModel.js';
import { getToken } from '../models/authModel.js';
import { getGeolocationName } from '../models/geolocationModel.js';
import { saveFavorite } from '../models/favoriteModel.js';
import homeView from '../views/homeView.js';

export async function renderStories() {
  try {
    const token = getToken();
    if (!token) {
      homeView.showError('Silakan login terlebih dahulu untuk melihat cerita!');
      return;
    }

    const result = await getStories(token);
    const stories = result.listStory || [];

    const storiesWithLocation = await Promise.all(
      stories.map(async (story) => {
        if (story.lat && story.lon) {
          try {
            const locationName = await getGeolocationName(story.lat, story.lon);
            return { ...story, locationName };
          } catch {
            return { ...story, locationName: '(Tidak diketahui)' };
          }
        }
        return { ...story };
      })
    );

    await homeView.renderStories(storiesWithLocation);

    homeView.bindFavoriteHandler(async (id) => {
      const story = storiesWithLocation.find((s) => s.id === id);
      if (!story) return;

      try {
        await saveFavorite(story);
        homeView.showFavoriteSuccess();
      } catch (err) {
        console.error('❌ Gagal simpan favorit:', err);
        homeView.showFavoriteError();
      }
    });

  } catch (error) {
    console.error('Error loading stories:', error);
    homeView.showError('Gagal memuat cerita. Silakan coba lagi.');
  }
}
