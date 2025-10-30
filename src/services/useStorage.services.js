import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvstorage } from './storage.services';

export const useUserStore = create()(
    persist(
        (set, get) => ({
            user: null,
            sessions: [],
            hasAudioPermission: false,
            hasVideoPermission: false,
            setUser: (data) => set({ user: data }),
            addSession: sessionId => {
                const { sessions } = get();
                console.log("Add Session is call from zustan")
                const existingSession = sessions.findIndex(s => s === sessionId);
                if (existingSession === -1) {
                    set({ sessions: [...sessions, sessionId] })
                }
            },
            removeSession: sessionId => {
                const { sessions } = get();
                const updateSession = sessions.filter(s => s !== sessionId);
                set({ sessions: updateSession })
            },
            setAudioPermission: flag => {
                set({ hasAudioPermission: flag });
            },
            setVideoPermission: flag => {
                set({ hasVideoPermission: flag });
            },
            clear: () => set({ user: null, sessions: [] ,hasAudioPermission:false,hasVideoPermission:false})

        }),
        {

            name: "user-storage",
            storage: createJSONStorage(() => mmkvstorage)
        }
    )
);
