import { FavoriteDB } from '/src/scripts/idb';

export async function saveFavorite(story) {
  return FavoriteDB.put(story);
}

export async function getAllFavorites() {
  return FavoriteDB.getAll();
}

export async function getFavoriteById(id) {
  return FavoriteDB.get(id);
}

export async function removeFavorite(id) {
  return FavoriteDB.delete(id);
}
