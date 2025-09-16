import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { RTCView } from 'react-native-webrtc';
import { EllipsisVertical, MicOff } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const getGridStyle = (count, containerWidth, containerHeight) => {
    if (!containerWidth || !containerHeight) return {};

    switch (count) {
        case 1:
            return { width: '82%', height: '98%' };

        case 2:
            return { width: '82%', height: '48%' };

        case 3:
            return [
                { width: '82%', height: containerHeight * 0.5 },
                { width: '40%', height: containerHeight * 0.46 },
                { width: '40%', height: containerHeight * 0.46 },
            ];

        case 4:
            return { width: '40%', height: containerHeight * 0.46 };

        case 5:
        case 6:
            return {
                width: (containerWidth / 2) - 40,
                height: (containerHeight / 3) - 15,
            };

        default: {
            const maxCols = 2;
            const maxRows = 4;

            const itemWidth = (containerWidth / maxCols) - 40;
            const itemHeight = (containerHeight / maxRows) - 10;

            return {
                width: itemWidth,
                height: itemHeight,
            };
        }
    }
};

const People = ({ people, containerDimensions }) => {
    const maxVisibleUsers = 8;
    const visiblePeoples = people.slice(0, maxVisibleUsers);
   const othersCount = people?.length > maxVisibleUsers? people?.length - maxVisibleUsers : 0;

    const gridStyle = containerDimensions ?
        getGridStyle(
            visiblePeoples?.length
            , containerDimensions.width,
            containerDimensions.height
        ) : null;

return (
    <View style={peopleStyles.container}>
      {visiblePeoples?.map((person, index) => (
        <View
          key={index}
          style={[
            peopleStyles.card,
            person?.speaking && peopleStyles.speakingBorder,
            Array.isArray(gridStyle) ? gridStyle[index] : gridStyle,
          ]}
        >
          {person?.videoOn && person?.streamURL?.toURL() ? (
            <RTCView
              mirror
              objectFit="cover"
              streamURL={person?.streamURL?.toURL()}
              style={peopleStyles.rtcVideo}
            />
          ) : (
            <View style={peopleStyles.noVideo}>
              {person?.photo ? (
                <Image
                  source={{ uri: person?.photo }}
                  style={peopleStyles.image}
                />
              ) : (
                <Text style={peopleStyles.initial}>
                  {person?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              )}
            </View>
          )}

          {/* Mic Off */}
          {!person?.micOn && (
            <View style={peopleStyles.muted}>
              <MicOff color="#fff" size={RFValue(10)} />
            </View>
          )}

          {/* Ellipsis */}
          <View style={peopleStyles.ellipsis}>
            <EllipsisVertical color="#fff" size={RFValue(14)} />
          </View>

          {/* Others Count Badge (only for last person) */}
          {othersCount > 0 &&
            index === visiblePeoples?.length - 1 && (
              <TouchableOpacity
                style={peopleStyles.others}
                activeOpacity={0.8}
              >
                <Text style={peopleStyles.othersText}>
                  {othersCount} other{othersCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
        </View>
      ))}
    </View>
  );

}

export default People

const peopleStyles = new StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  speakingBorder: {
    borderWidth: 2,
    borderColor: '#00FF66',
  },
  rtcVideo: {
    width: '100%',
    height: '100%',
  },
  noVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  muted: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  ellipsis: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  others: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  othersText: {
    color: '#fff',
    fontSize: 12,
  },
});