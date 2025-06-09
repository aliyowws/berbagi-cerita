// src/scripts/notif-init.js
export const initPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn("Push notification tidak didukung di browser ini.");
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
    });

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("Token tidak ditemukan, tidak bisa subscribe push.");
      return;
    }

    const subJSON = subscription.toJSON();
    delete subJSON.expirationTime; 

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subJSON)
    });

    const result = await response.json();
    console.log("✅ Berhasil subscribe push:", result.message);
  } catch (err) {
    console.error("Gagal subscribe push notification:", err);
  }
};