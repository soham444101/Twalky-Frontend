import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import { meetStore } from '../../services/meetStorage.services'
import LinearGradient from 'react-native-linear-gradient'
import { Repeat, Volume2 } from 'lucide-react-native'
import { addHypen } from '../../utlities/Helpers'
import { Colors } from '../../utlities/Constant'

const MeetHeader = ({ switchCamera }) => {
    const { sessionId } = meetStore()
    console.log('====================================');
    console.log("Seesion Id In Meet Header ",sessionId);
    console.log('====================================');
    return (
        <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.meetCode}>{addHypen(sessionId)}</Text>
                
                <View style={styles.icons}>
                    <Repeat  onPress={switchCamera} color="white" size={24} />
                    <Volume2 color="white" size={24} style={styles.iconSpacing} />
                </View>
            </View>
        </LinearGradient>
    )
}

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
        zIndex:2
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginLeft: 12,
    },
});

export default MeetHeader