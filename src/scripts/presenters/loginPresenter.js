// src/scripts/presenters/loginPresenter.js
import { loginUser } from '../models/authModel.js';
import loginView from '../views/loginView.js';
import { navigateTo } from '../router.js';

export function setupLogin() {
  loginView.initialize({
    onSubmit: async ({ email, password }) => {
      try {
        const result = await loginUser(email, password);
        
        if (result.loginResult && result.loginResult.token) {
          localStorage.setItem('token', result.loginResult.token);
          
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          
          loginView.showSuccess('Login berhasil!');
          navigateTo('/');
        } else {
          loginView.showError('Login gagal - token tidak ditemukan.');
        }
      } catch (error) {
        loginView.showError(error.message || 'Login gagal.');
      }
    }
  });
}