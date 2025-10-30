import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    MediaStream,
} from 'react-native-webrtc';

import { useEffect, useRef, useCallback } from 'react';
import { useWS } from '../services/api/WSProvider';
import { useUserStore } from '../services/useStorage.services';
import { meetStore } from '../services/meetStorage.services';
import { peerConstraints } from '../utlities/Helpers';
import { useStreamStore } from '../services/useStream.store';
import { BackHandler, ToastAndroid } from 'react-native';
import { replace, resetAndNavigate } from '../utlities/NavigationUtilities';

const shouldInitiateOffer = (localUserId, remoteUserId) => {
    return localUserId < remoteUserId;
};

const useWebRTC = () => {
    const {
        sessionId,
        participants,
        micOn,
        videoOn,
        addParticipant,
        removeParticipant,
        updateParticipant,
        setStreamURL,
        toggle,
        clear,
    } = meetStore();

    console.log(' Session ID:', sessionId);
    console.log('Participants count:', participants?.length);

    const { user } = useUserStore();
    const { emit, on, off, isConnected } = useWS();
    const peerConnections = useRef(new Map());
    const pendingCandidates = useRef(new Map());
    const stream = useStreamStore((s) => s.stream);
    const clearStream = useStreamStore((s) => s.clearStream);
    const backPressCount = useRef(0);

    useEffect(() => {
        console.log(' Local stream status:', {
            hasStream: !!stream,
            streamId: stream?.id,
            audioTracks: stream?.getAudioTracks()?.length || 0,
            videoTracks: stream?.getVideoTracks()?.length || 0,
        });
    }, [stream]);

    const establishPeerConnections = useCallback(async () => {
        console.log(" [establishPeerConnections] Starting...");
        console.log(" [establishPeerConnections] Participants:", participants);

        if (!participants || participants.length === 0) {
            console.log(" [establishPeerConnections] No participants to connect");
            return;
        }

        if (!stream) {
            console.log(" [establishPeerConnections] No stream available");
            return;
        }

        for (const streamUser of participants) {
            console.log(` [establishPeerConnections] Processing: ${streamUser.userId}`);

            if (streamUser?.userId === user?.id) {
                console.log("[establishPeerConnections] Skipping self");
                continue;
            }

            const shouldOffer = shouldInitiateOffer(user?.id, streamUser?.userId);
            console.log(` [establishPeerConnections] Should initiate offer: ${shouldOffer}`);

            if (!shouldOffer) {
                console.log(` [establishPeerConnections] Not initiating offer to ${streamUser.userId}`);
                continue;
            }

            if (peerConnections.current.has(streamUser?.userId)) {
                console.log(`[establishPeerConnections] Peer connection exists for: ${streamUser.userId}`);
                continue;
            }

            console.log(` [establishPeerConnections] Creating new peer connection for: ${streamUser?.userId}`);
            const peerConnection = new RTCPeerConnection(peerConstraints);
            peerConnections.current.set(streamUser?.userId, peerConnection);

            // Add local media tracks
            const tracks = stream.getTracks();
            console.log(` [establishPeerConnections] Adding ${tracks.length} tracks to peer connection`);
            tracks.forEach((track) => {
                console.log(`  Adding ${track.kind} track (enabled: ${track.enabled})`);
                peerConnection.addTrack(track, stream);
            });

            // ICE candidate handler
            peerConnection.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    console.log(` [ICE] Sending candidate to: ${streamUser.userId}`);
                    emit('send-ice-candidate', {
                        sessionId,
                        sender: user?.id,
                        receiver: streamUser?.userId,
                        candidate,
                    });
                }
            };

            // Remote track handler
            peerConnection.ontrack = (event) => {
                console.log(` [ONTRACK] ========== Received track from: ${streamUser.userId} ==========`);
                console.log(` [ONTRACK] Track kind: ${event.track.kind}`);
                console.log(` [ONTRACK] Track enabled: ${event.track.enabled}`);

                if (event.streams && event.streams[0]) {
                    const remoteStream = event.streams[0];
                    console.log(`[ONTRACK] Remote stream ID: ${remoteStream.id}`);
                    console.log(`[ONTRACK] Remote stream tracks: ${remoteStream.getTracks().length}`);
                    console.log(`[ONTRACK] Audio tracks: ${remoteStream.getAudioTracks().length}`);
                    console.log(` [ONTRACK] Video tracks: ${remoteStream.getVideoTracks().length}`);

                    remoteStream.getTracks().forEach(track => {
                        console.log(`  Track: ${track.kind}, enabled: ${track.enabled}, state: ${track.readyState}`);
                    });

                    const streamURL = remoteStream.toURL();
                    console.log(` [ONTRACK] Stream URL: ${streamURL}`);
                    console.log(` [ONTRACK] Calling setStreamURL for: ${streamUser?.userId}`);

                    setStreamURL(streamUser?.userId, remoteStream);

                    console.log(` [ONTRACK] ========== End ONTRACK ==========\n`);
                } else {
                    console.error(` [ONTRACK] No stream in event!`);
                }
            };

            // Connection state handler
            peerConnection.onconnectionstatechange = () => {
                console.log(` [Connection] ${streamUser.userId}: ${peerConnection.connectionState}`);
                if (peerConnection.connectionState === 'connected') {
                    console.log(` [Connection] Successfully connected to: ${streamUser.userId}`);
                }
                if (peerConnection.connectionState === 'failed') {
                    console.log(` [Connection] Failed for: ${streamUser.userId}`);
                    peerConnection.close();
                    peerConnections.current.delete(streamUser.userId);
                }
            };

            // ICE connection state
            peerConnection.oniceconnectionstatechange = () => {
                console.log(`[ICE Connection] ${streamUser.userId}: ${peerConnection.iceConnectionState}`);
            };

            try {
                if (peerConnection.signalingState !== 'stable') {
                    console.warn(` [establishPeerConnections] Connection not stable: ${peerConnection.signalingState}`);
                    continue;
                }

                console.log(`📤 [establishPeerConnections] Creating offer for: ${streamUser.userId}`);
                const offerDescription = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offerDescription);
                console.log(` [establishPeerConnections] Local description set`);

                console.log(`[establishPeerConnections] Sending offer to: ${streamUser.userId}`);
                emit('send-offer', {
                    sessionId,
                    sender: user?.id,
                    receiver: streamUser?.userId,
                    offer: offerDescription,
                });
            } catch (error) {
                console.error(`[establishPeerConnections] Error:`, error);
                peerConnection.close();
                peerConnections.current.delete(streamUser.userId);
            }
        }
    }, [participants, stream, sessionId, user?.id, emit, setStreamURL]);

    const handleNewParticipant = useCallback((data) => {
        console.log(" [handleNewParticipant] New participant:", data?.participant);
        if (data?.participant?.userId === user?.id) {
            console.log(" [handleNewParticipant] Ignoring self");
            return;
        }
        addParticipant(data?.participant);
    }, [user?.id, addParticipant]);

    const handleReceiveOffer = useCallback(async ({ sender, receiver, offer }) => {
        console.log(` [handleReceiveOffer] ========== Offer from: ${sender} ==========`);
        console.log(` [handleReceiveOffer] Receiver: ${receiver}, Our ID: ${user?.id}`);

        if (receiver !== user?.id) {
            console.log(" [handleReceiveOffer] Offer not for us");
            return;
        }

        try {
            let peerConnection = peerConnections.current.get(sender);

            if (peerConnection) {
                const signalingState = peerConnection.signalingState;
                console.log(` [handleReceiveOffer] Existing connection state: ${signalingState}`);

                if (signalingState === 'have-local-offer') {
                    const shouldWin = shouldInitiateOffer(user?.id, sender);
                    console.log(` [handleReceiveOffer] Glare detected! We ${shouldWin ? 'win' : 'lose'}`);

                    if (shouldWin) {
                        console.log(" [handleReceiveOffer] We win, ignoring offer");
                        return;
                    } else {
                        console.log("[handleReceiveOffer] Rolling back our offer");
                        await peerConnection.setLocalDescription({ type: 'rollback' });
                    }
                } else if (signalingState !== 'stable') {
                    console.warn(` [handleReceiveOffer] Connection busy: ${signalingState}`);
                    return;
                }
            }

            if (!peerConnection) {
                console.log(` [handleReceiveOffer] Creating new peer connection`);
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(sender, peerConnection);

                // Remote track handler
                peerConnection.ontrack = event => {
                    console.log(` [ONTRACK-ANSWER] ========== Track from: ${sender} ==========`);
                    console.log(` [ONTRACK-ANSWER] Track kind: ${event.track.kind}`);

                    if (event.streams && event.streams[0]) {
                        const remoteStream = event.streams[0];
                        console.log(`[ONTRACK-ANSWER] Remote stream ID: ${remoteStream.id}`);
                        console.log(` [ONTRACK-ANSWER] Remote stream tracks: ${remoteStream.getTracks().length}`);

                        const streamURL = remoteStream.toURL();
                        console.log(` [ONTRACK-ANSWER] Stream URL: ${streamURL}`);
                        console.log(` [ONTRACK-ANSWER] Calling setStreamURL for: ${sender}`);

                        setStreamURL(sender, remoteStream);
                        console.log(` [ONTRACK-ANSWER] ========== End ONTRACK-ANSWER ==========\n`);
                    }
                };

                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        console.log(`[ICE-ANSWER] Sending candidate to: ${sender}`);
                        emit('send-ice-candidate', {
                            sessionId,
                            sender: receiver,
                            receiver: sender,
                            candidate,
                        });
                    }
                };

                peerConnection.onconnectionstatechange = () => {
                    console.log(`[Connection-ANSWER] ${sender}: ${peerConnection.connectionState}`);
                    if (peerConnection.connectionState === 'failed') {
                        peerConnection.close();
                        peerConnections.current.delete(sender);
                    }
                };

                // Add local tracks
                if (stream) {
                    const tracks = stream.getTracks();
                    console.log(` [handleReceiveOffer] Adding ${tracks.length} local tracks`);
                    tracks.forEach(track => {
                        console.log(`  Adding ${track.kind} track (enabled: ${track.enabled})`);
                        peerConnection.addTrack(track, stream);
                    });
                }
            }

            console.log(` [handleReceiveOffer] Setting remote description`);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            console.log(` [handleReceiveOffer] Remote description set`);

            // Apply pending ICE candidates
            if (pendingCandidates.current.has(sender)) {
                const candidates = pendingCandidates.current.get(sender);
                console.log(`[handleReceiveOffer] Applying ${candidates.length} pending ICE candidates`);
                for (const candidate of candidates) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidates.current.delete(sender);
            }

            console.log(` [handleReceiveOffer] Creating answer`);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log(` [handleReceiveOffer] Local description (answer) set`);

            console.log(` [handleReceiveOffer] Sending answer to: ${sender}`);
            emit('send-answer', {
                sessionId,
                sender: receiver,
                receiver: sender,
                answer,
            });

        } catch (error) {
            console.error(`[handleReceiveOffer] Error:`, error);
        }
    }, [user?.id, stream, sessionId, emit, setStreamURL]);

    const handleReceiveAnswer = useCallback(async ({ sender, receiver, answer }) => {
        console.log(` [handleReceiveAnswer] Answer from: ${sender}`);
        if (receiver !== user?.id) {
            console.log(" [handleReceiveAnswer] Answer not for us");
            return;
        }

        const peerConnection = peerConnections.current.get(sender);
        if (peerConnection) {
            try {
                console.log(` [handleReceiveAnswer] Signaling state: ${peerConnection.signalingState}`);

                if (peerConnection.signalingState === "have-local-offer") {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log(` [handleReceiveAnswer] Remote description (answer) set`);
                } else if (peerConnection.signalingState === "stable") {
                    console.warn(" [handleReceiveAnswer] Already stable, ignoring answer");
                } else {
                    console.warn(` [handleReceiveAnswer] Unexpected state: ${peerConnection.signalingState}`);
                }
            } catch (error) {
                console.error(` [handleReceiveAnswer] Error:`, error);
            }
        } else {
            console.warn(`[handleReceiveAnswer] No peer connection for: ${sender}`);
        }
    }, [user?.id]);

    const handleReceiveIceCandidate = useCallback(async ({ sender, receiver, candidate }) => {
        console.log(` [handleReceiveIceCandidate] ICE from: ${sender}`);
        if (receiver !== user?.id) {
            console.log("[handleReceiveIceCandidate] Not for us");
            return;
        }

        const peerConnection = peerConnections.current.get(sender);

        if (peerConnection && peerConnection.remoteDescription) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                console.log(` [handleReceiveIceCandidate] ICE candidate added`);
            } catch (error) {
                console.error(` [handleReceiveIceCandidate] Error:`, error);
            }
        } else {
            console.log(` [handleReceiveIceCandidate] Queuing ICE candidate (no remote description yet)`);
            if (!pendingCandidates.current.has(sender)) {
                pendingCandidates.current.set(sender, []);
            }
            pendingCandidates.current.get(sender).push(candidate);
        }
    }, [user?.id]);

    const handleParticipantLeft = useCallback((userId) => {
        console.log(`[handleParticipantLeft] Participant left: ${userId}`);
        removeParticipant(userId);
        const pc = peerConnections.current.get(userId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(userId);
        }
        pendingCandidates.current.delete(userId);
    }, [removeParticipant]);

    const handleParticipantUpdate = useCallback((updatedParticipant) => {
        console.log(` [handleParticipantUpdate] Update:`, updatedParticipant);
        updateParticipant(updatedParticipant);
    }, [updateParticipant]);

    useEffect(() => {
        console.log(" [useEffect] Checking if should establish connections...");
        console.log("  Stream:", !!stream);
        console.log("  Participants:", participants.length);

        if (stream && participants.length > 0) {
            console.log(" [useEffect] Establishing peer connections");
            establishPeerConnections();
        }
    }, [stream, participants.length, establishPeerConnections]);

    useEffect(() => {
        console.log(" [useEffect] Setting up WebRTC socket listeners");

        on('receive-ice-candidate', handleReceiveIceCandidate);
        on('receive-offer', handleReceiveOffer);
        on('receive-answer', handleReceiveAnswer);
        on('new-participant', handleNewParticipant);
        on('participant-left', handleParticipantLeft);
        on('participant-update', handleParticipantUpdate);

        return () => {
            console.log(" [useEffect] Cleaning up WebRTC");

            peerConnections.current.forEach((pc, userId) => {
                console.log(`   Closing connection for: ${userId}`);
                pc.close();
            });
            peerConnections.current.clear();
            pendingCandidates.current.clear();

            off('receive-ice-candidate');
            off('receive-offer');
            off('receive-answer');
            off('new-participant');
            off('participant-left');
            off('participant-update');

            if (isConnected) {
                emit("hang-up");
            }
        };
    }, [on, off, handleReceiveIceCandidate, handleReceiveOffer, handleReceiveAnswer,
        handleNewParticipant, handleParticipantLeft, handleParticipantUpdate, isConnected, emit]);

    const toggleMic = useCallback(() => {
        console.log(` [toggleMic] Current state: ${micOn}`);
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !micOn;
                console.log(`  Audio track enabled: ${track.enabled}`);
            });
        }
        toggle('mic');
        emit('toggle-mute', { sessionId, userId: user?.id });
    }, [stream, micOn, toggle, emit, sessionId, user?.id]);

    const toggleVideo = useCallback(() => {
        console.log(` [toggleVideo] Current state: ${videoOn}`);
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !videoOn;
                console.log(`  Video track enabled: ${track.enabled}`);
            });
        }
        toggle('video');
        emit('toggle-video', { sessionId, userId: user?.id });
    }, [stream, videoOn, toggle, emit, sessionId, user?.id]);

    const switchCamera = useCallback(() => {
        console.log(" [switchCamera] Switching camera");
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                if (typeof track._switchCamera === 'function') {
                    track._switchCamera();
                }
            });
        }
    }, [stream]);

    const hangup = useCallback(() => {
        console.log(" Hanging up call");
        emit("hang-up");
        clear();
        clearStream();
        resetAndNavigate("HomeScreen");
    }, [emit, clear, clearStream]);

    useEffect(() => {
        const backAction = () => {
            if (backPressCount.current === 0) {
                console.log(" Back First press");
                backPressCount.current += 1;
                ToastAndroid.show("Press back again to leave", ToastAndroid.SHORT);

                setTimeout(() => {
                    backPressCount.current = 0;
                }, 2000);

                return true;
            } else {
                console.log(" Back Second press - hanging up");
                hangup();
                replace("HomeScreen");
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [hangup]);

    return {
        participants,
        toggleMic,
        toggleVideo,
        switchCamera,
        hangup
    };
};

export default useWebRTC;