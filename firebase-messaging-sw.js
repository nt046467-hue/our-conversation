importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDfmozB3o0fS2INonOtliAzO4okLWE9Rsk",
  authDomain: "our-sweet-conversation.firebaseapp.com",
  databaseURL: "https://our-sweet-conversation-default-rtdb.firebaseio.com",
  projectId: "our-sweet-conversation",
  storageBucket: "our-sweet-conversation.firebasestorage.app",
  messagingSenderId: "561504998058",
  appId: "1:561504998058:web:6f1819edd37adacdeaf6d3",
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  const notificationTitle =
    payload.notification?.title || "💌 New message from your partner";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.content ||
      "You have a new message",
    icon: payload.notification?.icon || "/favicon.ico",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
