import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { RTCView } from 'react-native-webrtc';
import { EllipsisVertical, MicOff } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { getInitials } from '../../utlities/Helpers';

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
            return {
                width: (containerWidth / maxCols) - 40,
                height: (containerHeight / maxRows) - 10,
            };
        }
    }
};

// Individual participant card component with error handling
const ParticipantCard = ({ person, gridStyle, index, showOthersCount, othersCount }) => {
    const [imageError, setImageError] = useState(false);

    console.log("ParticipantCard - Person:", {
        userId: person?.userId,
        name: person?.name,
        videoOn: person?.videoOn,
        hasStreamURL: !!person?.streamURL,
        streamURLType: typeof person?.streamURL,
    });

    // Handle image load error
    const handleImageError = useCallback(() => {
        console.log('Image failed to load for:', person?.name);
        setImageError(true);
    }, [person?.name]);

    //  Reset error when photo changes
    useEffect(() => {
        setImageError(false);
    }, [person?.photo]);

    // FIXED: Better stream URL handling - don't double-call toURL()
    const getStreamURL = () => {
        if (!person?.streamURL) {
            console.log('No streamURL for:', person?.name);
            return null;
        }

        try {
            // If it's already a string URL, return it
            if (typeof person.streamURL === 'string') {
                console.log('Stream URL is string:', person.streamURL);
                return person.streamURL;
            }

            // If it has toURL method, call it
            if (typeof person.streamURL.toURL === 'function') {
                const url = person.streamURL.toURL();
                console.log('Stream URL from toURL():', url);
                return url;
            }

            // If it has _URL property
            if (person.streamURL._URL) {
                console.log('Stream URL from _URL:', person.streamURL._URL);
                return person.streamURL._URL;
            }

            console.warn('Could not extract stream URL from:', person.streamURL);
            return null;
        } catch (error) {
            console.error('Error extracting stream URL:', error);
            return null;
        }
    };

    const streamURL = getStreamURL();
    const shouldShowVideo = person?.videoOn && streamURL;
    const hasValidPhoto = person?.photo && !imageError ;

    console.log('ParticipantCard render decision:', {
        name: person?.name,
        shouldShowVideo,
        streamURL,
        videoOn: person?.videoOn,
        hasValidPhoto,
    });

    //  Render video, photo, or initials
    const renderContent = () => {
        if (shouldShowVideo) {
            console.log('Rendering RTCView for:', person?.name, 'with URL:', streamURL);
            return (
                <RTCView
                    mirror={false}
                    objectFit="cover"
                    streamURL={streamURL} //  FIXED: Use the extracted URL directly
                    style={peopleStyles.rtcVideo}
                    zOrder={1}
                />
            );
        }

        if (hasValidPhoto) {
            console.log('Rendering photo for:', person?.name);
            return (
                <View style={peopleStyles.noVideo}>
                    <Image
                        source={{ uri: person.photo }}
                        style={peopleStyles.avatar}
                        onError={handleImageError}
                    />
                </View>
            );
        }

        console.log('Rendering initials for:', person?.name);
        return (
            <View style={peopleStyles.noVideo}>
                <Text style={peopleStyles.initial}>
                    {getInitials(person?.name)}
                </Text>
            </View>
        );
    };

    return (
        <View
            key={person?.userId || index}
            style={[
                peopleStyles.card,
                person?.speaking && peopleStyles.speakingBorder,
                Array.isArray(gridStyle) ? gridStyle[index] : gridStyle,
            ]}
        >
            {renderContent()}

            <View style={peopleStyles.nameLabel}>
                <Text style={peopleStyles.nameText} numberOfLines={1}>
                    {person?.name || 'Unknown'}
                </Text>
            </View>

            {!person?.micOn && (
                <View style={peopleStyles.muted}>
                    <MicOff color="#fff" size={RFValue(10)} />
                </View>
            )}

            <View style={peopleStyles.ellipsis}>
                <EllipsisVertical color="#fff" size={RFValue(14)} />
            </View>

            {showOthersCount && (
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
    );
};

const People = ({ people, containerDimensions }) => {
    const maxVisibleUsers = 8;
    const visiblePeoples = people?.slice(0, maxVisibleUsers) || [];
    const othersCount = people?.length > maxVisibleUsers ? people.length - maxVisibleUsers : 0;

    const gridStyle = containerDimensions ?
        getGridStyle(
            visiblePeoples.length,
            containerDimensions.width,
            containerDimensions.height
        ) : null;

    console.log('====================================');
    console.log("Visible:", visiblePeoples.length);
    console.log("Container dimensions:", containerDimensions);
    visiblePeoples.forEach((person, idx) => {
        console.log(`Participant ${idx}:`, {
            userId: person?.userId,
            name: person?.name,
            hasPhoto: !!person?.photo,
            photoValid: person?.photo ,
            hasStreamURL: !!person?.streamURL,
            streamURLType: person?.streamURL,
            videoOn: person?.videoOn,
            micOn: person?.micOn,
        });
    });
    console.log('====================================');

    if (!containerDimensions) {
        console.log("No container dimensions yet");
        return null;
    }

    if (visiblePeoples.length === 0) {
        console.log("No visible people");
        return null;
    }

    return (
        <View style={peopleStyles.container}>
            {visiblePeoples.map((person, index) => (
                <ParticipantCard
                    key={person?.userId || index}
                    person={person}
                    gridStyle={gridStyle}
                    index={index}
                    showOthersCount={othersCount > 0 && index === visiblePeoples.length - 1}
                    othersCount={othersCount}
                />
            ))}
        </View>
    );
};

export default People;

const peopleStyles = StyleSheet.create({
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
        backgroundColor: '#000',
    },
    noVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: RFValue(50),
        height: RFValue(50),
        borderRadius: RFValue(25),
    },
    initial: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    nameLabel: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        right: 40,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    nameText: {
        color: '#fff',
        fontSize: RFValue(10),
        fontWeight: '500',
    },
    muted: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(255,0,0,0.8)',
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
        top: 6,
        left: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    othersText: {
        color: '#fff',
        fontSize: RFValue(10),
        fontWeight: 'bold',
    },
});