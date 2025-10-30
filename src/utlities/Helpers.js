import { Platform } from "react-native";
import { PERMISSIONS, requestMultiple, RESULTS, request } from "react-native-permissions";
import { useUserStore } from "../services/useStorage.services.js";


export const requestAudio = async () => {
    console.log('====================================');
    console.log("request is calling audio");
    console.log('====================================');
    const permission = Platform.OS === "android" ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE;
    const result = await request(permission);
    useUserStore.getState().setAudioPermission(result === "granted");

    return (result === "granted");
}
export const requestVideo = async () => {
    console.log('====================================');
    console.log("request is calling video");

    const permission = Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const result = await request(permission);
    useUserStore.getState().setVideoPermission(result === "granted");

    return (result === "granted");
}

export const addHypen = link => {
    return link?.replace(/(.{3})(?=.)/g, '$1-');
    // return true
};

export const removeHypen = link => {
    return link?.replace(/-/g, '');
};

export const peerConstraints = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
    ]
}

export const sessionConstraint = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true
    }
};

export const getStreamURL = (stream) => {

    try {
        // If it's already a string URL, return it
        if (typeof stream === 'string') {
            console.log('Stream URL is string:', stream);
            return stream;
        }

        // If it has toURL method, call it
        if (typeof stream.toURL === 'function') {
            const url = stream.toURL();
            console.log('Stream URL from toURL():', url);
            return url;
        }

        // If it has _URL property
        if (stream._URL) {
            console.log('Stream URL from _URL:', stream._URL);
            return stream._URL;
        }

        console.warn('Could not extract stream URL from:', stream);
        return null;
    } catch (error) {
        console.error('Error extracting stream URL:', error);
        return null;
    }
};