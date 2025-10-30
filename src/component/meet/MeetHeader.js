import { View, Text, StyleSheet, TouchableOpacity, NativeModules, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { meetStore } from '../../services/meetStorage.services';
import LinearGradient from 'react-native-linear-gradient';
import { Repeat, Volume2, Headphones, Ear } from 'lucide-react-native';
import { addHypen } from '../../utlities/Helpers';
import { Colors } from '../../utlities/Constant';

const { AudioManager } = NativeModules;

const MeetHeader = ({ switchCamera }) => {
    const { sessionId } = meetStore();
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    console.log('====================================');
    console.log("Session Id In Meet Header:", sessionId);
    console.log('====================================');

    useEffect(() => {
        console.log("Setting up audio routing (Native Modules)");

        // Set speaker on by default
        setSpeakerMode(true);
    }, []);

    const setSpeakerMode = (enabled) => {
        try {
            if (Platform.OS === 'android') {
                if (AudioManager && AudioManager.setSpeakerphoneOn) {
                    AudioManager.setSpeakerphoneOn(enabled);
                    console.log("Android speaker via AudioManager:", enabled);
                }
            } else if (Platform.OS === 'ios') {

                console.log("iOS speaker mode:", enabled);
            }
        } catch (error) {
            console.error("Error setting speaker mode:", error);
        }
    };

    const toggleSpeaker = () => {
        const newState = !isSpeakerOn;
        console.log("Toggling speaker to:", newState ? "ON" : "OFF");

        setSpeakerMode(newState);
        setIsSpeakerOn(newState);
    };

    return (
        <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.meetCode}>{addHypen(sessionId)}</Text>

                <View style={styles.icons}>
                    {/* Switch Camera Button */}
                    <TouchableOpacity onPress={switchCamera} style={styles.iconButton}>
                        <Repeat color="white" size={24} />
                    </TouchableOpacity>

                    {/* Speaker/Earphone Toggle Button */}
                    <TouchableOpacity onPress={toggleSpeaker} style={styles.iconButton}>
                        {isSpeakerOn ? (
                            <Volume2 color="white" size={24} />
                        ) : (
                            <Ear color="white" size={24} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    meetCode: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        zIndex: 2
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});

export default MeetHeader;