import { mediaDevices } from "react-native-webrtc";
import { create } from "zustand";

export const useStreamStore = create(
    (set, get) => ({
        stream: null,
        isInitializing: false, // Added loading state

        setStream: stream => {
            console.log("Setting stream:", stream ? stream.toURL() : null);
            set({ stream: stream });
        },

        initStream: async (maxAttempts = 5) => {
            //  Check if already initializing
            if (get().isInitializing) {
                console.log("Stream initialization already in progress");
                return null;
            }

            //   Return existing stream if available
            const existingStream = get().stream;
            if (existingStream) {
                console.log("Stream already exists, returning it");
                return existingStream;
            }

            set({ isInitializing: true });
            let attempts = 0;

            while (attempts < maxAttempts) {
                console.log(`Stream initialization attempt ${attempts + 1}/${maxAttempts}`);

                try {
                    const media = await mediaDevices.getUserMedia({
                        audio: true,
                        video: {
                            width: 640,
                            height: 480,
                            frameRate: 30,
                            facingMode: 'user'
                        },
                    });

                    if (media) {
                        // Verify tracks exist
                        const audioTracks = media.getAudioTracks();
                        const videoTracks = media.getVideoTracks();

                        console.log("Media obtained successfully");
                        console.log(`Audio tracks: ${audioTracks.length}`);
                        console.log(`Video tracks: ${videoTracks.length}`);

                        if (audioTracks.length === 0 || videoTracks.length === 0) {
                            console.warn("Missing audio or video tracks");
                            // Stop the incomplete stream
                            media.getTracks().forEach(track => track.stop());
                            throw new Error("Incomplete media stream");
                        }

                        set({ stream: media, isInitializing: false });
                        console.log("Stream URL:", media.toURL());
                        return media;
                    }

                } catch (error) {
                    console.error(`Failed to get media on attempt ${attempts + 1}:`, error.message);
                }

                attempts++;

                // Wait before retrying (except on last attempt)
                if (attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }

            console.error(`Failed to initialize stream after ${maxAttempts} attempts`);
            set({ isInitializing: false });
            return null;
        },

        clearStream: () => {
            console.log("Clearing stream");
            const current = get().stream;

            if (current) {
                console.log("Stopping all tracks");
                current.getTracks().forEach((track) => {
                    console.log(`Stopping ${track.kind} track`);
                    track.stop();
                });
            } else {
                console.log("No stream to clear");
            }

            set({ stream: null, isInitializing: false });
        },

        //   Added utility to check if stream is valid
        isStreamValid: () => {
            const current = get().stream;
            if (!current) return false;

            const audioTracks = current.getAudioTracks();
            const videoTracks = current.getVideoTracks();

            const hasValidAudio = audioTracks.length > 0 && audioTracks[0].readyState === 'live';
            const hasValidVideo = videoTracks.length > 0 && videoTracks[0].readyState === 'live';

            return hasValidAudio && hasValidVideo;
        },

        //  Added method to get track states
        getTrackStates: () => {
            const current = get().stream;
            if (!current) return { audio: null, video: null };

            const audioTrack = current.getAudioTracks()[0];
            const videoTrack = current.getVideoTracks()[0];

            return {
                audio: audioTrack ? {
                    enabled: audioTrack.enabled,
                    readyState: audioTrack.readyState
                } : null,
                video: videoTrack ? {
                    enabled: videoTrack.enabled,
                    readyState: videoTrack.readyState
                } : null
            };
        }
    })
);

// export const getStream = () => useStreamStore.getState().stream;
// export const setStream = (stream) => useStreamStore.getState().setStream(stream);
// export const initStream = () => useStreamStore.getState().initStream();
// export const clearStream = () => useStreamStore.getState().clearStream();
// export const isStreamValid = () => useStreamStore.getState().isStreamValid();
// export const getTrackStates = () => useStreamStore.getState().getTrackStates();