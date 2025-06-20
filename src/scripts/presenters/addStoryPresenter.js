// src/scripts/presenters/addStoryPresenter.js
import addStoryView from '../views/addStoryView.js';
import { postStory, createStoryFormData } from '../models/storyApiModel.js';
import { getToken } from '../models/authModel.js';
import { navigateTo } from '../router.js';
import { renderStories } from './homePresenter.js';
import { initPush, isPushSubscribed } from '../notif-init.js';


export function setupAddStory() {
  requestAnimationFrame(() => {
    const token = getToken();
    if (token) {
      initPush().catch(err => {
        console.warn('Push notifikasi setup gagal:', err);
      });
    }

    addStoryView.initialize({
      onSubmit: async (formData) => {
        try {
          const token = getToken();
          if (!token) {
            addStoryView.showError('Token tidak ditemukan. Silakan login terlebih dahulu.');
            return;
          }

          const isSubscribed = await isPushSubscribed();
          if (!isSubscribed) {
            console.warn('User tidak berlangganan push notification, mencoba subscribe...');
            await initPush().catch(err => {
              console.warn('Gagal setup push notification:', err);
            });
          }

          const realFormData = createStoryFormData(formData);
          const result = await postStory(realFormData, token);

          if (!result.error) {
            addStoryView.showSuccess('Cerita berhasil dikirim! Anda akan menerima notifikasi push.');
            addStoryView.disableCamera();
            navigateTo('/');
             
          } else {
            addStoryView.showError('Gagal mengirim: ' + result.message);
          }
        } catch (err) {
          addStoryView.showError('Terjadi kesalahan saat mengirim cerita.');
          console.error(err);
        }
      }
    });
  });
}

export function stopCamera() {
  addStoryView.disableCamera();
  addStoryView.teardown();
}