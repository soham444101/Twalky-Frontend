import { View, Text, PanResponder, Animated, Image, StyleSheet } from 'react-native';
import React, { useRef, useMemo, useCallback, useState } from 'react';
import { RTCView } from 'react-native-webrtc';
import { meetStore } from '../../services/meetStorage.services';
import { useUserStore } from '../../services/useStorage.services';
import { RFValue } from 'react-native-responsive-fontsize';
import { getInitials, isValidImageUrlCached } from "../../utlities/imageUrlValidater.js"
const UserView = ({ containerDimensions, localStream }) => {
  const { width: containerWidth, height: containerHeight } = containerDimensions;
  const { videoOn } = meetStore();
  const { user } = useUserStore();

  // Track if image failed to load
  const [imageError, setImageError] = useState(false);

  // Video view dimensions
  const videoWidth = useMemo(() => containerWidth * 0.30, [containerWidth]);
  const videoHeight = useMemo(() => containerHeight * 0.20, [containerHeight]);

  // Initialize pan with bottom-right corner position
  const pan = useRef(
    new Animated.ValueXY({
      x: containerWidth - videoWidth - 10,
      y: containerHeight - videoHeight - 10,
    })
  ).current;

  // Corner positions with proper boundaries
  const cornerPositions = useMemo(() => ({
    topLeft: { x: 10, y: 10 },
    topRight: { x: containerWidth - videoWidth - 10, y: 10 },
    bottomLeft: { x: 10, y: containerHeight - videoHeight - 20 },
    bottomRight: { x: containerWidth - videoWidth - 10, y: containerHeight - videoHeight - 20 }
  }), [containerWidth, containerHeight, videoWidth, videoHeight]);

  const findClosestCorner = useCallback((x, y) => {
    const distances = Object.entries(cornerPositions).map(([corner, pos]) => ({
      corner,
      distance: Math.hypot(x - pos.x, y - pos.y)
    }));

    return distances.reduce((closest, current) =>
      current.distance < closest.distance ? current : closest
    ).corner;
  }, [cornerPositions]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.stopAnimation();
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const currentX = pan.x._value;
        const currentY = pan.y._value;
        const boundedX = Math.min(Math.max(currentX, 0), containerWidth - videoWidth);
        const boundedY = Math.min(Math.max(currentY, 0), containerHeight - videoHeight);
        const closestCorner = findClosestCorner(boundedX, boundedY);
        const targetPosition = cornerPositions[closestCorner];

        Animated.spring(pan, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
          overshootClamping: true,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const transformStyle = useMemo(() => ({
    transform: pan.getTranslateTransform(),
  }), [pan]);

  const containerStyle = useMemo(() => ({
    position: 'absolute',
    width: videoWidth,
    height: videoHeight,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2
  }), [videoWidth, videoHeight]);

  //  Validate photo URL
  const hasValidPhoto = useMemo(() => {
    return user?.photo && !imageError && isValidImageUrlCached(user.photo);
  }, [user?.photo, imageError]);

  // Handle image load error
  const handleImageError = useCallback(() => {
    console.log('Image failed to load for user:', user?.name);
    setImageError(true);
  }, [user?.name]);

  //  Reset error when photo URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  //  Render content based on video/photo state
  const renderContent = () => {
    if (localStream && videoOn) {
      return (
        <RTCView
          streamURL={localStream?.toURL()}
          style={styles.localVideo}
          mirror
          zOrder={2}
          objectFit="cover"
        />
      );
    }

    if (hasValidPhoto) {
      return (
        <View style={styles.imageView}>
          <Image
            source={{ uri: user.photo }}
            style={styles.image}
            onError={handleImageError}
          />
        </View>
      );
    }

    return (
      <View style={styles.noVideo}>
        <Text style={styles.initial}>
          {getInitials(user?.name)}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[containerStyle, transformStyle]}
    >
      {user && renderContent()}
      <Text style={styles.label}>You</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  localVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  imageView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
  },
  image: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: RFValue(20),
  },
  noVideo: {
    flex: 1,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    color: 'white',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default UserView;