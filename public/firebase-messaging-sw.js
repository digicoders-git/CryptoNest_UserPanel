importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain: "collegepanel-1027b.firebaseapp.com",
  projectId: "collegepanel-1027b",
  storageBucket: "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: "335340683871",
  appId: "1:335340683871:web:e666e69e9ad9f9035bd1ea",
});

const messaging = firebase.messaging();

// Background notification handle karo
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Background notification:', payload);

  // Note: We don't need showNotification here if the payload has a 'notification' property.
  // FCM automatically shows a notification in that case.
  /*
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/GTN Logo PNG (1).png',
    badge: '/GTN Logo PNG (1).png',
    data: payload.data,
  });
  */
});
