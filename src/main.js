import './style.css';
import { router, navigateTo } from './scripts/router.js';
import { stopCamera } from './scripts/presenters/addStoryPresenter.js';
import { initPush } from './scripts/notif-init.js';

window.addEventListener('load', () => {
    const logoutLink = document.getElementById('logoutLink');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const appContent = document.getElementById('main-content');

    if (!appContent) {
        console.error("Elemen dengan ID 'main-content' tidak ditemukan. Aplikasi tidak dapat berjalan.");
        return;
    }

    const updateAuthLinks = () => {
        const token = localStorage.getItem('token');
        if (token) {
            if (logoutLink) logoutLink.style.display = 'inline';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
        } else {
            if (logoutLink) logoutLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'inline';
            if (registerLink) registerLink.style.display = 'inline';
        }
    };

    updateAuthLinks();

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            alert('Logout berhasil!');
            navigateTo('/login');   
            updateAuthLinks();
        });
    }

    const mainContent = document.querySelector("#main-content");
    const skipLink = document.querySelector(".skip-link");

    if (skipLink && mainContent) {
        skipLink.addEventListener("click", function (event) {
            event.preventDefault();
            skipLink.blur();
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        });
    }

    window.addEventListener('hashchange', () => {
        router();
        updateAuthLinks();
    });

    router();

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log("✅ Izin notifikasi diberikan");
                initPush();
            } else {
                console.warn("❌ Izin notifikasi ditolak atau tidak dipilih");
            }
        });
    } else if (Notification.permission === 'granted') {
        initPush(); 
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker terdaftar:', reg))
            .catch(err => console.error('❌ SW gagal terdaftar:', err));
    }
});

window.addEventListener('beforeunload', stopCamera);