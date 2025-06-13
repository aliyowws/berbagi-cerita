// src/scripts/presenters/addStoryPresenter.js
import addStoryView from '../views/addStoryView.js';
import { postStory, createStoryFormData } from '../models/storyApiModel.js';
import { getToken } from '../models/authModel.js';
import { navigateTo } from '../router.js';

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
}

export function stopCamera() {
  addStoryView.disableCamera();
}