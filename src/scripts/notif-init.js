// src/scripts/notif-init.js

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export const initPush = async () => {   
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {     
    console.warn("Push notification tidak didukung di browser ini.");     
    return false;   
  }    

  try {     
    const reg = await navigator.serviceWorker.ready;      
    
    // Cek apakah sudah ada subscription atau belum      
    let subscription = await reg.pushManager.getSubscription();      
    
    if (!subscription) {       
      subscription = await reg.pushManager.subscribe({         
        userVisibleOnly: true,         
        applicationServerKey: VAPID_PUBLIC_KEY       
      });     
      console.log('🔔 Subscription baru dibuat');
    } else {       
      console.log('ℹ️ Sudah memiliki subscription push.');
      return true; // Already subscribed, no need to send to server again
    }      

    const token = localStorage.getItem('token');     
    if (!token) {       
      console.warn("Token tidak ditemukan, subscription disimpan untuk nanti.");       
      // Store subscription for later use when user logs in
      localStorage.setItem('pendingPushSubscription', JSON.stringify(subscription.toJSON()));
      return false;     
    }      

    // Send subscription to server sesuai dokumentasi API
    const subJSON = subscription.toJSON();
    const requestBody = {
      endpoint: subJSON.endpoint,
      keys: {
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth
      }
    };

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {       
      method: 'POST',       
      headers: {         
        'Authorization': `Bearer ${token}`,         
        'Content-Type': 'application/json'       
      },       
      body: JSON.stringify(requestBody)     
    });      

    if (!response.ok) {       
      const errorText = await response.text();       
      console.error(`Gagal subscribe ke server: ${response.status} - ${errorText}`);
      
      // If it's an auth error, store subscription for later
      if (response.status === 401) {
        localStorage.setItem('pendingPushSubscription', JSON.stringify(subscription.toJSON()));
      }
      return false;     
    }      

    const result = await response.json();     
    console.log("✅ Berhasil subscribe push:", result.message);
    
    // Clear any pending subscription
    localStorage.removeItem('pendingPushSubscription');
    return true;   
  } catch (err) {     
    console.error("❌ Gagal subscribe push notification:", err);     
    return false;   
  } 
};

// Function to handle pending subscription after login
export const handlePendingPushSubscription = async () => {
  const pendingSubscription = localStorage.getItem('pendingPushSubscription');
  const token = localStorage.getItem('token');
  
  if (!pendingSubscription || !token) {
    return false;
  }

  try {
    const subData = JSON.parse(pendingSubscription);
    const requestBody = {
      endpoint: subData.endpoint,
      keys: {
        p256dh: subData.keys.p256dh,
        auth: subData.keys.auth
      }
    };

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Berhasil subscribe pending push:", result.message);
      localStorage.removeItem('pendingPushSubscription');
      return true;
    } else {
      console.error('Gagal subscribe pending push:', response.status);
      return false;
    }
  } catch (err) {
    console.error('Error handling pending push subscription:', err);
    return false;
  }
};

// Function to unsubscribe from push notifications
export const unsubscribePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {     
    console.warn("Push notification tidak didukung di browser ini.");     
    return false;   
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      console.log('ℹ️ Tidak ada subscription untuk di-unsubscribe.');
      return true;
    }

    const token = localStorage.getItem('token');
    if (token) {
      // Unsubscribe from server
      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Berhasil unsubscribe dari server:", result.message);
      } else {
        console.warn('Gagal unsubscribe dari server:', response.status);
      }
    }

    // Unsubscribe from browser
    await subscription.unsubscribe();
    console.log("✅ Berhasil unsubscribe dari browser");
    
    // Clear any pending subscription
    localStorage.removeItem('pendingPushSubscription');
    return true;
  } catch (err) {
    console.error("❌ Gagal unsubscribe push notification:", err);
    return false;
  }
};

// Check if user is subscribed to push notifications
export const isPushSubscribed = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    console.error("Error checking push subscription:", err);
    return false;
  }
};