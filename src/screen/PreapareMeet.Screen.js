import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useWS } from '../services/api/WSProvider';
import { meetStore } from '../services/meetStorage.services';
import { useUserStore } from '../services/useStorage.services';
import { addHypen, requestPermission } from '../utlities/Helpers';
import { mediaDevices, RTCView } from 'react-native-webrtc';
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
import { getStream, useStreamStore } from '../services/useStream.store';

const PreapareMeetScreen = () => {
  const { emit, on, off } = useWS();
  const { addParticipant, sessionId, addSessionId, toggle, micOn, videoOn, removeSessionId } = meetStore();
  const { user } = useUserStore();
  const [participants, setParticipants] = useState([]);


  // console.log("OurlocalStream in Preapration meet ", stream);
  const stream = useStreamStore((s) => s.stream);

  useEffect(() => {
    const handleParticipantUpdate = updatedParticipants => {
      setParticipants(updatedParticipants?.participants || []);
    };
    on('session-info', handleParticipantUpdate);

    toggleLocal("mic");
    toggleLocal("video")

    console.log("OurlocalStream in Preapration meet ", stream);

    return () => {
      off('session-info', handleParticipantUpdate);
    };
  }, []);

  const toggleMicState = newState => {
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (audioTrack) audioTrack.enabled = newState;
  };

  const toggleVideoState = newState => {
    const videoTrack = stream?.getVideoTracks?.()[0];
    if (videoTrack) videoTrack.enabled = newState;
  };

  const toggleLocal = type => {
    if (type === 'mic') {
      const newMicState = !micOn;
      toggleMicState(newMicState);
      toggle('mic');
    } else if (type === 'video') {
      const newVideoState = !videoOn;
      toggleVideoState(newVideoState);
      toggle('video');
    }
  };

  const handleStartCall = async () => {
    try {
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
    }
  };

  const renderParticipantText = () => {
    if (!participants?.length) return 'No one is in the call yet';
    const names = participants.slice(0, 2).map(p => p.name).join(', ');
    const count = participants.length > 2 ? ` and ${participants.length - 2} others` : '';
    return `${names}${count} in the call`;
  };



  return (
    <View style={prepareStyles.container}>
      <View style={prepareStyles.header}>
        <ChevronLeft
          size={RFValue(22)}
          onPress={() => {
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
              streamURL={stream.toURL()}
              objectFit="cover"
              mirror={true}
              style={prepareStyles.rtcView}
            />
          ) : (
            <Image source={{ uri: user?.photo }} style={prepareStyles.avatar} />
          )}

          <View style={prepareStyles.toggleContainer}>
            <TouchableOpacity onPress={() => toggleLocal('mic')} style={prepareStyles.iconButton}>
              {micOn ? (
                <Mic size={RFValue(16)} color="#fff" />
              ) : (
                <MicOff size={RFValue(16)} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleLocal('video')} style={prepareStyles.iconButton}>
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
    marginTop: 12,
  },
  rtcView: {
    width: 220,
    height: 320,
    // borderRadius: 12,
    backgroundColor: '#000',
  },
  avatar: {
    width: 220,
    height: 320,
    // borderRadius: 12,
    backgroundColor: Colors.surface,
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
