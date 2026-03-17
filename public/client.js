const socket = io();

const currentUser = "You";
const buddyUser = "Karu";

const messageContainer = document.getElementById("messageContainer");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
const karuStatus = document.getElementById("karuStatus");
const notifyButton = document.getElementById("notifyButton");
const emojiGrid = document.getElementById("emojiGrid");

let typingTimeout;
let isBuddyTyping = false;

function appendMessage(text, sender, isOwnMessage = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", isOwnMessage ? "sent" : "received");
  msg.innerHTML = `
    <span>${text}</span>
    <small>${sender} • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
  `;
  messageContainer.appendChild(msg);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function sendMessage(value) {
  if (!value || !value.trim()) return;

  const messageData = {
    sender: currentUser,
    text: value.trim(),
    timestamp: Date.now(),
  };

  appendMessage(messageData.text, currentUser, true);
  socket.emit("chat message", messageData);
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(messageInput.value);
  messageInput.value = "";
  socket.emit("typing", { user: currentUser, typing: false });
});

messageInput.addEventListener("input", () => {
  socket.emit("typing", { user: currentUser, typing: true });

  if (typingTimeout) clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("typing", { user: currentUser, typing: false });
  }, 600);
});

emojiGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".emoji-btn");
  if (!button) return;

  const emoji = button.textContent;
  sendMessage(emoji);
});

socket.on("chat message", (messageData) => {
  const { sender, text } = messageData;

  if (sender === currentUser) {
    return;
  }

  appendMessage(text, sender, false);

  if (
    sender === buddyUser &&
    document.hidden &&
    Notification.permission === "granted"
  ) {
    new Notification("New message from Karu", {
      body: text,
      icon: "icon.png",
    });
  }
});

socket.on("user status", (statusData) => {
  if (statusData.user !== buddyUser) return;

  karuStatus.textContent = statusData.status;
  karuStatus.classList.toggle("online", statusData.status === "online");
  karuStatus.classList.toggle("offline", statusData.status !== "online");
});

socket.on("typing", (typingData) => {
  if (typingData.user !== buddyUser) return;

  if (typingData.typing) {
    typingIndicator.hidden = false;
    isBuddyTyping = true;
    return;
  }

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicator.hidden = true;
    isBuddyTyping = false;
  }, 400);
});

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      alert(
        "Notifications enabled. You will receive alerts when Karu messages you while the tab is hidden.",
      );
    } else {
      alert("Notifications are disabled.");
    }
  });
}

notifyButton.addEventListener("click", requestNotificationPermission);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && isBuddyTyping) {
    typingIndicator.hidden = true;
    isBuddyTyping = false;
  }
});
