import { io } from "socket.io-client";
import { SOCKET_URL } from "../config.services";
import { createContext, useContext, useEffect, useRef } from "react";
import { useStreamStore } from "../useStream.store";


const WSContext = createContext();

export const WSProvider = ({ children }) => {
    const socket = useRef(undefined);
    const clearStream = useStreamStore((s) => s.clearStream);

    useEffect(
        () => {
            socket.current = io(SOCKET_URL,
                {
                    transports: ['websocket']
                }
            );

            return () => {
                socket.current?.disconnect();
            }
        }, [])

    const emit = (event, data) => {
        socket.current?.emit(event, data);
    }

    const on = (event, cb) => {
        socket.current?.on(event, cb);
    }
    const off = (event) => {
        socket.current?.off(event);

    }

    const removeListener = (listenerName) => {
        socket.current?.removeListener(listenerName);
    }

    const disconnect = () => {

        if (socket.current) {
            socket.current?.disconnect();
            socket.current = undefined;
        }

        clearStream();
        console.log('====================================');
        console.log("disconnect Call");
        console.log('====================================');

    };

    const socketServies = {
        inilizeSocket: () => { },
        emit,
        on,
        off,
        removeListener,
        disconnect
    }

    return <>
        <WSContext.Provider value={socketServies}>{children}</WSContext.Provider>
    </>
}

export const useWS = () => {
    const socketContext = useContext(WSContext);
    if (!socketContext) {
        throw new Error("useWS used within the WebProvider")
    }
    return socketContext;
}