import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { ChevronLeft, Video } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { goBack, navigate } from '../utlities/NavigationUtilities';
import { Colors } from '../utlities/Constant';
import { useUserStore } from '../services/useStorage.services';
import { meetStore } from '../services/meetStorage.services';
import { useWS } from '../services/api/WSProvider';
import { checkSession, createSession } from '../services/api/session';
import { removeHypen, requestAudio, requestVideo } from '../utlities/Helpers.js';
import LinearGradient from 'react-native-linear-gradient';
import { useStreamStore } from "../services/useStream.store.js";
import Toast from "../utlities/Toast.js"
const JoinMeetScreen = () => {
  const { addSession, user, removeSession, hasVideoPermission, hasAudioPermission } = useUserStore();
  const { addSessionId, removeSessionId } = meetStore();
  const [code, setCode] = useState('');
  const { emit } = useWS();
  const stream = useStreamStore((s) => s.stream);
  const initStream = useStreamStore((s) => s.initStream);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const createNewMeet = async () => {
    if (!user?.id) {
      navigate('HomeScreen');
      Toast.warning("Please fill your details first");
      return;
    }

    Toast.info("Creating meeting...");

    console.log('====================================');
    console.log("createNewMeet Calling");
    console.log(hasAudioPermission, hasVideoPermission);
    console.log('====================================');

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

    setIsCreating(true);
    const sessionId = await createSession();
    console.log('====================================');
    console.log("Session created:", sessionId);
    console.log("Current stream:", stream);
    console.log('====================================');

    if (sessionId) {
      if (!stream) {
        const streams = await initStream();
        if (!streams) {
          Alert.alert("Retry - Failed to get video/audio media");
          setIsCreating(false)
          return;
        }

        console.log('====================================');
        console.log("Stream initialized:", streams);
        console.log('====================================');
      }

      addSession(sessionId);
      addSessionId(sessionId);
      emit('prepare-session', {
        userId: user?.id,
        sessionId,
      });
      navigate('PreapareMeetScreen');
    } else {
      console.error('Error in JoinMeetScreen createNewMeet', sessionId);
      Toast.error("Fail to create the meet");
    }
    setIsCreating(false)
  };

  const joinViaSessionId = async () => {
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

    // Validate code
    if (!code || code?.length < 9) {
      Toast.warning("Enter valide Code");
      return;
    }


    console.log("Code to join:", code);
    console.log("Code without hyphen:", removeHypen(code));

    setIsJoining(true);
    const newCode = removeHypen(code);
    const isAvailable = await checkSession(newCode);
    console.log("Session available:", isAvailable);

    if (isAvailable) {
      if (!stream) {
        const streams = await initStream();
        if (!streams) {
          Toast.error("Failed to access camera/microphone");
          return;
        }

        const videoTracks = streams.getVideoTracks();
        const audioTracks = streams.getAudioTracks();

        if (!videoTracks || videoTracks.length === 0) {
          Toast.error("Failed to access camera");
          return;
        }

        if (!audioTracks || audioTracks.length === 0) {
          Toast.error("Failed to access microphone");
          return;
        }

        console.log('====================================');
        console.log("Stream initialized:", streams);
        console.log("Video tracks:", videoTracks.length);
        console.log("Audio tracks:", audioTracks.length);
        console.log('====================================');
      }

      addSession(newCode);
      await addSessionId(newCode);
      emit('prepare-session', {
        userId: user?.id,
        sessionId: newCode,
      });
      navigate('PreapareMeetScreen');
    } else {
      removeSession(newCode);
      removeSessionId(newCode);
      setCode('');
      Toast.error("Meeting not found or has ended");
    }
    setIsJoining(false)

  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChevronLeft size={RFValue(18)} onPress={goBack} color={Colors.text} />
        <Text style={styles.title}>Join Meet</Text>
      </View>

      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.createButton}
      >
        <TouchableOpacity activeOpacity={0.8} onPress={createNewMeet}>
          <View style={styles.createContent}>
            <Video size={RFValue(22)} color="#fff" />
            {isCreating ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.createText}>Create New Meet</Text>
            )}

          </View>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Enter the meet code provided by meeting organiser
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter code"
          placeholderTextColor={Colors.muted}
          onChangeText={setCode}
          returnKeyType="go"
          onSubmitEditing={joinViaSessionId}
        />
        <TouchableOpacity style={styles.joinBtn} onPress={joinViaSessionId}>
          {isJoining ? (<ActivityIndicator color="#fff" size={RFValue(10)} />) : (<Text style={styles.joinBtnText}>Join</Text>
          )}

        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JoinMeetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  createButton: {
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    elevation: 3,
  },
  createContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: 'bold',
    marginLeft: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: RFValue(12),
    color: Colors.subtext,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: RFValue(12),
    color: Colors.subtext,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBg,
    padding: 12,
    borderRadius: 8,
    fontSize: RFValue(14),
    marginBottom: 12,
    color: Colors.text,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: 'bold',
  },
});