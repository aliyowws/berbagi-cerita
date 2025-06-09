// src/scripts/presenters/loginPresenter.js
import { loginUser } from '../models/authModel.js';
import loginView from '../views/loginView.js';
import { navigateTo } from '../router.js';

export function setupLogin() {
  loginView.initialize({
    onSubmit: async ({ email, password }) => {
      try {
        const result = await loginUser(email, password);
        loginView.showSuccess('Login berhasil!');
        navigateTo('/tambah'); 
      } catch (error) {
        loginView.showError(error.message || 'Login gagal.');
      }
    }
  });
}