import 'react-native-get-random-values';

import {
    View, Text, Alert, Modal,
    TouchableWithoutFeedback, Keyboard,
    KeyboardAvoidingView, Platform,
    ScrollView, TextInput, TouchableOpacity, StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../services/useStorage.services';
import { v4 as uuid } from "uuid";
import { Colors } from '../../utlities/Constant';
import Toast from '../../utlities/Toast';



const InquireModel = ({ onClose, visible }) => {
    const { user, setUser } = useUserStore();
    const [nameCurrent, setName] = useState('');
    const [profileurl, setProfileurl] = useState('https://images.pexels.com/photos/23833694/pexels-photo-23833694.jpeg');

    useEffect(() => {
        if (visible && user) {
            const { name, photo } = user;
            setName(name || '');
            setProfileurl(photo ||'https://images.pexels.com/photos/23833694/pexels-photo-23833694.jpeg');
        }
    }, [visible, user]);

    const handleSave = () => {
        if (nameCurrent && profileurl) {
            console.log("Inside The Handle Save");

            setUser({
                id: uuid(),
                name: nameCurrent,
                photo: profileurl
            });
            console.log("Inside The Handle Save");
            console.log("User ", user);

            onClose();
        } else {
            Toast.warning("Please fill your details first");
        }
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            <View style={styles.card}>
                                <Text style={styles.title}>Enter Your Details</Text>

                                <TextInput
                                    placeholder='Enter your name'
                                    value={nameCurrent}
                                    onChangeText={setName}
                                    placeholderTextColor={Colors.subtext}
                                    style={styles.input}
                                />
                                <TextInput
                                    placeholder='Enter your profile URL'
                                    value={profileurl}
                                    onChangeText={setProfileurl}
                                    placeholderTextColor={Colors.subtext}
                                    style={styles.input}
                                />

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                                        <Text style={styles.buttonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 16,
        elevation: 5,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.inputBg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        color: Colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: Colors.danger,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default InquireModel;
