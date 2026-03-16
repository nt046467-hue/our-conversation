/* FIREBASE CONFIG (copy & update if needed) */
const firebaseConfig = {
  apiKey: "AIzaSyDfmozB3o0fS2INonOtliAzO4okLWE9Rsk",
  authDomain: "our-sweet-conversation.firebaseapp.com",
  databaseURL: "https://our-sweet-conversation-default-rtdb.firebaseio.com",
  projectId: "our-sweet-conversation",
  storageBucket: "our-sweet-conversation.firebasestorage.app",
  messagingSenderId: "561504998058",
  appId: "1:561504998058:web:6f1819edd37adacdeaf6d3",
};

/* Load Firebase 8 style (with timeout + localStorage fallback) */
(function () {
  let firebaseLoaded = false;
  const loadApp = () => {
    const s1 = document.createElement("script");
    s1.src = "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js";
      s2.onload = () => {
        firebaseLoaded = true;
        try {
          initApp();
        } catch (e) {
          console.warn("firebase init failed", e);
        }
      };
      s2.onerror = () => console.warn("Failed to load firebase-database.js");
      document.head.appendChild(s2);
    };
    s1.onerror = () => console.warn("Failed to load firebase-app.js");
    document.head.appendChild(s1);
  };

  function initLocalMessagesFallback() {
    console.info("Using local messages fallback");
    function LocalMessages(key) {
      this.key = key || "messages";
      this.listeners = { child_added: [] };
      this._emitExisting = () => {
        const items = JSON.parse(localStorage.getItem(this.key) || "[]");
        items.forEach((item) => {
          this.listeners.child_added.forEach((cb) => cb({ val: () => item }));
        });
      };
      this.push = (msg) => {
        const items = JSON.parse(localStorage.getItem(this.key) || "[]");
        items.push(msg);
        localStorage.setItem(this.key, JSON.stringify(items));
        this.listeners.child_added.forEach((cb) => cb({ val: () => msg }));
      };
      this.on = (evt, cb) => {
        if (evt === "child_added") this.listeners.child_added.push(cb);
      };
      setTimeout(() => this._emitExisting(), 0);
    }

    window.db = null;
    window.messagesRef = new LocalMessages("messages");
    initUI();
  }

  loadApp();
  setTimeout(() => {
    if (!firebaseLoaded) initLocalMessagesFallback();
  }, 2500);
})();

function initApp() {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
  window.messagesRef = db.ref("messages");
  initUI();
}

