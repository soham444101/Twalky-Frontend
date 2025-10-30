import { ToastAndroid, Platform, Alert } from 'react-native';



class Toast {

  static showShort(message) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // Fallback for iOS
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  }


  static showLong(message) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  }

 
  static success(message) {
    const text = ` ${message}`;
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        text,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      Alert.alert('Success', message);
    }
  }

 
  static error(message) {
    const text = ` ${message}`;
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        text,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    } else {
      Alert.alert('Error', message);
    }
  }


  static info(message) {
    const text = ` ${message}`;
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        text,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } else {
      Alert.alert('Info', message);
    }
  }

  static warning(message) {
    const text = ` ${message}`;
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        text,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    } else {
      Alert.alert('Warning', message);
    }
  }


  static showWithPosition(message, position = 'BOTTOM', duration = 'SHORT') {
    if (Platform.OS === 'android') {
      const gravity = ToastAndroid[position] || ToastAndroid.BOTTOM;
      const time = ToastAndroid[duration] || ToastAndroid.SHORT;
      ToastAndroid.showWithGravity(message, time, gravity);
    } else {
      Alert.alert('', message);
    }
  }

  static showWithOffset(message, xOffset = 0, yOffset = 0) {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        xOffset,
        yOffset
      );
    } else {
      Alert.alert('', message);
    }
  }
}

export default Toast;