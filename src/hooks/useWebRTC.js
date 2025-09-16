import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
    MediaStream,
} from 'react-native-webrtc';

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useWS } from '../services/api/WSProvider';
import { useUserStore } from '../services/useStorage.services';
import { meetStore } from '../services/meetStorage.services';
import { peerConstraints } from '../utlities/Helpers';
import { getStream, setStream, useStreamStore } from '../services/useStream.store';
import { BackHandler, ToastAndroid } from 'react-native';
import { replace, resetAndNavigate } from '../utlities/NavigationUtilities';

const useWebRTC = () => {
    const {
        sessionId,
        participants,
        chatMessages,
        micOn,
        videoOn,
        addSessionId,
        removeSessionId,
        addParticipant,
        removeParticipant,
        updateParticipant,
        setStreamURL,
        toggle,
        clear,

    } = meetStore();

    console.log('====================================');
    console.log("session ID Call from UseWebRtc,js ", sessionId);
    console.log('====================================');
    const { user } = useUserStore();
    const { emit, on, off } = useWS();
    const peerConnections = useRef(new Map());
    const pendingConnection = useRef(new Map());
    const stream = useStreamStore((s) => s.stream);
    const clearStream = useStreamStore((s) => s.clearStream);



    const establishPeerConnections = async () => {
        participants?.forEach(async (streamUser) => {
            if (!peerConnections.current.has(streamUser?.userId)) {
                const peerConnection = new RTCPeerConnection(peerConstraints);

                peerConnections.current.set(streamUser?.userId, peerConnection);


                // Add local media tracks to the peer connection
                stream?.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, stream);
                });

                try {
                    const offerDescription = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offerDescription);

                    emit('send-offer', {
                        sessionId,
                        sender: user?.id,
                        receiver: streamUser?.userId,
                        offer: offerDescription,
                    });
                } catch (error) {
                    console.error('Error creating or sending offer:', error);
                }

                // Handle incoming tracks
                // Set up ICE candidate event listener
                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        emit('send-ice-candidate', {
                            sessionId,
                            sender: user?.id,
                            receiver: streamUser?.userId,
                            candidate,
                        });
                    }
                };


                peerConnection.ontrack = (event) => {
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach((track) => {
                        remoteStream.addTrack(track);
                    });

                    console.log('RECEIVING REMOTE STREAM:', remoteStream.toURL());
                    setStreamURL(streamUser?.userId, remoteStream);
                };


            }
        });
    };

    const joiningStream = async () => {
        await establishPeerConnections();
    }



    useEffect(() => {
        if (stream && participants.length > 0) {
            joiningStream();
        }
    }, [stream, participants])


    useEffect(() => {
        on('receive-ice-candidate', handleReceiveIceCandidate);
        on('receive-offer', handleReceiveOffer);
        on('receive-answer', handleReceiveAnswer);
        on('new-participant', handleNewParticipant);
        on('participant-left', handleParticipantLeft);
        on('participant-update', handleParticipantUpdate);

        return () => {
            // Stop all tracks of the local stream

            // Close all peer connections
            peerConnections.current.forEach(pc => pc.close());

            // Clear peer connection map
            peerConnections.current.clear();

            // Reset state and session
            // addSessionId(null);
            // clear();
            // Notify server
            // emit('hang-up');
            console.log('====================================');
            console.log("Clear Call");
            console.log('====================================');
            // Remove listeners
            off('receive-ice-candidate');
            off('receive-offer');
            off('receive-answer');
            off('new-participant');
            off('participant-left');
            off('participant-update');
        };
    }, [stream]);

    const handleNewParticipant = participant => {
        if (participant?.userId === user?.id) return;
        addParticipant(participant);
        establishPeerConnections();
    }
    const handleReceiveOffer = async ({ sender, receiver, offer }) => {
        if (receiver !== user?.id) return;

        try {
            let peerConnection = peerConnections.current.get(sender);
            if (!peerConnection) {
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(sender, peerConnection);

                peerConnection.ontrack = event => {
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                    console.log('RECEIVING REMOTE STREAM', remoteStream.toURL());
                    setStreamURL(sender, remoteStream);
                };

                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        emit('send-ice-candidate', {
                            sessionId,
                            sender: receiver,  // local user
                            receiver: sender,  // remote user
                            candidate,
                        });
                    }
                };

                // Add local tracks to the connection
                if (stream) {
                    stream.getTracks().forEach(track => {
                        peerConnection.addTrack(track, stream);
                    });
                }

                // Apply pending ICE candidates
                if (pendingConnection.current.has(sender)) {
                    pendingConnection.current.get(sender).forEach(candidate => {
                        pendingConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    });
                    pendingConnection.current.delete(sender);
                }
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            emit('send-answer', {
                sessionId,
                sender: receiver,
                receiver: sender,
                answer,
            });

        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };
    const handleReceiveAnswer = async ({ sender, receiver, answer }) => {
        if (receiver !== user?.id) return;

        const peerConnection = peerConnections.current.get(sender);
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
            } catch (error) {
                console.error('Error setting remote description (answer):', error);
            }
        }
    };
    const handleReceiveIceCandidate = async ({ sender, receiver, candidate }) => {
        if (receiver !== user?.id) return;

        const peerConnection = peerConnections.current.get(sender);

        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding received ICE candidate:', error);
            }
        } else {
            if (!pendingConnection.current.has(sender)) {
                pendingConnection.current.set(sender, []);
            }
            pendingConnection.current.get(sender).push(candidate);
        }
    };

    const handleParticipantLeft = (userId) => {
        removeParticipant(userId);
        const pc = peerConnections.current.get(userId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(userId);
        }
    };

    const handleParticipantUpdate = updatedParticipant => {
        updateParticipant(updatedParticipant);
    }
    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !micOn;
            });
        }

        toggle('mic');
        emit('toggle-mute', { sessionId, userId: user?.id });
    };
    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !videoOn;
            });
        }

        toggle('video');
        emit('toggle-video', { sessionId, userId: user?.id });
    };
    const switchCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                if (typeof track._switchCamera === 'function') {
                    track._switchCamera();
                }
            });
        }
    };
    let backPressCount = useRef(0);
    useEffect(() => {
        const backAction = () => {
            if (backPressCount.current === 0) {
                console.log('====================================');
                console.log("Back Action is call");
                console.log('====================================');
                backPressCount.current += 1;
                ToastAndroid.show("Press back again to leave", ToastAndroid.SHORT);

                // Reset counter after 2 seconds
                setTimeout(() => {
                    backPressCount.current = 0;
                }, 2000);

                return true; // prevent default back action
            } else {
                // Second press → Hangup and exit
                replace("HomeScreen");

                hangup();
                return false; // allow default back action (exit screen)
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const hangup = () => {
        console.log("Hanging up call...");
        // 🔹 Disconnect your socket here
        emit("hang-up")
    };









    return useMemo(() => ({
        participants,
        toggleMic,
        toggleVideo,
        switchCamera
    }), [participants, toggleMic, toggleVideo, switchCamera])

}

export default useWebRTC