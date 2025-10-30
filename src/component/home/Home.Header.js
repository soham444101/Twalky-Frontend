import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../services/useStorage.services';
import InquireModel from './InquireModel.js';
import { CircleUser, Menu } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from '../../utlities/Constant.js';
import { SafeAreaView } from 'react-native-safe-area-context';

const Homeheader = () => {
    const [visible, setVisible] = useState(false);
    const [searchSession, searchSessionSet] = useState("");
    const { user } = useUserStore();

    useEffect(() => {
        if (!user?.name) setVisible(true);
    }, [user?.name]);



    return <View style={styles.topview}>
        <SafeAreaView />
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => console.log("Menu pressed")}>
                <Menu size={RFValue(22)} color={Colors.text} />
            </TouchableOpacity>

            <TextInput style={styles.inputone} placeholder=' Meet code ' value={searchSession} onChangeText={searchSessionSet} placeholderTextColor={Colors.secondary} />
            {/* <TouchableOpacity style={styles.joinButton} onPress={handleNavigation}>
                    <Text style={styles.joinText}>Code</Text>
                </TouchableOpacity> */}

            <TouchableOpacity onPress={() => setVisible(true)}>
                <CircleUser size={RFValue(25)} color={Colors.text} />
            </TouchableOpacity>
        </View>


        <InquireModel onClose={() => setVisible(false)} visible={visible} />
    </View>
        ;
};

const styles = StyleSheet.create({

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: RFValue(16),
        color: Colors.text,
        fontWeight: 'bold',
    },

    inputone: {

        width: RFValue(220),
        height: RFValue(40),
        borderRadius: RFValue(25),
        alignSelf: "center",
        borderColor: Colors.border,
        borderWidth: RFValue(1)

    },
    topview: {
        height: RFValue(50),
        width: "90%",
        justifyContent: "center",
        paddingHorizontal: RFValue(10),
        backgroundColor: Colors.shadow,
        borderRadius: RFValue(25),
        alignSelf: "center"
    }
});

export default Homeheader;
