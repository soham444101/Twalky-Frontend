import { View, Text, TouchableOpacity, Alert, FlatList, Image, StyleSheet, ToastAndroid } from 'react-native';
import React, { useEffect } from 'react';
import Homeheader from '../component/home/Home.Header.js';
import { Calendar, CirclePlus, ClipboardIcon, Video } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useUserStore } from '../services/useStorage.services.js';
import { navigate } from '../utlities/NavigationUtilities';
import { addHypen, removeHypen, requestAudio, requestVideo } from '../utlities/Helpers.js';
import { checkSession } from '../services/api/session.js';
import { meetStore } from '../services/meetStorage.services.js';
import { useWS } from '../services/api/WSProvider.js';
import { Colors } from '../utlities/Constant';
import { useStreamStore } from '../services/useStream.store.js';
import * as Clipboard from '@react-native-clipboard/clipboard';
import Toast from '../utlities/Toast.js';

const HomeScreen = () => {
  const { emit } = useWS();
  const { user, sessions, addSession, removeSession, hasAudioPermission, hasVideoPermission } = useUserStore();
  const { addSessionId, removeSessionId } = meetStore();
  const stream = useStreamStore((s) => s.stream);
  const initStream = useStreamStore((s) => s.initStream);

  const handleJoinNavigation = () => {
    if (!user?.name) {
      Toast.warning("Please fill your details first");
      return;
    }
    console.log('====================================');
    console.log("User:", user);
    console.log('====================================');
    navigate("JoinMeetScreen");
  };

  const handleSessionJoin = async (sessionId) => {
    console.log("Session ID to join:", sessionId);

    if (!user?.name) {
      Toast.warning("Please fill your details first");
      return;
    }

    // Check permissions
    if (!hasAudioPermission) {
      const isAudioOk = await requestAudio();
      if (!isAudioOk) {
        Toast.error("Audio permission required");
        return;
      }
    }
    if (!hasVideoPermission) {
      const isVideoOk = await requestVideo();
      if (!isVideoOk) {
        Toast.error("Video permission required");
        return;
      }
    }

    // Validate session exists
    const isValid = await checkSession(sessionId);

    const newSessionId = removeHypen(sessionId);
    if (isValid) {
      console.log('====================================');
      console.log("Session is valid, current stream:", stream);
      console.log('====================================');

      // Initialize stream if not available
      if (!stream) {
        // Toast.info("Initializing camera...");
        const returnStream = await initStream();
        if (!returnStream) {
          Toast.error("Failed to access camera/microphone");
          return;
        }

        console.log('====================================');
        console.log("Stream initialized successfully");
        console.log("Stream URL:", returnStream.toURL());
        console.log('====================================');
      }

      emit("prepare-session", {
        userId: user?.id,
        sessionId: newSessionId,
      });
      console.log("After Prepare-session event call")
      addSession(newSessionId);
      addSessionId(newSessionId);
      navigate("PreapareMeetScreen");
      console.log("Navigating")
      Toast.success("Joining meeting!");

    } else {
      removeSession(newSessionId);
      removeSessionId();
      Toast.error("Meeting not found or has ended");
    }
  };

  const copyToClipboard = (item) => {
    Clipboard.default.setString(`${addHypen(item)}`);
    ToastAndroid.show('Link copied to clipboard!', ToastAndroid.SHORT);
  };

  const renderSessionItem = ({ item }) => (
    <View style={styles.sessionItem}>
      <Calendar size={RFValue(20)} color={Colors.primary} />
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionText}>{addHypen(item)}</Text>
      </View>
      <TouchableOpacity
        style={styles.clipboard}
        onPress={() => copyToClipboard(item)}
      >
      <ClipboardIcon size={20} color={Colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleSessionJoin(item)}
      >
        <Text style={styles.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Homeheader />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item}
        renderItem={renderSessionItem}
        contentContainerStyle={sessions.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require("../assest/erasebg-transformed.png")}
              style={styles.image}
            />
            <Text style={styles.heading}>Video call and meeting for everyone</Text>
            <Text style={styles.subHeading}>Connect, collaborate, and celebrate</Text>
          </View>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton1} onPress={handleJoinNavigation}>
          <Video size={RFValue(20)} color="#fff" />
          <Text style={styles.fabText}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabButton} onPress={handleJoinNavigation}>
          <CirclePlus size={RFValue(20)} color="#fff" />
          <Text style={styles.fabText}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  sessionText: {
    fontSize: RFValue(14),
    color: Colors.text,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(12),
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: 200,
    marginBottom: 20,
  },
  heading: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: Colors.text,
  },
  subHeading: {
    fontSize: RFValue(12),
    color: Colors.subtext,
    marginTop: 4,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 20,
    paddingHorizontal: 24,
    elevation: 3,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(14),
    marginLeft: 10,
  },
  clipboard: {
    marginHorizontal: RFValue(10)
  },
  fabButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 20,
    paddingHorizontal: 24,
    elevation: 3
  },
  fabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: RFValue(25),
    paddingBottom: RFValue(80),
    zIndex: 2
  }
});
export default HomeScreen;