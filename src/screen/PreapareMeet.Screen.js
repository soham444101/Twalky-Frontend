import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWS } from '../services/api/WSProvider';
import { meetStore } from '../services/meetStorage.services';
import { useUserStore } from '../services/useStorage.services';
import { addHypen } from '../utlities/Helpers';
import { RTCView } from 'react-native-webrtc';
import { goBack, replace } from '../utlities/NavigationUtilities';
import {
  ChevronLeft,
  Mic,
  MicOff,
  Shield,
  Video,
  VideoOff,
  Info,
  Share,
} from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../utlities/Constant';
import { useStreamStore } from '../services/useStream.store';
import Toast from '../utlities/Toast';

const PreapareMeetScreen = () => {
  const { emit, on, off } = useWS();
  const { addParticipant, sessionId, addSessionId, toggle, micOn, videoOn, removeSessionId } = meetStore();
  const { user } = useUserStore();
  const [participants, setParticipants] = useState([]);
  const [joinClick, setJoinClick] = useState(false)
  const stream = useStreamStore((s) => s.stream);

  useEffect(() => {
    const handleParticipantUpdate = updatedParticipants => {
      console.log("Participant list coming from backend", updatedParticipants);
      if (updatedParticipants?.participant?.length === 0) {
        return;
      }
      setParticipants(updatedParticipants.participant || []);
    };


    on('session-info', handleParticipantUpdate);

    if (stream) {
      console.log("Stream available, setting initial mic/video state");
      // toggleLocal("mic");
      // toggleLocal("video");
    } else {
      console.warn("Stream not available yet in PreapareMeetScreen");
    }

    console.log("Local stream in Prepare meet:", stream);

    return () => {
      off('session-info', handleParticipantUpdate);
    };
  }, [stream]);


  const toggleMicState = useCallback(() => {
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (!audioTrack) {
      ToastAndroid.show("Mic not ready yet", ToastAndroid.SHORT);
      return;
    }
    audioTrack.enabled = !micOn
    toggle("mic")
  }, [])

  const toggleVideoState = useCallback(() => {
    const videoTrack = stream?.getVideoTracks?.()[0];
    console.log("video Track in [toggleVideoState]", videoTrack)
    if (!videoTrack) {
      ToastAndroid.show("Video not ready yet", ToastAndroid.SHORT);
      return;
    }
    console.log("[visiable.enable] ",videoTrack.enabled)
    videoTrack.enabled = !videoOn;
    toggle('video');
    console.log("[visiable.enable after toggle] ",videoTrack.enabled)
  }, [])


  const handleStartCall = async () => {
    try {
      if (!stream) {
        Toast.info("Getting camera/microphone stream")
        return;
      }
      if (joinClick) {
        return;
      }
      setJoinClick(true)


      emit('join-session', {
        name: user?.name,
        photo: user?.photo,
        userId: user?.id,
        sessionId,
        micOn,
        videoOn,
      });

      participants?.forEach(i => addParticipant(i));
      addSessionId(sessionId);
      replace('LiveMeetScreen');
    } catch (error) {
      console.log('Error starting call:', error);
      Toast.error("Fail to get Join meet")
      setJoinClick(false);
    }
  };

  const renderParticipantText = () => {
    if (!participants?.length) return 'No one is in the call yet';
    const names = participants.slice(0, 2).map(p => p.name).join(', ');
    const count = participants.length > 2 ? ` and ${participants.length - 2} others` : '';
    return `${names}${count} in the call`;
  };

  let backPressCount = useRef(0);
  const doingFlag = useRef();
  useEffect(() => {
    const backAction = () => {
      if (doingFlag.current) return;
      if (backPressCount.current === 0) {
        console.log('====================================');
        console.log("Back Action is call");
        console.log('====================================');
        backPressCount.current += 1;
        ToastAndroid.show("Press back again to leave", ToastAndroid.SHORT);

        // Reset counter after 2 seconds
        doingFlag.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

        return true; // prevent default back action
      } else {
        // Second press → Hangup and exit
        try {
          clearTimeout(doingFlag.current)
          deviceStore.getState().removeDevice();
          clear();
          console.log("user call leave-preaparescreen Event by mobil back button")
        } catch (error) {
          console.error("Error during cleanup on back press:", error);
        } finally {
          backPressCount.current = 0;
          if (doingFlag.current) clearTimeout(doingFlag.current);
          goBack();
          return false; // allow default back action (exit screen)
        }

        // This is avoid the user calling this above state many time 
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  return (
    <View style={prepareStyles.container}>
      <View style={prepareStyles.header}>
        <ChevronLeft
          size={RFValue(22)}
          onPress={() => {
            console.log("Back button pressed in prepare screen");
            goBack();
            removeSessionId();
          }}
          color={Colors.text}
        />
      </View>

      <ScrollView>
        <Text style={prepareStyles.sessionId}>{addHypen(sessionId)}</Text>

        <View style={prepareStyles.videoContainer}>
          {stream && videoOn ? (
            <RTCView
              streamURL={stream?.toURL()}
              objectFit="cover"
              mirror={true}
              style={prepareStyles.rtcView}
            />
          ) : (
            <View style={prepareStyles.imageView}>
              <Image source={{ uri: user?.photo }} style={prepareStyles.avatar} />
            </View>
          )}

          <View style={prepareStyles.toggleContainer}>
            <TouchableOpacity onPress={toggleMicState} style={prepareStyles.iconButton}>
              {micOn ? (
                <Mic size={RFValue(16)} color="#fff" />
              ) : (
                <MicOff size={RFValue(16)} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleVideoState} style={prepareStyles.iconButton}>
              {videoOn ? (
                <Video size={RFValue(16)} color="#fff" />
              ) : (
                <VideoOff size={RFValue(16)} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={prepareStyles.participantText}>{renderParticipantText()}</Text>

        <View style={prepareStyles.infoContainer}>
          <View style={prepareStyles.flexRowBetween}>
            <Info size={RFValue(14)} color={Colors.text} />
            <Text style={prepareStyles.joiningText}>Joining information</Text>
            <Share size={RFValue(14)} color={Colors.text} />
          </View>

          <View style={{ marginLeft: 38 }}>
            <Text style={prepareStyles.linkHeader}>Meeting Link</Text>
            <Text style={prepareStyles.linkText}>meet.Twalky.com/{addHypen(sessionId)}</Text>
          </View>

          <View style={prepareStyles.flexRow}>
            <Shield size={RFValue(14)} color={Colors.text} />
            <Text style={prepareStyles.encryptionText}>Encryption</Text>
          </View>
        </View>
      </ScrollView>

      <View style={prepareStyles.joinContainer}>
        <TouchableOpacity style={prepareStyles.joinButton} onPress={handleStartCall}>
          <Text style={prepareStyles.joinButtonText}>Join</Text>
        </TouchableOpacity>
        <Text style={prepareStyles.noteText}>Joining as</Text>
        <Text style={prepareStyles.peopleText}>{user?.name}</Text>
      </View>
    </View>
  );
};

export default PreapareMeetScreen;

const prepareStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
  },
  sessionId: {
    textAlign: 'center',
    fontSize: RFValue(14),
    color: Colors.subtext,
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: "center",
    marginTop: 12,
  },
  rtcView: {
    width: 220,
    height: 320,
    backgroundColor: '#000',
  },
  imageView: {
    width: 220,
    height: 320,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    width: RFValue(50),
    height: RFValue(50),
    borderRadius: RFValue(40)
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  iconButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 50,
  },
  participantText: {
    textAlign: 'center',
    marginVertical: 12,
    color: Colors.subtext,
  },
  infoContainer: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joiningText: {
    fontWeight: 'bold',
    fontSize: RFValue(12),
    color: Colors.text,
  },
  linkHeader: {
    marginTop: 10,
    fontSize: RFValue(12),
    color: Colors.subtext,
  },
  linkText: {
    fontSize: RFValue(14),
    color: Colors.text,
    fontWeight: 'bold',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  encryptionText: {
    fontSize: RFValue(12),
    color: Colors.subtext,
  },
  joinContainer: {
    padding: 16,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(14),
  },
  noteText: {
    marginTop: 8,
    fontSize: RFValue(12),
    color: Colors.subtext,
  },
  peopleText: {
    fontSize: RFValue(14),
    color: Colors.text,
    fontWeight: 'bold',
  },
});