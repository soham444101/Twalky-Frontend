import { mediaDevices } from "react-native-webrtc";
import { create } from "zustand";


export const useStreamStore = create(
    (set, get) => ({
        stream: null,
        setStream: stream => {
            set({ stream: stream })
        },
        initStream: async (maxattempt = 5) => {

            if (get().stream) return get().stream;
            let attemps = 0;
            
            while (attemps < maxattempt) {
                console.log("Attemps", attemps + 1);

                try {
                  
                    const media = await mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    });
                    if (media) {
                        set({ stream: media })
                        console.log('====================================');
                        console.log("Media In zustan ", media);
                        console.log('====================================');
                        return media;
                    }
                    // console.log('====================================');
                    // console.log("media not get",media);
                    // console.log('====================================');

                } catch (error) {
                    console.log('====================================');
                    console.log("Medai we not get in attempt", attemps + 1);
                    console.log('====================================');
                }
                attemps++;
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            return null;
        },
        clearStream: () => {
            const current = get().stream;
            if (current) {
                current.getTracks().forEach((t) => t.stop());
            }
            set({ stream: null })
        }
    })
)