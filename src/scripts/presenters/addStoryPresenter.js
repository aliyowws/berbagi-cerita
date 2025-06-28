// src/scripts/presenters/addStoryPresenter.js
import addStoryView from '../views/addStoryView.js';
import { postStory, createStoryFormData } from '../models/storyApiModel.js';
import { getToken } from '../models/authModel.js';
import { navigateTo } from '../router.js';
import { renderStories } from './homePresenter.js';

export function setupAddStory() {
  addStoryView.initialize({
    onSubmit: async (formData) => {
      try {
        const token = getToken();
        if (!token) {
          addStoryView.showError('Token tidak ditemukan. Silakan login terlebih dahulu.');
          return;
        }

        const realFormData = createStoryFormData(formData);
        const result = await postStory(realFormData, token);

        if (!result.error) {
          addStoryView.showSuccess('Cerita berhasil dikirim!');

          if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
              registration.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: 'Story berhasil dibuat',
                options: {
                  body: `Anda telah membuat story baru dengan deskripsi: ${formData.description}`,
                  icon: '/public/assets/icons/icon-192x192.png'
                }
              });
            }
          }

          navigateTo('/');
          addStoryView.disableCamera();
        } else {
          addStoryView.showError('Gagal mengirim: ' + result.message);
        }
      } catch (err) {
        addStoryView.showError('Terjadi kesalahan saat mengirim cerita.');
        console.error(err);
      }
    }
  });
}

export function stopCamera() {
  addStoryView.disableCamera();
}
