import { Alert } from "react-native";
import axios from "axios"
import { BASE_URL } from "../config.services";



export const createSession = async () => {
    try {

        console.log("Crete Session Is Call from Frontend")
        const apicall = await axios.get(`${BASE_URL}/create-session`);
        console.log('====================================');
        console.log("Create Session Output in api/session.js", apicall);
        console.log('====================================');
        return apicall?.data?.sessionId;

    } catch (error) {
        console.log('====================================');
        console.log("Session Errror Occure Here", error);
        console.log('====================================');
        Alert.alert("createSession Error in api/session.js")
        return null;
    }
}
export const checkSession = async (id) => {
    try {

        console.log("CheckSession Api Call here")
        const apicall = await axios.get(`${BASE_URL}/is-alive?sessionId=${id}`);
        console.log('====================================');
        console.log("Create Session Output in api/session.js", apicall);
        console.log('====================================');
        return apicall?.data?.isAlive;

    } catch (error) {
        console.log('====================================');
        console.log("Session In Is LIve Here", error);
        console.log('====================================');
        Alert.alert("check Session Error in api/session.js")
        return false;
    }
}

