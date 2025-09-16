import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMediaTrackfun, getStream, useStreamStore } from "../services/useStream.store.js"

const JoinMeetScreen = () => {
  const { addSession, user, removeSession, hasVideoPermission, hasAudioPermission } = useUserStore();
  const { addSessionId, removeSessionId } = meetStore();
  const [code, setCode] = useState('');
  const { emit } = useWS();
  const stream = useStreamStore((s) => s.stream);
  const initStream = useStreamStore((s) => s.initStream);


  const createNewMeet = async () => {
    if (!user?.id) {
      navigate('HomeScreen');
      Alert.alert("Fill the details first")
      return;
    }

    console.log('====================================');
    console.log("createNewMeet Calling");
    console.log(hasAudioPermission, hasVideoPermission);
    console.log('====================================');
    if (!hasAudioPermission) {
      const isAudioOk = await requestAudio();
      if (!isAudioOk) { Alert.alert("Audio Permission Require"); return; }
    }
    if (!hasVideoPermission) {
      const isVideoOk = await requestVideo();
      if (!isVideoOk) { Alert.alert("Video Permission Require"); return; }
    }


    const sessionId = await createSession(); // Make sure this function is correctly imported/defined
    console.log('====================================');
    console.log("getstream befor", stream);
    console.log('====================================');
    if (sessionId) {
      if (!stream) {
        const streams = await initStream();
        if (!streams) {
          Alert.alert("Retry We fail to get video media");
          return;
        }

        console.log('====================================');
        console.log("Stream return values", streams);
        console.log('====================================');
      }
      addSession(sessionId);
      addSessionId(sessionId);
      emit('prepare-session', {
        userId: user?.id,
        sessionId,
      });
      navigate('PreapareMeetScreen');
      return;
    } else {
      console.error('Error in JoinMeetScreen createNewMeet', sessionId);
    }
  };

  const joinViaSessionId = async () => {
    if (!hasAudioPermission) {
      const isAudioOk = await requestAudio();
      if (!isAudioOk) { Alert.alert("Audio Permission Require"); return; }
    }
    if (!hasVideoPermission) {
      const isVideoOk = await requestVideo();
      if (!isVideoOk) { Alert.alert("Video Permission Require"); return; }
    }
    if (!code || code?.length < 6) {
      Alert.alert('Enter valid meeting code');
    }
    const isAvailable = await checkSession(removeHypen(code));
    if (isAvailable) {

      if (!stream) {


        const streams = await getMediaTrackfun();
        if (!streams) {
          Alert.alert("Retry join we fails to get your Video Audio connection");
          return;
        }
        if (!streams.getVideoTracks()) {
          Alert.alert("Audio track we got fail to got video one");
          return;
        }
        console.log('====================================');
        console.log("Stream return values", streams);
        console.log('====================================');

      }
      addSession(code);
      await addSessionId(code);
      emit('prepare-session', {
        userId: user?.id,
        sessionId: removeHypen(code),
      });
      navigate('PreapareMeetScreen');
    } else {
      removeSession(code);
      removeSessionId(code);// this we can remove
      setCode('');
      Alert.alert('There is no active meeting with this code.');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
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
            <Text style={styles.createText}>Create New Meet</Text>
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
          <Text style={styles.joinBtnText}>Join Now</Text>
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
