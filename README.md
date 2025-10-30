# 🎥 Twalky : Meet App (Frontend - React Native CLI)

A **real-time video meeting app** built using **React Native CLI**, **WebRTC**, and **Socket.IO**.  
It allows multiple users to join a live meeting session, toggle mic/video, and communicate peer-to-peer with minimal latency.
---

## 🚀 Features

Real-time video & audio calling via **WebRTC**  
Multi-user session management using **Socket.IO**  
Toggle mic and camera  
Camera switching (front ↔ back)  
Auto cleanup on disconnect  
Zustand-based state management  

## 🧩 Tech Stack


 **Framework** : React Native CLI 
 **Real-Time** : WebRTC + Socket.IO |
 **State Management** : Zustand 
 **UI** : React Native + Lucide Icons 
 **Navigation** : React Navigation 
 **Local Storage** : MMKV 
 **Networking** : Axios 
 **Permissions** : react-native-permissions 

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```
git clone https://github.com/your-username/twalky-meet-client.git
cd twalky-meet-client
````

---

### 2️⃣ Install Dependencies

Make sure Node.js ≥ **18** and Java JDK ≥ **11** are installed.

```bash
npm install
```

---

### 3️⃣ Create `.env` File

In your project root, create a file named `.env`:

```bash
SOCKET_URL="http://your-backend-ip:5000"
API_URL="http://your-backend-ip:5000"
```

> ⚠️ Replace `your-backend-ip` with your system’s IPv4 address (e.g., `192.168.1.5`).
> This is crucial when testing from a physical Android device connected via USB or same Wi-Fi.

---

### 4️⃣ Configure Android Permissions

In your `android/app/src/main/AndroidManifest.xml`, ensure you have:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

---

### 5️⃣ Start the Metro Bundler

```bash
npm start
```

---

### 6️⃣ Run the App

#### For Android:

```bash
npm run android
```

#### For iOS (Mac only):

```bash
npm run ios
```


## 🧠 WebRTC Flow

1️⃣ User joins → emits `join-session`
2️⃣ Backend broadcasts → `new-participant`
3️⃣ Offer/Answer created → exchanged using Socket.IO
4️⃣ ICE candidates shared → direct P2P connection established
5️⃣ Media streams rendered live 🎥

---

## 🔌 WebSocket Events

| Event                                          | Description                    |
| ---------------------------------------------- | ------------------------------ |
| `join-session`                                 | Join an existing meeting       |
| `new-participant`                              | Notify others about new user   |
| `send-offer` / `receive-offer`                 | WebRTC SDP offer exchange      |
| `send-answer` / `receive-answer`               | WebRTC SDP answer exchange     |
| `send-ice-candidate` / `receive-ice-candidate` | ICE candidate signaling        |
| `participant-left`                             | Cleanup when user disconnects  |
| `hang-up`                                      | End call and reset connections |

---

## 🧱 Folder Structure

```
twalky-meet-client/
│
├── src/
│   ├── assest                        # Images to show 
│   │
│   ├── services/
│   │   ├── api/WSProvider.js         # Socket.IO connection manager
│   │   ├── api/Session.js            # Api Call here 
│   │   └── config.services.js        # Url based on platform and usecases
│   │   ├── meetStorage.services.js   # Meeting participants state
│   │   ├── storage.services.js       # MMKV Storage
│   │   ├── useStream.store.js        # Zustand store for media streams
│   │   └── useStorage.services.js    # User authentication & storage
│   │
│   ├── hooks/
│   │   └── useWebRTC.js              # Core WebRTC connection logic
│   │   └── useContainerDiemension.js # Getting the Diamension based on layout
│   │
│   ├── components/
│   │   ├── home/Home.Header.js        # Header componenet here
│   │   ├── home/InquireModel.js       # For getting and setting user date
│   │   ├── meet/MeetFooter.js         # LiveScreen footer Component
│   │   ├── meet/MeetHeader.js         # LiveScreen header Component
│   │   ├── meet/NoUserList.js         # LiveScreen when no user Present
│   │   ├── meet/People.js             # LiveScreen paticpant show by this component
│   │   ├── meet/UserView.js           # LiveScreen local user video component things here
│   │
│   ├── utilities/
│   │   ├── Helpers.js                # Peer config, constraints
│   │   └── NavigationUtils.js        # Navigation utilities for navigatuin
│   │   └── Toast.js                  # For show the error/warn/info in short message
│   │   └── Constant.js               # Constat value here
│   │
│   ├── navigation/
│   │   ├── Navigation.js            # Navigating file
│   │
│   ├── screens/
│   │   ├── HomeScreen.js             # Session creation/join
│   │   ├── PrepareMeetScreen.js      # Lobby (mic/camera preview)
│   │   └── LiveMeetScreen.js         # Main meeting UI
│   │   └── JoinMeet.Screen.js        # Here create/join meet using code 
│   │   └── Splash.Screen.js          # Starting page
│   │
│   └── App.js
│
├── package.json
├── babel.config.js
└── README.md
```
---

## 🧰 Useful Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm start`       | Start Metro bundler            |
| `npm run android` | Run on Android device/emulator |
| `npm run ios`     | Run on iOS                     |

---

## 🧠 Developer Notes

* 🧩 Run backend server before starting the client
* 📶 Keep both backend & device on same Wi-Fi network
* 🎥 Test camera/mic on physical device (emulators have limited media support)
* ⚡ Avoid duplicate SDP offers → handle via stable state check (`signalingState === "stable"`)
---

## 👩‍💻 Developer Info

**👩‍💻 Author:** Soham Aswar
**📧 Email:** [sohamaswar@gmail.com](mailto:sohamaswar@gmail.com)
**🔗 LinkedIn:** [linkedin.com/in/sohamaswar](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiu_OOsjcyQAxX0YfUHHVMJO7AQFnoECBsQAQ&url=https%3A%2F%2Fin.linkedin.com%2Fin%2Fsoham-aswar-18376b22a%3Ftrk%3Dpublic_profile_browsemap&usg=AOvVaw0ivsKXXKueS298YG0EHdQv&opi=89978449)


⭐ **If you find this project helpful, please give it a star on GitHub!**