/* UI + chat logic */
function initUI() {
  const profileModal = document.getElementById("profileModal");
  const openProfile = document.getElementById("openProfile");
  const saveProfile = document.getElementById("saveProfile");
  const cancelProfile = document.getElementById("cancelProfile");
  const avatarFile = document.getElementById("avatarFile");
  const loginName = document.getElementById("loginName");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName");
  const profileSub = document.getElementById("profileSub");

  const openPanelBtn = document.getElementById("openPanelBtn");
  const closePanelBtn = document.getElementById("closePanel");
  const panel = document.getElementById("panel");
  const stickersRow = document.getElementById("stickersRow");
  const photoRow = document.getElementById("photoRow");
  const emojiRow = document.getElementById("emojiRow");
  const emojiBtn = document.getElementById("emojiBtn");

  const messagesEl = document.getElementById("messages");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  let currentUser = null;

  const stickerUrls = [
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG9vazRkcjdvamk1aGo1cGR4NHhoZGI3Y3Bzb3Fuemplb2QwMnR6MCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/h4BprYiFYNxRe/200.webp",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG9vazRkcjdvamk1aGo1cGR4NHhoZGI3Y3Bzb3Fuemplb2QwMnR6MCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yPQcB2bQVBQ6k/200.webp",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnFtbTFqbHlpbGNwa3AweGV1cGh0ZXpjOG9tN3JvcmRoa3R0Mm1paCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/IwzmivAc2evzcx0lEb/200.webp",
  ];
  const photoUrls = [
    "https://images.unsplash.com/photo-1542460533-50ac46fb13d7?w=600",
    "https://images.unsplash.com/photo-1521033719794-41049d18b8d4?w=600&auto=format&fit=crop&q=60",
  ];
  const loveEmojis = ["❤️", "😍", "😘", "😊", "💞", "💕", "💖"];

  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function nowISO() {
    return new Date().toISOString();
  }
  function nowTimeShort(iso) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function scrollMessages() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function autoResize() {
    msgInput.style.height = "auto";
    msgInput.style.height = Math.min(msgInput.scrollHeight, 180) + "px";
  }
  function createHeart() {
    const heart = document.createElement("div");
    heart.className = "floatingHeart";
    heart.textContent = "💖";
    heart.style.left = 20 + Math.random() * 60 + "%";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1600);
  }
  function validateUser() {
    if (!currentUser) {
      profileModal.style.display = "flex";
      profileModal.setAttribute("aria-hidden", "false");
      return false;
    }
    return true;
  }

  function populateAssets() {
    stickersRow.innerHTML = "";
    stickerUrls.forEach((u) => {
      const img = document.createElement("img");
      img.src = u;
      img.className = "sticker";
      img.loading = "lazy";
      img.onclick = () => {
        if (!validateUser()) return;
        messagesRef.push({
          sticker: u,
          senderName: currentUser.name,
          senderId: currentUser.uid,
          avatar: currentUser.avatar,
          timeISO: nowISO(),
          ts: Date.now(),
          edited: false,
        });
        createHeart();
        scrollMessages();
      };
      stickersRow.appendChild(img);
    });
    photoRow.innerHTML = "";
    photoUrls.forEach((u) => {
      const img = document.createElement("img");
      img.src = u;
      img.className = "sticker";
      img.loading = "lazy";
      img.onclick = () => {
        if (!validateUser()) return;
        messagesRef.push({
          sticker: u,
          senderName: currentUser.name,
          senderId: currentUser.uid,
          avatar: currentUser.avatar,
          timeISO: nowISO(),
          ts: Date.now(),
          edited: false,
        });
        createHeart();
        scrollMessages();
      };
      photoRow.appendChild(img);
    });
    emojiRow.innerHTML = "";
    loveEmojis.forEach((e) => {
      const btn = document.createElement("button");
      btn.className = "menuBtn";
      btn.textContent = e;
      btn.onclick = () => {
        insertAtCursor(msgInput, e);
        msgInput.focus();
        autoResize();
      };
      emojiRow.appendChild(btn);
    });
  }
  function insertAtCursor(el, text) {
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.setSelectionRange(start + text.length, start + text.length);
  }
  populateAssets();

  openPanelBtn.addEventListener("click", () => panel.classList.toggle("open"));
  closePanelBtn.addEventListener("click", () => panel.classList.remove("open"));
  emojiBtn.addEventListener("click", () => panel.classList.toggle("open"));

  openProfile.addEventListener("click", () => {
    profileModal.style.display = "flex";
    profileModal.setAttribute("aria-hidden", "false");
  });
  profileAvatar.addEventListener("click", () => {
    profileModal.style.display = "flex";
    profileModal.setAttribute("aria-hidden", "false");
  });
  cancelProfile.addEventListener("click", () => {
    profileModal.style.display = "none";
    profileModal.setAttribute("aria-hidden", "true");
  });

  saveProfile.addEventListener("click", async () => {
    const name = loginName.value.trim();
    if (!name) return alert("Please enter your display name");
    const uid =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "user";
    currentUser = {
      uid,
      name,
      avatar:
        "https://images.unsplash.com/photo-1518128922648-b869c8f72b90?w=600",
    };
    if (avatarFile.files[0]) {
      try {
        const dataUrl = await fileToDataURL(avatarFile.files[0]);
        currentUser.avatar = dataUrl;
      } catch (e) {
        console.warn("avatar read failed", e);
      }
    }
    profileAvatar.src = currentUser.avatar;
    profileName.textContent = currentUser.name;
    profileSub.textContent = "Ready to chat 💌";
    profileModal.style.display = "none";
    profileModal.setAttribute("aria-hidden", "true");
    try {
      localStorage.setItem(
        "profile_" + currentUser.uid,
        JSON.stringify(currentUser),
      );
    } catch (e) {
      console.warn("Failed to persist profile", e);
    }
  });

  function sendMessage() {
    if (!validateUser()) return;
    const txt = msgInput.value.trim();
    if (!txt) return;
    messagesRef.push({
      text: txt,
      senderName: currentUser.name,
      senderId: currentUser.uid,
      avatar: currentUser.avatar,
      timeISO: nowISO(),
      ts: Date.now(),
      edited: false,
    });
    msgInput.value = "";
    autoResize();
    createHeart();
    scrollMessages();
  }
  sendBtn.addEventListener("click", sendMessage);
  msgInput.addEventListener("input", autoResize);
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  const renderedTs = new Set();
  function renderMessage(data) {
    try {
      if (!data || !data.ts) return;
      if (renderedTs.has(data.ts)) return;
      renderedTs.add(data.ts);
      const row = document.createElement("div");
      row.className =
        "msgRow " + (data.senderId === currentUser?.uid ? "mine" : "theirs");
      const avatar = document.createElement("img");
      avatar.className = "avatar";
      avatar.src =
        data.avatar ||
        "https://images.unsplash.com/photo-1518128922648-b869c8f72b90?w=600";
      row.appendChild(avatar);
      const bubble = document.createElement("div");
      bubble.className =
        "bubble " + (data.senderId === currentUser?.uid ? "mine" : "theirs");
      if (data.text) {
        const p = document.createElement("div");
        p.textContent = data.text;
        bubble.appendChild(p);
      }
      if (data.sticker) {
        const img = document.createElement("img");
        img.src = data.sticker;
        img.className = "media";
        bubble.appendChild(img);
      }
      const meta = document.createElement("div");
      meta.className = "meta";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = data.senderName || "Unknown";
      nameSpan.style.fontWeight = "700";
      nameSpan.style.marginRight = "8px";
      const timeSpan = document.createElement("span");
      timeSpan.textContent = nowTimeShort(data.timeISO);
      timeSpan.style.color = "var(--muted)";
      meta.appendChild(nameSpan);
      meta.appendChild(timeSpan);
      bubble.appendChild(meta);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      scrollMessages();
    } catch (err) {
      console.error("renderMessage failed", err, data);
    }
  }

  try {
    messagesRef.on("child_added", (snap) => {
      const data = typeof snap.val === "function" ? snap.val() : snap;
      renderMessage(data);
    });
  } catch (e) {
    console.warn("messagesRef.on failed", e);
  }

  profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) {
      profileModal.style.display = "none";
      profileModal.setAttribute("aria-hidden", "true");
    }
  });
}
