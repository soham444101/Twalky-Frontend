import { Platform } from "react-native";


export const BASE_URL = Platform.OS == "android"? 'http://10.215.218.149:5000' :'http://localhost:3000'
export const SOCKET_URL = Platform.OS == "android"? 'ws://10.0.2.2:5000' :'ws://localhost:3000'


// When we need to Deploy llink then 
// export const BASE_URL = "https://render-url";
// export const SOCKET_URL = "wss://render-url";

// Use local ip address 
// export const BASE_URL="http://10.37.79.149:5000";
// export const SOCKET_URL="ws://10.37.79.149:5000";