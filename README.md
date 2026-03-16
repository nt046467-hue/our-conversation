# 💌 Our Space - Anniversary Chat App

A beautiful, romantic chat application built with **vanilla JavaScript** and **Firebase Realtime Database**. Perfect for couples to share sweet messages, photos, stickers, and emojis.

## ✨ Features

### 🔐 Security
- **PIN-based authentication** - Private login for each person
- Two separate user accounts with different PINs (143 and 1432)
- Secure localStorage fallback when Firebase is unavailable

### 💬 Messaging
- **Real-time messaging** with Firebase integration
- **Text messages** with multi-line support
- **Photo sharing** - Send and receive images
- **Stickers & Emojis** - 12+ cute stickers and 50+ romantic emojis
- **Typing indicators** - See when your partner is typing
- **Message reactions** - Double-tap to add ❤️ reactions

### 📱 Mobile First Design
- **Fully responsive** - Works on phones, tablets, and desktops
- **Optimized for all screen sizes** - Including landscape mode
- **Touch-friendly UI** - Large buttons, smooth interactions
- **Notch-safe** - Respects iPhone notches and safe areas
- **Native feel** - Smooth scrolling, proper keyboard handling

### 🎨 Beautiful UI
- **Dark romantic theme** - Pink and purple gradients
- **Animations** - Floating hearts, smooth transitions
- **Message bubbles** - Distinct colors for each person
- **Profile pictures** - Set custom photos as avatars
- **Toast notifications** - Feedback on every action

### 🔄 Sync & Storage
- **Firebase Realtime Database** - Instant message sync across devices
- **Automatic fallback** - Uses localStorage if Firebase unavailable
- **Message persistence** - Keeps last 200 messages
- **Photo storage** - Custom avatars saved locally

### 🔔 Notifications
- **Browser notifications** - Get alerted for new romantic messages
- **Smart notifications** - Only for messages with romantic keywords
- **Toast messages** - In-app notifications for all actions

## 🚀 Quick Start

### Installation
1. Download or clone this repository
2. Open `lovechat.html` in a web browser
3. Enter PIN **143** (Nabin) or **1432** (Karu) to login

### Using with Firebase
The app comes pre-configured with a Firebase Realtime Database. Messages sync automatically across devices for both users.

**To use your own Firebase:**
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Get your config and replace `firebaseConfig` in the HTML
3. Ensure Database Rules allow read/write for your users

**Sample Firebase Rules:**
```json
{
  "rules": {
    "lovechat_messages": {
      ".read": true,
      ".write": true
    }
  }
}
```

### No Firebase? No Problem!
The app works perfectly with **localStorage fallback** for local-only messaging. Perfect for:
- Testing on your local machine
- Keeping messages private on one device
- Offline usage with persistent storage

## 🎮 How to Use

### Login
- Tap numpad to enter 3 or 4 digit PIN
- Click **"Click to Enter"** button
- Welcome message appears!

### Send Messages
1. Type your message in the input field
2. Press **Enter** or tap send button (💌)
3. Message appears instantly

### Share Photos
1. Tap the camera icon (📷)
2. Select a photo from your gallery
3. Photo appears in chat as message

### Add Stickers & Emojis
1. Tap the smiley icon (😊)
2. Choose **Emoji** or **Stickers** tab
3. Click emoji to add to message, or click sticker to preview
4. Double-click sticker to send immediately

### Change Your Profile Photo
1. Click your avatar in the header
2. Select a photo from your device
3. Avatar updates for your partner instantly

### Reactions
- Double-tap any message bubble to add ❤️ reaction

## 📱 Device Support

| Device | Status | Notes |
|--------|--------|-------|
| iPhone | ✅ Full Support | Works great, respects notch |
| Android | ✅ Full Support | All modern versions |
| iPad | ✅ Full Support | Landscape & portrait |
| Desktop | ✅ Full Support | Chrome, Firefox, Safari, Edge |
| Tablets | ✅ Full Support | 7" to 12.9" screens |

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, animations, media queries
- **JavaScript (Vanilla)** - No frameworks, lightweight
- **Firebase Realtime Database** - Cloud messaging
- **LocalStorage API** - Local message persistence

