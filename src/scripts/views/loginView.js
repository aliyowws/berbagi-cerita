// src/scripts/views/loginView.js

const loginView = {
  render() {
    return `
      <section>
        <h2>Login</h2>
        <form aria-label="Formulir Utama" id="login-form">
          <label for="email">Email:</label>
          <input aria-label="Kolom Input" type="email" id="email" required>

          <label for="password">Password:</label>
          <input aria-label="Kolom Input" type="password" id="password" required>

          <button aria-label="Tombol Aksi" type="submit" id="submit-login">Login</button>
        </form>
      </section>
    `;
  },

  initialize({ onSubmit }) {
    const form = document.getElementById('login-form');
    const submitButton = document.getElementById('submit-login');

    if (!form || !submitButton) {
      console.warn("Login form atau tombol tidak ditemukan");
      return;
    }

    form.onsubmit = async (e) => {
      e.preventDefault();

      const email = form.email?.value.trim();
      const password = form.password?.value;

      if (!email || !password) {
        this.showError('Email dan password harus diisi!');
        return;
      }

      this.setLoading(true);
      if (typeof onSubmit === 'function') {
        await onSubmit({ email, password });
      }
      this.setLoading(false);
    };

    form.email?.focus();
  },

  showError(message) {
    alert(message); 
  },

  showSuccess(message) {
    alert(message); 
  },

  setLoading(isLoading) {
    const button = document.getElementById('submit-login');
    if (button) {
      button.disabled = isLoading;
      button.textContent = isLoading ? 'Sedang login...' : 'Login';
    }
  }
};

export default loginView;