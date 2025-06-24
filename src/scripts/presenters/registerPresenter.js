import { registerUser } from '../models/authModel.js';
import registerView from '../views/registerView.js';
import { navigateTo } from '../router.js';

export function setupRegister() {
  registerView.initialize({
    onSubmit: async ({ name, email, password }) => {
      try {
        await registerUser(name, email, password);
        // Pakai navigateTo agar navigasi konsisten dan bisa di-handle router.js
        navigateTo('/login');
      } catch (error) {
        registerView.showError(error.message || 'Gagal registrasi.');
      }
    }
  });
}