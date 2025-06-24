const registerView = {
  render() {
    return `
      <section>
        <h2>Daftar</h2>
        <form aria-label="Formulir Utama" id="register-form" novalidate>
          <label for="name">Nama:</label>
          <input aria-label="Kolom Input" type="text" id="name" name="name" required>

          <label for="email">Email:</label>
          <input aria-label="Kolom Input" type="email" id="email" name="email" required>

          <label for="password">Password:</label>
          <input aria-label="Kolom Input" type="password" id="password" name="password" required>

          <div id="register-error" role="alert" style="color: red; margin: 1em 0;"></div>

          <button aria-label="Tombol Aksi" type="submit" id="submit-register">Daftar</button>
        </form>
      </section>
    `;
  },

  initialize({ onSubmit }) {
    const form = document.getElementById('register-form');
    const submitButton = document.getElementById('submit-register');
    const errorDiv = document.getElementById('register-error');

    if (!form || !submitButton || !errorDiv) {
      console.warn("Register form, tombol, atau elemen error tidak ditemukan");
      return;
    }

    const clearError = () => {
      errorDiv.textContent = '';
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      clearError();

      const name = form.name?.value.trim();
      const email = form.email?.value.trim();
      const password = form.password?.value;

      if (!name || !email || !password) {
        this.showError('Semua field harus diisi!');
        return;
      }

      if (password.length < 8) {
        this.showError('Password minimal 8 karakter!');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.showError('Format email tidak valid!');
        return;
      }

      this.setLoading(true);
      if (typeof onSubmit === 'function') {
        await onSubmit({ name, email, password });
      }
      this.setLoading(false);
    };

    form.name?.focus();
  },

  showError(message) {
    const errorDiv = document.getElementById('register-error');
    if (errorDiv) {
      errorDiv.textContent = message;
    } else {
      alert(message); // fallback jika elemen error tidak ditemukan
    }
  },

  setLoading(isLoading) {
    const button = document.getElementById('submit-register');
    if (button) {
      button.disabled = isLoading;
      button.textContent = isLoading ? 'Sedang mendaftar...' : 'Daftar';
    }
  }
};

export default registerView;
