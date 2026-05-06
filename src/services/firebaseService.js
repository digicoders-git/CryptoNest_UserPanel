import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM Token lao aur backend pe save karo
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('❌ Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log('✅ FCM Token:', token);
      await saveFcmTokenToBackend(token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('❌ FCM Token error:', error);
    return null;
  }
};

// Backend pe token save karo
const saveFcmTokenToBackend = async (token) => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/user/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    console.log('✅ FCM token saved to backend');
  } catch (error) {
    console.error('❌ FCM token save error:', error);
  }
};

// Logout pe token remove karo
export const removeFcmToken = async () => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) return;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/user/fcm-token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    console.log('✅ FCM token removed from backend');
  } catch (error) {
    console.error('❌ FCM token remove error:', error);
  }
};

// Foreground notification listener (app khuli ho tab)
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('🔔 Foreground notification:', payload);
    callback(payload);
  });
};