### File Structure
```
lovechat.html          # Single HTML file with everything
├── HTML              # Structure & markup
├── CSS               # Styling & responsive design
└── JavaScript        # All functionality
```

### Key Functions
- `sendMessage()` - Send text messages
- `sendPhoto()` - Send image photos
- `sendSticker()` - Send stickers/emojis
- `renderMessages()` - Display all messages
- `pushMessage()` - Save to Firebase + localStorage
- `loginAs()` - User authentication
- `scrollBottom()` - Keep chat scrolled to latest message

### Data Format
Messages are stored as JSON objects:
```javascript
{
  sender: "143",              // User PIN
  type: "text|photo|sticker", // Message type
  content: "...",             // Message/image data
  time: "10:30 AM",          // Formatted timestamp
  ts: 1234567890             // Unix timestamp
}
```

### localStorage Keys
- `lovechat_msgs` - All messages array
- `lovechat_photo_143` - Nabin's profile photo
- `lovechat_photo_1432` - Karu's profile photo

## 🎨 Customization

### Change User Names & Avatars
Edit the `PASSWORDS` object in the script:
```javascript
const PASSWORDS = {
  143: { name: "Nabin", avatar: "💙", color: "me" },
  1432: { name: "Karu", avatar: "🌸", color: "her" },
};
```

### Change Emojis
Edit the `EMOJIS` array in the script

### Change Stickers
Replace URLs in the `STICKERS` array with your own

### Change Colors
Modify CSS variables in `:root` selector:
```css
:root {
  --rose: #ff6b9d;
  --deep-rose: #c0396b;
  --bg: #1a0a12;
  /* ... */
}
```

## 📦 Deployment

### GitHub Pages (Free Hosting)
1. Create a new GitHub repository named `anniversary-webpage`
2. Upload `lovechat.html` to the repository
3. Go to **Settings** → **Pages**
4. Select **main** branch as source
5. Your app is now live at `https://yourusername.github.io/anniversary-webpage/lovechat.html`

### Other Hosting Options
- **Netlify** - Drag & drop `lovechat.html`
- **Vercel** - Connect your GitHub repo
- **Firebase Hosting** - Free tier available
- **Any static host** - Works with any web server

### Share the Link
Send your partner the link:
```
https://yourusername.github.io/anniversary-webpage/lovechat.html
```

## 🔒 Privacy & Security

✅ **What's Private:**
- Your chats are only shared between the two of you
- Firebase Realtime Database is configured for both users only
- No ads, no tracking, no third-party services

⚠️ **Important Notes:**
- Change default PINs before deploying publicly
- Messages are stored unencrypted in Firebase (for simplicity)
- For sensitive chats, use with trusted partner only
- Regular backups recommended

## 🐛 Troubleshooting

### Messages not sending?
- Check internet connection
- Open browser developer console (F12) for errors
- Firebase might be loading slowly - wait 3 seconds
- App will fall back to localStorage automatically

### Photos not showing?
- Ensure image file is not too large (< 5MB recommended)
- Storage quota in localStorage is limited (~5-10MB)
- Try reducing image size and re-uploading

### Stickers not loading?
- Check internet connection
- Giphy URLs might be temporarily unavailable
- Refresh page or try again in a moment

### Not seeing partner's messages?
- Ensure Firebase is initialized (check console)
- Both users should be using latest version
- Try refreshing the page
- Check Firebase console for errors

## 💡 Tips & Tricks

- **Keyboard shortcut**: Shift+Enter to add new line in message
- **Quick sticker send**: Double-click a sticker to send immediately
- **Emoji in messages**: Click emoji to add to your message before sending
- **Close emoji panel**: Click in the message area to hide panel
- **Search stickers**: Type in the search box to filter stickers
- **Notifications**: Allow notifications for romantic message alerts

## 📝 License

This project is free to use, modify, and deploy for personal use.

## 💕 Credits

Built with ❤️ for a special someone. Perfect for:
- 💑 Anniversaries
- 🎂 Birthdays
- 💍 Engagements
- 💌 Long distance relationships
- 👫 Just because you love each other

---

**Made with love** ✨💕✨

Have fun chatting! 🎉
