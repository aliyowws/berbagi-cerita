
import { router, navigateTo } from './scripts/router.js';
import { stopCamera } from './scripts/presenters/addStoryPresenter.js';
import { initPush } from './scripts/notif-init.js';

async function handlePendingPushSubscription() {
  return false;
}

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
            
            
            handlePendingPushSubscription().then(result => {
                if (result) {
                    console.log('✅ Pending push subscription berhasil diproses');
                }
            }).catch(err => {
                console.warn('⚠️ Gagal memproses pending push subscription:', err);
            });
            

        } else {
            if (logoutLink) logoutLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'inline';
            if (registerLink) registerLink.style.display = 'inline';
        }
    };

    updateAuthLinks();

    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Unsubscribe from push notifications before logout
            try {
                await unsubscribePush();
                console.log('✅ Push notification unsubscribed');
            } catch (err) {
                console.warn('⚠️ Gagal unsubscribe push notification:', err);
            }
            
            localStorage.removeItem('token');
            localStorage.removeItem('pendingPushSubscription'); // Clear any pending subscription
            
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

    const initializePushNotifications = async () => {
        if (!('Notification' in window)) {
            console.warn('Browser tidak mendukung notifikasi');
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log("✅ Izin notifikasi diberikan");
                const token = localStorage.getItem('token');
                if (token) {
                    await initPush();
                } else {
                    console.log("ℹ️ Token belum ada, push notification akan diinisialisasi setelah login");
                }
            } else {
                console.warn("❌ Izin notifikasi ditolak atau tidak dipilih");
            }
        } else if (Notification.permission === 'granted') {
            const token = localStorage.getItem('token');
            if (token) {
                await initPush();
            } else {
                console.log("ℹ️ Token belum ada, push notification akan diinisialisasi setelah login");
            }
        } else {
            console.warn("❌ Izin notifikasi sudah ditolak sebelumnya");
        }
    };

    // Register service worker and initialize push notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('✅ Service Worker terdaftar:', reg);
                // Initialize push notifications after service worker is ready
                return initializePushNotifications();
            })
            .then(() => {
                console.log('✅ Push notification initialization completed');
            })
            .catch(err => {
                console.error('❌ SW gagal terdaftar atau push init gagal:', err);
            });
    } else {
        console.warn('Service Worker tidak didukung di browser ini');
    }

    // Listen for successful login/register events
    window.addEventListener('userLoggedIn', () => {
        console.log('User logged in, initializing push notifications...');
        if (Notification.permission === 'granted') {
            initPush().catch(err => {
                console.warn('Gagal initialize push setelah login:', err);
            });
        }
        navigateTo('/tambah');
    });
});

window.addEventListener('beforeunload', stopCamera);