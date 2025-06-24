// favoriteDb.js
import { openDB } from 'idb';

const DB_NAME = 'berbagi-cerita-db';
const DB_VERSION = 2;
const STORE_NAME = 'favorite-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export const FavoriteDb = {
  async getAll() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async get(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },

  async put(story) {
    if (!story.id) return;
    return (await dbPromise).put(STORE_NAME, story);
  },

  async delete(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  }
};
