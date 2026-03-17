const NotificationService = {
  firebaseConfig: {
    apiKey: "AIzaSyDfmozB3o0fS2INonOtliAzO4okLWE9Rsk",
    authDomain: "our-sweet-conversation.firebaseapp.com",
    databaseURL: "https://our-sweet-conversation-default-rtdb.firebaseio.com",
    projectId: "our-sweet-conversation",
    storageBucket: "our-sweet-conversation.firebasestorage.app",
    messagingSenderId: "561504998058",
    appId: "1:561504998058:web:6f1819edd37adacdeaf6d3",
  },
  FCM_VAPID_KEY:
    "BDi_wbpMDdQLc_HIQyemRqpTnujEWVHmlnJuvtkaiRKTjIaE85jXtpdQkSYHGfKdzfaflFnIcntWxXgI7AUisVE",
  swPath: "./sw.js",
  initialized: false,

  logger(...args) {
    console.debug("[NotificationService]", ...args);
  },

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      this.logger("Service Worker not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(this.swPath);
      this.logger("Service Worker registered:", this.swPath);
      return registration;
    } catch (err) {
      console.warn("Service Worker registration failed", err);
      return null;
    }
  },

  async initFirebaseMessaging() {
    if (this.initialized) {
      return;
    }

    if (!window.firebase || !window.firebase.messaging) {
      this.logger("Firebase libraries are not loaded");
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(this.firebaseConfig);
      }

      this.messaging = firebase.messaging();

      const registration = await this.registerServiceWorker();
      if (registration) {
        this.messaging.useServiceWorker(registration);
        this.logger("Firebase messaging service worker attached");
      }

      this.messaging.onMessage((payload) => {
        this.logger("Foreground FCM payload", payload);
        this.showNotification(payload.notification?.title || "💌 New message", {
          body:
            payload.notification?.body ||
            payload.data?.content ||
            "You have a new message",
        });
      });

      this.initialized = true;

      if (Notification.permission === "granted") {
        await this.subscribeToToken();
      }
    } catch (err) {
      console.warn("Failed to initialize Firebase messaging", err);
    }
  },

  async requestPermission() {
    if (!("Notification" in window)) {
      this.logger("Notifications are not available in this browser");
      return "denied";
    }

    if (Notification.permission === "granted") {
      await this.initFirebaseMessaging();
      return "granted";
    }

    if (Notification.permission === "denied") {
      this.logger("Notification permission denied");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await this.initFirebaseMessaging();
      await this.subscribeToToken();
    }
    return permission;
  },

  async subscribeToToken() {
    if (!this.messaging) {
      this.logger("Messaging is not initialized; cannot get token");
      return null;
    }

    try {
      const options = {};
      if (this.FCM_VAPID_KEY) {
        options.vapidKey = this.FCM_VAPID_KEY;
      }

      const token = await this.messaging.getToken(options);
      if (token) {
        this.logger("FCM token received", token);
        if (this.userKey && this.dbRef) {
          this.dbRef
            .ref("fcm_tokens/" + this.userKey + "/" + token)
            .set(true)
            .catch((err) => this.logger("Failed to save token", err));
        }
        return token;
      }
      console.warn("FCM token unavailable");
      return null;
    } catch (err) {
      console.warn("FCM getToken failed", err);
      return null;
    }
  },

  bindAppInstance({ db, userKey, username }) {
    this.dbRef = db;
    this.userKey = userKey;
    this.username = username;
  },

  showNotification(title, options = {}) {
    if (!("Notification" in window)) {
      this.logger("Notifications unavailable, falling back to toast");
      return;
    }

    if (Notification.permission === "granted") {
      try {
        return self.Notification?.showNotification
          ? self.Notification.showNotification(title, options)
          : new Notification(title, options);
      } catch (err) {
        console.warn("Could not show notification", err);
      }
    }

    if (Notification.permission === "default") {
      this.requestPermission().then((perm) => {
        if (perm === "granted") {
          this.showNotification(title, options);
        }
      });
    }
  },

  async sendLocalNotificationForMessage(message, partnerName) {
    if (!message) return;

    const body =
      (typeof message === "string" && message) ||
      (message.content && String(message.content)) ||
      "You have a new message";

    this.showNotification(`💌 Message from ${partnerName || "someone"}`, {
      body,
      icon: "/favicon.ico",
      data: {
        url: window.location.href,
      },
    });
  },

  async notifyNewMessageToBackend(message) {
    if (!this.dbRef) {
      this.logger("No DB bound to notification service");
      return;
    }

    try {
      await this.dbRef.ref("pending_notifications").push({
        ts: Date.now(),
        ...message,
      });
      this.logger("Remote-trigger event added for Cloud Function");
    } catch (err) {
      console.warn("Failed to write pending notification event", err);
    }
  },
};

window.NotificationService = NotificationService;
