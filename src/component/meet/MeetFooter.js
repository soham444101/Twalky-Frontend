import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { goBack, resetAndNavigate } from '../../utlities/NavigationUtilities';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Hand, MoreVertical, PhoneCall } from 'lucide-react-native';
import { meetStore } from '../../services/meetStorage.services';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'react-native-linear-gradient';
import { Colors } from '../../utlities/Constant';
import { useWS } from '../../services/api/WSProvider';
const MeetFooter = ({ togglemic, togglevideo, hangup }) => {
  const { micOn, videoOn } = meetStore();
  const { emit } = useWS()

  const getIconStyle = isActive => ({
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF',
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  });
  const hangcall = () => {
    console.log('====================================');
    console.log("Hang Up call in meet footer");
    console.log('====================================');
    hangup()
  
  }
  const getIconColor = isActive => (isActive ? 'white' : 'black');

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      style={footerStyles.footerContainer}
    >
      <View style={footerStyles.iconContainer}>
        <TouchableOpacity
          style={footerStyles.callEndButton}
          onPress={() => hangcall()}
        >
          <PhoneCall color="white" size={RFValue(16)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={getIconStyle(micOn)}
          onPress={togglemic}
        >
          {micOn ? (
            <Mic color={getIconColor(micOn)} size={RFValue(14)} />
          ) : (
            <MicOff color={getIconColor(micOn)} size={RFValue(14)} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={getIconStyle(videoOn)}
          onPress={togglevideo}
        >
          {videoOn ? (
            <Video color={getIconColor(videoOn)} size={RFValue(14)} />
          ) : (
            <VideoOff color={getIconColor(videoOn)} size={RFValue(14)} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={footerStyles.singleIcon}>
          <Hand color="white" size={RFValue(14)} />
        </TouchableOpacity>

        <TouchableOpacity style={footerStyles.singleIcon}>
          <MoreVertical color="white" size={RFValue(14)} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default MeetFooter;

const footerStyles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    // paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
  },
  callEndButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 50,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
