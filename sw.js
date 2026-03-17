importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDfmozB3o0fS2INonOtliAzO4okLWE9Rsk",
  authDomain: "our-sweet-conversation.firebaseapp.com",
  databaseURL: "https://our-sweet-conversation-default-rtdb.firebaseio.com",
  projectId: "our-sweet-conversation",
  storageBucket: "our-sweet-conversation.firebasestorage.app",
  messagingSenderId: "561504998058",
  appId: "1:561504998058:web:6f1819edd37adacdeaf6d3",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  const title = payload.notification?.title || "💌 New message";
  const options = {
    body:
      payload.notification?.body ||
      payload.data?.content ||
      "You have a new message",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: payload.notification?.badge || "/favicon.ico",
    data: {
      url: payload.data?.url || "/",
      ...payload.data,
    },
    timestamp: Date.now(),
    tag: payload.data?.threadId || "chat-message",
    renotify: true,
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title =
        payload.notification?.title || payload.title || "💌 New message";
      const options = {
        body:
          payload.notification?.body ||
          payload.body ||
          "You have a new message",
        icon: payload.notification?.icon || "/favicon.ico",
        data: payload.data || {},
        tag: payload.data?.threadId || "chat-message",
        renotify: true,
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.warn("SW push event parse failed", err);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((cList) => {
        for (const client of cList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  console.info("Push subscription changed", event);
});
