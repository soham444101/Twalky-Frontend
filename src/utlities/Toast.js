import { ToastAndroid, Platform, Alert } from 'react-native';

/**
 * Cross-platform Toast utility
 * Uses ToastAndroid on Android, Alert on iOS
 */

class Toast {
  /**
   * Show a short toast message (2 seconds)
   * @param {string} message - Message to display
   */
  static showShort(message) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // Fallback for iOS
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  }

  /**
   * Show a long toast message (3.5 seconds)
   * @param {string} message - Message to display
   */
  static showLong(message) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  }

  /**
   * Show success message with ✅ emoji
   * @param {string} message - Success message
   */
  static success(message) {
    const text = `✅ ${message}`;
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

  /**
   * Show error message with ❌ emoji
   * @param {string} message - Error message
   */
  static error(message) {
    const text = `❌ ${message}`;
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

  /**
   * Show info message with ℹ️ emoji
   * @param {string} message - Info message
   */
  static info(message) {
    const text = `ℹ️ ${message}`;
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

  /**
   * Show warning message with ⚠️ emoji
   * @param {string} message - Warning message
   */
  static warning(message) {
    const text = `⚠️ ${message}`;
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

  /**
   * Show custom positioned toast
   * @param {string} message - Message to display
   * @param {string} position - 'TOP' | 'CENTER' | 'BOTTOM'
   * @param {string} duration - 'SHORT' | 'LONG'
   */
  static showWithPosition(message, position = 'BOTTOM', duration = 'SHORT') {
    if (Platform.OS === 'android') {
      const gravity = ToastAndroid[position] || ToastAndroid.BOTTOM;
      const time = ToastAndroid[duration] || ToastAndroid.SHORT;
      ToastAndroid.showWithGravity(message, time, gravity);
    } else {
      Alert.alert('', message);
    }
  }

  /**
   * Show custom toast with offset
   * @param {string} message - Message to display
   * @param {number} xOffset - Horizontal offset
   * @param {number} yOffset - Vertical offset
   */
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