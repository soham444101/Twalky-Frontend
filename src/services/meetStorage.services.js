import { create } from 'zustand';
import { useUserStore } from '../services/useStorage.services';

export const meetStore = create()(
    (set, get) => ({
        sessionId: null,
        participants: [],
        localStreamFlag: false,
        chatMessages: [],
        micOn: false,
        videoOn: false,
        activeUser: [],

        addSessionId: id => {
            console.log('====================================');
            console.log("Add Session Id called:", id);
            console.log('====================================');
            set({
                sessionId: id
            });
        },

        removeSessionId: () => {
            console.log("Removing session ID");
            set({
                sessionId: null
            });
        },

        addParticipant: participant => {
            const { participants } = get();
            const existParticipant = participants.find(i => i.userId === participant?.userId);
            const user = useUserStore.getState().user;

            // Don't add self
            if (participant.userId === user?.id) {
                console.log("Skipping self participant");
                return;
            }

            if (!existParticipant) {
                console.log("Adding new participant:", participant.userId, participant);
                set({ participants: [...participants, participant] });
            } else {
                console.log("Participant already exists:", participant.userId);
            }
        },

        removeParticipant: participantId => {
            console.log("Removing participant:", participantId);
            const { participants } = get();
            set({ participants: participants.filter(i => i.userId !== participantId) });
        },

        updateParticipant: updatedParticipant => {
            console.log("Updating participant:", updatedParticipant.userId, updatedParticipant);
            const { participants } = get();
            set({
                participants: participants.map(p =>
                    p.userId === updatedParticipant.userId ?
                        {
                            ...p,
                            micOn: updatedParticipant.micOn,
                            videoOn: updatedParticipant.videoOn,
                        } : p,
                )
            });
        },

        setStreamURL: (participantId, streamURL) => {
            console.log("Setting stream URL for participant:", participantId);
            console.log("Stream URL type:", typeof streamURL);
            console.log("Stream URL value:", streamURL);
            
            const { participants } = get();
            const updatedParticipants = participants.map(
                p => {
                    if (p.userId === participantId) {
                        console.log("Found participant, updating stream URL");
                        return { ...p, streamURL };
                    }
                    return p;
                }
            );

            console.log("Updated participants:", updatedParticipants);
            set({ participants: updatedParticipants });
        },

        toggle: type => {
            if (type === 'mic') {
                set(state => {
                    console.log(`Toggling mic: ${!state.micOn}`);
                    return { micOn: !state.micOn };
                });
            } else if (type === 'video') {
                set(state => {
                    console.log(`Toggling video: ${!state.videoOn}`);
                    return { videoOn: !state.videoOn };
                });
            }
        },

        toggleLocalstreamFlag: () => {
            set(state => {
                console.log(`Toggling local stream flag: ${!state.localStreamFlag}`);
                return { localStreamFlag: !state.localStreamFlag };
            });
        },

        clear: () => {
            console.log("Clearing meet store");
            set({
                sessionId: null,
                participants: [],
                chatMessages: [],
                localStreamFlag: false,
                micOn: false,
                videoOn: false,
                activeUser: [],
            });
        }
    })
);