import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share as NativeShare,
  ToastAndroid,
} from 'react-native';
import * as Clipboard from '@react-native-clipboard/clipboard';
import { Clipboard as ClipboardIcon, Share as ShareIcon } from 'lucide-react-native';
import { Colors } from '../../utlities/Constant';
import { addHypen } from '../../utlities/Helpers';

const NoUserList = ({ sessionId }) => {
  const inviteLink = `https://twalky.com/${addHypen(sessionId)}`;
  console.log('====================================');
  console.log(Clipboard);
  console.log('====================================');

  const copyToClipboard = () => {
    Clipboard.default.setString(addHypen(sessionId));

    ToastAndroid.show('Link copied to clipboard!', ToastAndroid.SHORT);
  };

  const shareInvite = async () => {
    try {
      await NativeShare.share({
        message: `Join my meeting: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  return (
    <View style={inviteStyles.container}>
      <Text style={inviteStyles.headerText}>You're the only one here</Text>
      <Text style={inviteStyles.subText}>
        Share this meeting link with others that you want in the meeting
      </Text>

      <View style={inviteStyles.linkContainer}>
        <Text style={inviteStyles.linkText}>{inviteLink}</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <ClipboardIcon size={20} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={inviteStyles.shareButton} onPress={shareInvite}>
        <ShareIcon color="black" size={20} />
        <Text style={inviteStyles.shareText}>Share Invite</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example hyphen function
const addHyphens = (id) => {
  return id?.match(/.{1,4}/g)?.join('-');
};

export default NoUserList;

// Styles all in same file
const inviteStyles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    margin: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    marginRight: 10,
    color: '#222',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#d1e7dd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f5132',
  },
});
