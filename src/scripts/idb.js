import { openDB } from 'idb';

const dbPromise = openDB('berbagi-cerita-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('favorites')) {
      db.createObjectStore('favorites', { keyPath: 'id' });
    }
  },
});

export const FavoriteDB = {
  async getAll() {
    return (await dbPromise).getAll('favorites');
  },
  async get(id) {
    return (await dbPromise).get('favorites', id);
  },
  async put(data) {
    return (await dbPromise).put('favorites', data);
  },
  async delete(id) {
    return (await dbPromise).delete('favorites', id);
  }
};