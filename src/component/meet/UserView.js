import { View, Text, PanResponder, Animated, Image, StyleSheet, Dimensions } from 'react-native';
import React, { useRef, useMemo, useCallback } from 'react';
import { RTCView } from 'react-native-webrtc';
import { meetStore } from '../../services/meetStorage.services';
import { useUserStore } from '../../services/useStorage.services';


const UserView = ({ containerDimensions, localStream }) => {
  const { width: containerWidth, height: containerHeight } = containerDimensions;
  console.log('====================================');

  console.log("Height Of screen",containerHeight);
  console.log('====================================');
  const { videoOn } = meetStore();
  const { user } = useUserStore();
  
  console.log('====================================');
  console.log("UserView Localstream", localStream);
  console.log("UserView toURL()", localStream.toURL());
  console.log("User", user);
  console.log("PanResponce ", panResponder);
  // console.log("...panResponder.panHandlers", ...panResponder.panHandlers);
  console.log('====================================');

  // Video view dimensions - using fixed percentages for consistency
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
    console.log('====================================');
    console.log("Distances We printing : ",distances);
    console.log('====================================');
    
    return distances.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    ).corner;
  }, [cornerPositions]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start pan if there's significant movement
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations
        pan.stopAnimation();
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { 
          useNativeDriver: false,
          listener: (evt, gestureState) => {
            // Optional: Add haptic feedback or visual feedback during drag
          }
        }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        // Get current position
        const currentX = pan.x._value;
        const currentY = pan.y._value;
        
        // Apply boundaries to prevent going outside container
        const boundedX = Math.min(Math.max(currentX, 0), containerWidth - videoWidth);
        const boundedY = Math.min(Math.max(currentY, 0), containerHeight -videoHeight);
        
        // Find closest corner
        const closestCorner = findClosestCorner(boundedX, boundedY);
        const targetPosition = cornerPositions[closestCorner];
        
        // Animate to closest corner with spring animation
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

  // Memoized transform style for better performance
  const transformStyle = useMemo(() => ({
    transform: pan.getTranslateTransform(),
  }), [pan]);

  // Memoized video dimensions style
  const containerStyle = useMemo(() => ({
    position: 'absolute',
    width: videoWidth,
    height: videoHeight,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex:2
  }), [videoWidth, videoHeight]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[containerStyle, transformStyle]}
    >
      {user && (
        localStream && videoOn ? (
          <RTCView
            streamURL={localStream?.toURL()}
            style={styles.localVideo}
            mirror
            zOrder={2}
            objectFit="cover"
          />
        ) : (
          <>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.image} />
            ) : (
              <View style={styles.noVideo}>
                <Text style={styles.initial}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </>
        )
      )}
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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