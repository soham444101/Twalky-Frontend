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

const shouldInitiateOffer = (localUserId, remoteUserId) => localUserId < remoteUserId;

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

    const { user } = useUserStore();
    const { emit, on, off, isConnected } = useWS();
    const stream = useStreamStore((s) => s.stream);
    const clearStream = useStreamStore((s) => s.clearStream);

    const peerConnections = useRef(new Map());
    const pendingCandidates = useRef(new Map());
    const backPressCount = useRef(0);

    // ---- Create connections for all peers ----
    const establishPeerConnections = useCallback(async () => {
        if (!stream || !participants?.length) return;

        for (const remoteUser of participants) {
            if (remoteUser.userId === user?.id) continue;

            const shouldOffer = shouldInitiateOffer(user?.id, remoteUser.userId);
            if (!shouldOffer) continue;

            if (peerConnections.current.has(remoteUser.userId)) continue;

            const pc = new RTCPeerConnection(peerConstraints);
            peerConnections.current.set(remoteUser.userId, pc);

            // add local tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    emit('send-ice-candidate', {
                        sessionId,
                        sender: user?.id,
                        receiver: remoteUser.userId,
                        candidate,
                    });
                }
            };

            pc.ontrack = (e) => {
                const remoteStream = e.streams[0];
                if (remoteStream) setStreamURL(remoteUser.userId, remoteStream);
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'failed') {
                    pc.close();
                    peerConnections.current.delete(remoteUser.userId);
                }
            };

            try {
                if (pc.signalingState !== 'stable') return;
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('send-offer', {
                    sessionId,
                    sender: user?.id,
                    receiver: remoteUser.userId,
                    offer,
                });
            } catch (err) {
                console.log('Offer create/send failed:', err);
                pc.close();
                peerConnections.current.delete(remoteUser.userId);
            }
        }
    }, [participants, stream, sessionId, user?.id, emit, setStreamURL]);

    // ---- Incoming offer ----
    const handleReceiveOffer = useCallback(async ({ sender, receiver, offer }) => {
        if (receiver !== user?.id) return;

        let pc = peerConnections.current.get(sender);
        if (pc && pc.signalingState === 'have-local-offer') {
            const shouldWin = shouldInitiateOffer(user?.id, sender);
            if (shouldWin) return;
            await pc.setLocalDescription({ type: 'rollback' });
        }

        if (!pc) {
            pc = new RTCPeerConnection(peerConstraints);
            peerConnections.current.set(sender, pc);

            pc.ontrack = e => {
                const remoteStream = e.streams[0];
                if (remoteStream) setStreamURL(sender, remoteStream);
            };

            pc.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    emit('send-ice-candidate', {
                        sessionId,
                        sender: receiver,
                        receiver: sender,
                        candidate,
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'failed') {
                    pc.close();
                    peerConnections.current.delete(sender);
                }
            };

            if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (pendingCandidates.current.has(sender)) {
            const candidates = pendingCandidates.current.get(sender);
            for (const c of candidates) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingCandidates.current.delete(sender);
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        emit('send-answer', {
            sessionId,
            sender: receiver,
            receiver: sender,
            answer,
        });
    }, [user?.id, stream, sessionId, emit, setStreamURL]);

    // ---- Incoming answer ----
    const handleReceiveAnswer = useCallback(async ({ sender, receiver, answer }) => {
        if (receiver !== user?.id) return;
        const pc = peerConnections.current.get(sender);
        if (!pc) return;

        if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }, [user?.id]);

    // ---- ICE candidate ----
    const handleReceiveIceCandidate = useCallback(async ({ sender, receiver, candidate }) => {
        if (receiver !== user?.id) return;
        const pc = peerConnections.current.get(sender);
        if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            if (!pendingCandidates.current.has(sender))
                pendingCandidates.current.set(sender, []);
            pendingCandidates.current.get(sender).push(candidate);
        }
    }, [user?.id]);

    // ---- Participants ----
    const handleNewParticipant = useCallback((data) => {
        if (data?.participant?.userId !== user?.id)
            addParticipant(data?.participant);
    }, [user?.id, addParticipant]);

    const handleParticipantLeft = useCallback((userId) => {
        removeParticipant(userId);
        const pc = peerConnections.current.get(userId);
        if (pc) pc.close();
        peerConnections.current.delete(userId);
        pendingCandidates.current.delete(userId);
    }, [removeParticipant]);

    const handleParticipantUpdate = useCallback((data) => {
        updateParticipant(data);
    }, [updateParticipant]);

    // ---- Auto connection setup ----
    useEffect(() => {
        if (stream && participants.length > 0) establishPeerConnections();
    }, [stream, participants.length, establishPeerConnections]);

    // ---- WebSocket event  ----
    useEffect(() => {
        on('receive-offer', handleReceiveOffer);
        on('receive-answer', handleReceiveAnswer);
        on('receive-ice-candidate', handleReceiveIceCandidate);
        on('new-participant', handleNewParticipant);
        on('participant-left', handleParticipantLeft);
        on('participant-update', handleParticipantUpdate);

        return () => {
            peerConnections.current.forEach((pc) => pc.close());
            peerConnections.current.clear();
            pendingCandidates.current.clear();
            off('receive-offer');
            off('receive-answer');
            off('receive-ice-candidate');
            off('new-participant');
            off('participant-left');
            off('participant-update');
            if (isConnected) emit('hang-up');
        };
    }, [on, off, emit, isConnected, handleReceiveOffer, handleReceiveAnswer,
        handleReceiveIceCandidate, handleNewParticipant, handleParticipantLeft, handleParticipantUpdate]);

    // ---- Controls ----
    const toggleMic = useCallback(() => {
        if (stream) stream.getAudioTracks().forEach(track => track.enabled = !micOn);
        toggle('mic');
        emit('toggle-mute', { sessionId, userId: user?.id });
    }, [stream, micOn, emit, toggle, sessionId, user?.id]);

    const toggleVideo = useCallback(() => {
        if (stream) stream.getVideoTracks().forEach(track => track.enabled = !videoOn);
        toggle('video');
        emit('toggle-video', { sessionId, userId: user?.id });
    }, [stream, videoOn, emit, toggle, sessionId, user?.id]);

    const switchCamera = useCallback(() => {
        if (stream)
            stream.getVideoTracks().forEach(track => typeof track._switchCamera === 'function' && track._switchCamera());
    }, [stream]);

    const hangup = useCallback(() => {
        emit('hang-up');
        clear();
        clearStream();
        resetAndNavigate('HomeScreen');
    }, [emit, clear, clearStream]);

    // ---- Handle back press ----
    useEffect(() => {
        const backAction = () => {
            if (backPressCount.current === 0) {
                backPressCount.current += 1;
                ToastAndroid.show('Press back again to leave', ToastAndroid.SHORT);
                setTimeout(() => (backPressCount.current = 0), 2000);
                return true;
            } else {
                hangup();
                replace('HomeScreen');
                return false;
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [hangup]);

    return { participants, toggleMic, toggleVideo, switchCamera, hangup };
};

export default useWebRTC;
