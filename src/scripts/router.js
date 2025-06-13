import homeView from './views/homeView.js';
import addStoryView from './views/addStoryView.js';
import loginView from './views/loginView.js';
import registerView from './views/registerView.js';

import { renderStories } from './presenters/homePresenter.js';
import { setupAddStory, stopCamera } from './presenters/addStoryPresenter.js';
import { setupLogin } from './presenters/loginPresenter.js';
import { setupRegister } from './presenters/registerPresenter.js';

import { renderFavorites } from './presenters/favoritePresenter.js';

const routes = {
  '/': {
    view: homeView,
    beforeRender: stopCamera,
    afterRender: renderStories
  },
  '/tambah': {
    view: addStoryView,
    beforeRender: () => {} , 
    afterRender: setupAddStory
  },
  '/login': {
    view: loginView,
    beforeRender: stopCamera,
    afterRender: setupLogin
  },
  '/register': {
    view: registerView,
    beforeRender: stopCamera,
    afterRender: setupRegister
  },
  '/favorit': {
    view: {
      render: () => `
        <section>
          <h2>Memuat Favorit...</h2>
          <div id="favorite-list"></div>
        </section>
      `
    },
    beforeRender: stopCamera,
    afterRender: renderFavorites
  }
};

let previousHash = location.hash.slice(1).toLowerCase() || '/';

export const navigateTo = (path) => {
  if (window.location.hash === `#${path}`) {
    router(); 
  } else {
    window.location.hash = path;
  }
};

export const router = () => {
  const currentHash = location.hash.slice(1).toLowerCase() || '/';
  const route = routes[currentHash];
  const mainContent = document.getElementById('main-content');

  if (!mainContent) {
    console.error('Elemen #main-content tidak ditemukan di DOM.');
    return;
  }

  if (previousHash === '/tambah' && currentHash !== '/tambah') {
  stopCamera();
  }

  if (route && route.beforeRender) {
    route.beforeRender(); 
  }

  const renderContent = () => {
    if (route) {
      mainContent.innerHTML = route.view.render();
      route.afterRender && route.afterRender();
    } else {
      mainContent.innerHTML = '<p>Halaman tidak ditemukan</p>';
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(renderContent);
  } else {
    renderContent();
  }

  previousHash = currentHash;
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);