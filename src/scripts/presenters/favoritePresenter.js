// favoritePresenter.js
import { FavoriteDb } from '../favorites/favoriteDb.js';
import FavoriteView from '../views/favoriteView.js';

const FavoritePresenter = {
  async init(container) {
    this._container = container;
    this._renderPage();
  },

  async _renderPage() {
    this._container.innerHTML = FavoriteView.render();

    const stories = await FavoriteDb.getAll();

    await FavoriteView.afterRender(stories, async (id) => {
      await FavoriteDb.delete(id);
      this._renderPage(); 
    });
  }
};

export default FavoritePresenter;
