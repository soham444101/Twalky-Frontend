import { View, Text, TouchableOpacity, Alert, FlatList, Image, StyleSheet, ToastAndroid } from 'react-native';
import React, { useEffect } from 'react';
import Homeheader from '../component/home/Home.Header.js';
import { Calendar, CirclePlus, ClipboardIcon, Code, LucideVideo, Plus, Video, VideoIcon, VideoOff, VideoOffIcon } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useUserStore } from '../services/useStorage.services.js';
import { navigate } from '../utlities/NavigationUtilities';
import { addHypen, removeHypen, requestAudio, requestVideo } from '../utlities/Helpers.js';
import { checkSession } from '../services/api/session.js';
import { meetStore } from '../services/meetStorage.services.js';
import { useWS } from '../services/api/WSProvider.js';
import { Colors } from '../utlities/Constant';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useStreamStore } from '../services/useStream.store.js';
import * as Clipboard from '@react-native-clipboard/clipboard';

const HomeScreen = () => {
  const { emit } = useWS();
  const { user, sessions, addSession, removeSession, hasAudioPermission, hasVideoPermission } = useUserStore();
  const { addSessionId, removeSessionId } = meetStore();
  const stream = useStreamStore((s) => s.stream);
  const initStream = useStreamStore((s) => s.initStream);



  const handleJoinNavigation = () => {
    if (!user?.name) {
      Alert.alert("Fill the form first");
      return;
    }
    console.log('====================================');
    console.log("user", user);
    console.log('====================================');
    navigate("JoinMeetScreen");
  };

  const handleSessionJoin = async (sessionId) => {
    console.log("Session Id in join session (Check SessioID) ", sessionId)
    if (!user?.name) {
      Alert.alert("Fill the form first");
      return;
    }
    if (!hasAudioPermission) {
      const isAudioOk = await requestAudio();
      if (!isAudioOk) { Alert.alert("Audio Permission Require"); return; }
    }
    if (!hasVideoPermission) {
      const isVideoOk = await requestVideo();
      if (!isVideoOk) { Alert.alert("Video Permission Require"); return; }
    }
    // That time we have the permission of both so we not need to ask permission

    const isValid = await checkSession(sessionId);

    if (isValid) {

      console.log('====================================');
      console.log("getstream befor", stream);
      console.log('====================================');


      if (!stream) {
        const returnStream = await initStream();
        if (!returnStream) {
          Alert.alert("Retry join we fails to get your Video Audio connection");
          return;
        }

        console.log('====================================');
        console.log("Stream return values", returnStream);
        console.log("Stream return values", returnStream.toURL());
        console.log('====================================');
      }



      emit("prepare-session", {
        userId: user?.id,
        sessionId: removeHypen(sessionId),
      });
      addSession(sessionId);/// this we can remove
      await addSessionId(sessionId);
      navigate("PreapareMeetScreen");
    } else {
      removeSession(sessionId);
      removeSessionId(sessionId);// this we can remove
      Alert.alert("No meeting exists with this ID.");
    }
  };


  const copyToClipboard = (item) => {
    Clipboard.default.setString(`Client://join/${item}`);
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
        <ClipboardIcon size={20} color="black" />
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
    <View style={styles.container} >
      <SafeAreaView />
      <Homeheader />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item}
        renderItem={renderSessionItem}
        contentContainerStyle={sessions.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={require("../assest/erasebg-transformed.png")} style={styles.image} />

            <Text style={styles.heading}>Video call and meeting for everyone</Text>
            <Text style={styles.subHeading}>Connect, collaborate, and celebrate</Text>
          </View>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
      />

      <View style={styles.fabCantainer}>
        <TouchableOpacity style={styles.fabButton1} onPress={handleJoinNavigation} >
          <Video size={RFValue(20)} color="#fff" />
          <Text style={styles.fabText}>Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabButton} onPress={handleJoinNavigation}>
          <CirclePlus size={RFValue(20)} color="#fff" />
          <Text style={styles.fabText}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // paddingTop:RFValue(10)
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
    backgroundColor: "green"
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
  }
  ,
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
  fabCantainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap:RFValue(25),
    // backgroundColor:"red",
    paddingBottom:RFValue(80),
    zIndex:2
  }

});