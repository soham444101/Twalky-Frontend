import { io } from "socket.io-client";
import { SOCKET_URL } from "../config.services";
import { createContext, useContext, useEffect, useRef } from "react";
import { useStreamStore } from "../useStream.store";

const WSContext = createContext();

export const WSProvider = ({ children }) => {
    const socket = useRef(undefined);

    useEffect(() => {
        console.log("Initializing WebSocket connection to:", SOCKET_URL);

        socket.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], 
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.current.on('connect', () => {
            console.log('WebSocket connected:', socket.current.id);
        });

        socket.current.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.current.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });

        return () => {
            console.log("Cleaning up WebSocket connection");
            if (socket.current) {
                socket.current.disconnect();
                socket.current = undefined;
            }
        };
    }, []);

    const emit = (event, data) => {
        console.log("soccket.current",socket.current);
        console.log("soccket.current.connted",socket.current.connected);
        if (socket.current && socket.current.connected) {
            console.log(`Emitting event: ${event}`, data);
            socket.current.emit(event, data);
        } else {
            console.warn(`Cannot emit ${event}: socket not connected`);
        }
    };

    const on = (event, cb) => {
        if (socket.current) {
            console.log(`Registering listener for: ${event}`);
            socket.current.on(event, cb);
        } else {
            console.warn(`Cannot register listener for ${event}: socket not initialized`);
        }
    };

    const off = (event) => {
        if (socket.current) {
            console.log(`Removing listener for: ${event}`);
            socket.current.off(event);
        }
    };

    const removeListener = (listenerName) => {
        if (socket.current) {
            console.log(`Removing all listeners for: ${listenerName}`);
            socket.current.removeListener(listenerName);
        }
    };

    const disconnect = () => {
        console.log("Manual disconnect called");

        if (socket.current) {
            socket.current.disconnect();
            socket.current = undefined;
        }

        console.log('Disconnect complete');
    };

    const isConnected = () => {
        return socket.current && socket.current.connected;
    };

    const socketServices = {
        emit,
        on,
        off,
        removeListener,
        disconnect,
        isConnected,
    };

    return (
        <WSContext.Provider value={socketServices}>
            {children}
        </WSContext.Provider>
    );
};

export const useWS = () => {
    const socketContext = useContext(WSContext);
    if (!socketContext) {
        throw new Error("useWS must be used within WSProvider");
    }
    return socketContext;
};