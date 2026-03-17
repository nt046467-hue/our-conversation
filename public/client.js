const myId = 'me';
const otherId = 'karu';
const params = new URLSearchParams(window.location.search);
const currentUser = params.get('name') || myId;
const buddyUser = currentUser === otherId ? myId : otherId;

const socket = io({ query: { name: currentUser } });

const messageContainer = document.getElementById('messageContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const karuStatus = document.getElementById('karuStatus');
const userStatus = document.getElementById('user-status');
const notifyButton = document.getElementById('notifyButton');
const emojiGrid = document.getElementById('emojiGrid');

const presenceRef = firebase.database().ref('status');
const messagesRef = firebase.database().ref('messages');

let typingTimeout;
let isBuddyTyping = false;

function appendMessage(messageId, text, sender, seen) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender === 'You' ? 'message-sent' : 'message-received');
  msg.setAttribute('data-message-id', messageId);

  const state = sender === 'You'
    ? seen ? '✓✓ Seen' : '✓ Delivered'
    : seen ? '✓✓ Seen' : '✓ Delivered';

  msg.innerHTML = `
    <span>${text}</span>
    <span class="seen-indicator">${state}</span>
    <small>${sender} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
  `;

  messageContainer.appendChild(msg);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function refreshMessages(snapshot) {
  messageContainer.innerHTML = '';

  snapshot.forEach((child) => {
    const messageData = child.val();
    const id = child.key;

    const senderName = messageData.sender === myId ? 'You' : 'Karu';
    appendMessage(id, messageData.text, senderName, messageData.seen);
  });

  markMessagesAsSeen();
}

function sendMessage(value) {
  if (!value || !value.trim()) return;

  const messageData = {
    sender: currentUser === myId ? myId : otherId,
    recipient: currentUser === myId ? otherId : myId,
    text: value.trim(),
    seen: false,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  };

  appendMessage('local-' + Date.now(), value.trim(), 'You', false);
  socket.emit('chat message', messageData);

  messagesRef.push(messageData).catch((err) => {
    console.error('Failed to write message to Firebase:', err);
  });
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage(messageInput.value);
  messageInput.value = '';
  socket.emit('typing', { user: currentUser, typing: false });
});

messageInput.addEventListener('input', () => {
  socket.emit('typing', { user: currentUser, typing: true });

  if (typingTimeout) clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit('typing', { user: currentUser, typing: false });
  }, 600);
});

emojiGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.emoji-btn');
  if (!button) return;

  const emoji = button.textContent;
  sendMessage(emoji);
});

socket.on('chat message', (messageData) => {
  if (messageData.sender === currentUser) return;

  appendMessage('remote-' + Date.now(), messageData.text, 'Karu', messageData.seen);

  if (messageData.sender === otherId && document.hidden && Notification.permission === 'granted') {
    new Notification('New message from Karu', {
      body: messageData.text,
      icon: 'icon.png',
    });
  } else if (messageData.sender === otherId && document.hidden) {
    showInPageToast('New message from Karu: ' + messageData.text);
  }
});

socket.on('user status', (statusData) => {
  const statusText = statusData.status === 'online' ? 'online 🟢' : 'offline 🔴';

  if (statusData.user === otherId) {
    karuStatus.textContent = statusData.status;
    karuStatus.classList.toggle('online', statusData.status === 'online');
    karuStatus.classList.toggle('offline', statusData.status !== 'online');

    userStatus.textContent = statusText;
    userStatus.classList.toggle('online', statusData.status === 'online');
    userStatus.classList.toggle('offline', statusData.status !== 'online');
  }
});

socket.on('typing', (typingData) => {
  if (typingData.user !== otherId) return;

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

function isNotificationSupported() {
  return 'Notification' in window;
}

async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    alert('This browser does not support desktop notifications.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert('Notifications enabled. You will receive alerts when Karu messages you while the tab is hidden.');
    } else {
      alert('Notifications are disabled.');
    }
  } catch (err) {
    console.error('Notification permission request error:', err);
  }
}

function showInPageToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-visible';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function initPresence() {
  const connected = firebase.database().ref('.info/connected');
  const myStatusRef = firebase.database().ref(`status/${myId}`);

  connected.on('value', (snap) => {
    if (snap.val() === true) {
      myStatusRef.set(true).catch(console.error);
      myStatusRef.onDisconnect().remove().catch(console.error);
    }
  });

  firebase.database().ref(`status/${otherId}`).on('value', (snap) => {
    const otherOnline = snap.val() === true;
    userStatus.textContent = otherOnline ? 'online 🟢' : 'offline 🔴';
    userStatus.classList.toggle('online', otherOnline);
    userStatus.classList.toggle('offline', !otherOnline);
  });
}

function markMessagesAsSeen() {
  messagesRef.once('value', (snapshot) => {
    snapshot.forEach((child) => {
      const value = child.val();
      if (value.recipient === currentUser && value.sender === otherId && value.seen === false) {
        child.ref.update({ seen: true }).catch(console.error);
      }
    });
  });
}

messagesRef.on('value', (snapshot) => {
  refreshMessages(snapshot);
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    markMessagesAsSeen();

    if (isBuddyTyping) {
      typingIndicator.hidden = true;
      isBuddyTyping = false;
    }
  }
});

initPresence();
notifyButton.addEventListener('click', requestNotificationPermission);
