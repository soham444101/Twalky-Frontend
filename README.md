# 🎥 Twalky - Frontend

> **Status:** 🚧 Active Development | Auth & Notifications Complete | Mediasoup Integration In Progress

React Native mobile application for real-time video calling with secure authentication and push notifications.

---

## 📊 Project Status

| Feature | Status | Progress |
|---------|--------|----------|
| Google OAuth Authentication | ✅ Complete | 100% |
| JWT Token Management | ✅ Complete | 100% |
| Push Notifications (FCM) | ✅ Complete | 100% |
| Profile & Settings UI | ✅ Complete | 100% |
| Developer Debug Panel | ✅ Complete | 100% |
| Socket.io Client | ✅ Complete | 100% |
| Mediasoup Client Integration | 🚧 In Progress | 60% |
| Video Call UI | 🚧 In Progress | 40% |
| Call History | 📋 Planned | 0% |
| User Presence | 📋 Planned | 0% |

**Overall Progress:** 70% Complete

---

## 🔗 Related Repositories

- **Backend:** [Twalky-Backend](https://github.com/soham444101/Twalky-Backend)
- **Frontend:** You are here

---

## ✨ Implemented Features

### 🔐 Authentication System
- Google Sign-In integration via Firebase Auth
- Dual JWT token system (access + refresh)
- Automatic token refresh without user logout
- Secure token storage with AsyncStorage

### 🔔 Push Notifications
- Firebase Cloud Messaging (FCM) integration
- Foreground notifications with custom UI (Notifee)
- Background notification handling
- Notification tap navigation
- Android notification channels

### 👤 Profile Management
- Google account info display
- Notification preferences toggle
- Dark mode toggle (UI ready)
- Logout functionality

### 🔧 Developer Tools
- Hidden developer panel (tap version 5x)
- Real-time token inspection
- Socket.io connection monitoring
- FCM token display
- Copy tokens for testing

### 🔌 Real-Time Communication
- Socket.io client with authentication
- Automatic reconnection handling
- Event-based signaling system

---

## 📸 Screenshots

### Authentication & Profile
<table>
  <tr>
    <td><img src="docs/screenshots/login.png" width="200"/></td>
    <td><img src="docs/screenshots/profile.png" width="200"/></td>
    <td><img src="docs/screenshots/settings.png" width="200"/></td>
  </tr>
  <tr>
    <td align="center">Google Sign-In</td>
    <td align="center">Profile Screen</td>
    <td align="center">Settings</td>
  </tr>
</table>

### Developer Panel
<table>
  <tr>
    <td><img src="docs/screenshots/dev-panel-hidden.png" width="200"/></td>
    <td><img src="docs/screenshots/dev-panel-visible.png" width="200"/></td>
  </tr>
  <tr>
    <td align="center">Tokens Hidden</td>
    <td align="center">Tokens Visible</td>
  </tr>
</table>

### Push Notifications
<table>
  <tr>
    <td><img src="docs/screenshots/notification-foreground.png" width="200"/></td>
    <td><img src="docs/screenshots/notification-background.png" width="200"/></td>
  </tr>
  <tr>
    <td align="center">Foreground Notification</td>
    <td align="center">Background Notification</td>
  </tr>
</table>

---

## 🎬 Demo Video

> **Coming Soon:** Demo video showing authentication flow, developer panel, and push notifications

---

## 🛠️ Tech Stack

```json
{
  "framework": "React Native 0.80.2",
  "language": "JavaScript",
  "navigation": "React Navigation",
  "state": "Zustand",
  "storage": "AsyncStorage",
  "authentication": "Firebase Auth",
  "notifications": "FCM + Notifee",
  "realtime": "Socket.io Client",
  "video": "Mediasoup Client (In Progress)"
}
```

### Key Dependencies
```json
{
  "@react-native-firebase/app": "^22.4.0",
  "@react-native-firebase/auth": "^22.4.0",
  "@react-native-firebase/messaging": "^22.4.0",
  "@notifee/react-native": "^9.1.8",
  "@react-navigation/native": "^6.1.6",
  "@react-navigation/native-stack": "^7.3.22",
  "react-native": "0.80.2",
  "socket.io-client": "^4.x.x"
}
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18
Java JDK 17 (for Android)
React Native CLI
Android Studio / Xcode
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/soham444101/Twalky-Frontend.git
cd Twalky-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **iOS Setup (Mac only)**
```bash
cd ios
pod install
cd ..
```

4. **Add Firebase Configuration**

Download from [Firebase Console](https://console.firebase.google.com):
- `android/app/google-services.json`
- `ios/GoogleService-Info.plist`

5. **Configure Environment**

Create `.env` file:
```env
SOCKET_URL=http://your-backend-url:5000
API_URL=http://your-backend-url:5000
```

6. **Run the app**

```bash
# Start Metro
npm start

# Run Android
npm run android

# Run iOS
npm run ios
```

---

## 📁 Project Structure

```
src/
├── screens/
│   ├── LoginScreen.js
│   ├── ProfileScreen.js          # User profile & settings
│   ├── DeveloperScreen.js        # Debug panel
│   └── (VideoCall screens - in progress)
├── components/
│   ├── common/
│   └── auth/
├── services/
│   ├── authService.js            # Google Sign-In & JWT
│   ├── tokenService.js           # Token management
│   ├── notificationService.js    # FCM handler
│   ├── socketService.js          # Socket.io client
│   └── api.js                    # HTTP client with interceptors
├── navigation/
│   └── Navigation.js
├── store/
│   └── (Zustand stores)
└── utils/
    ├── constants.js
    └── helpers.js
```

---

## 🔐 Authentication Flow

```
User clicks "Sign in with Google"
    ↓
Firebase Google Auth
    ↓
Get Firebase ID Token
    ↓
Send to Backend API
    ↓
Backend verifies & returns JWT tokens
    ↓
Store in AsyncStorage
    ↓
Connect Socket.io with token
    ↓
Register FCM token
    ↓
Navigate to Home Screen
```

**Auto Token Refresh:**
```
API Request with expired token
    ↓
Axios Interceptor catches 401
    ↓
Use Refresh Token to get new Access Token
    ↓
Retry original request
    ↓
Success (user never notices)
```

---

## 🔔 Notification Flow

**Foreground (App Open):**
```javascript
messaging().onMessage(async (remoteMessage) => {
  // Display using Notifee
  await notifee.displayNotification({...});
});
```

**Background (App Minimized):**
```javascript
// index.js
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // Process notification
});
```

**Quit State (App Closed):**
```javascript
messaging().getInitialNotification().then((remoteMessage) => {
  // Navigate to specific screen
});
```

---

## 🔧 Developer Panel

Access by tapping app version 5 times on Profile screen.

**Features:**
- View Access Token & expiry
- View Refresh Token & expiry
- Monitor Socket.io connection
- Check FCM registration status
- Copy tokens for API testing
- Toggle token visibility

---

## 🚧 In Progress: Mediasoup Integration

Currently implementing Mediasoup client for scalable group video calls.

**What's Working:**
- Socket.io signaling
- Room creation/joining
- Participant tracking

**What's In Progress:**
- Producer/Consumer setup
- Video stream rendering
- Audio stream management
- Screen layout for multiple participants

**Estimated Completion:** 2-3 weeks

---

## 🐛 Known Issues

- [ ] Dark mode UI not fully implemented (toggle works, styles pending)
- [ ] Token refresh sometimes requires app restart (edge case)
- [ ] iOS notification permissions need better UX flow

---

## 🎯 Next Steps

**Short Term (1-2 weeks):**
- [ ] Complete Mediasoup client integration
- [ ] Implement video call UI with multiple participants
- [ ] Add call history storage

**Medium Term (3-4 weeks):**
- [ ] User presence system (online/offline)
- [ ] In-call chat functionality
- [ ] Screen sharing feature

**Long Term:**
- [ ] Call recording
- [ ] Virtual backgrounds
- [ ] Network quality indicators

---

## 🤝 Contributing

This is a portfolio/learning project. Not currently accepting contributions, but feedback is welcome!

---

## 👨‍💻 Author

**Soham Aswar**

- GitHub: [@soham444101](https://github.com/soham444101)
- Email: sohamaswar@gmail.com
- LinkedIn: [Soham Aswar](https://linkedin.com/in/sohamaswar)

---

## 📄 License

This project is for portfolio demonstration purposes.

---

## 🙏 Acknowledgments

- Firebase for authentication and messaging infrastructure
- Mediasoup team for excellent SFU documentation
- React Native community

---

## 📞 Contact

For questions about this project or collaboration:
- Email: sohamaswar@gmail.com
- LinkedIn: [Soham Aswar](https://linkedin.com/in/sohamaswar)

---

**⭐ If you found this project interesting, please star the repository!**

---

## 🔗 Quick Links

- [Backend Repository](https://github.com/soham444101/Twalky-Backend)
- [Firebase Console](https://console.firebase.google.com)
- [Mediasoup Documentation](https://mediasoup.org)

---

*Last Updated: November 2024*
