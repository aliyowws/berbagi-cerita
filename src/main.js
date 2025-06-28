function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

import './style.css';
import { router, navigateTo } from './scripts/router.js';
import { stopCamera } from './scripts/presenters/addStoryPresenter.js';

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
            navigateTo('/login');   // <-- ganti location.hash dengan navigateTo
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

        if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js')
            .then(async (registration) => {
                console.log('✅ Service Worker registered');

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn('Push notification permission not granted');
                    return;
                }

                const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn('Tidak ada token. Tidak dapat mengirim subscription ke server.');
                    return;
                }

                const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    })
                });

                const result = await response.json();
                console.log('📬 Subscribed to push:', result);
            })
            .catch((err) => console.error('❌ SW registration failed:', err));
    }

    router();
});


window.addEventListener('beforeunload', stopCamera);