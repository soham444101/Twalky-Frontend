import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvstorage } from './storage.services';

export const meetStore = create()(

    (set, get) => ({
        sessionId: null,
        participants: [],
        localStreamFlag:false ,
        chatMessages: [],
        micOn: false,
        videoOn: false,
        activeUser:[],
        addSessionId: id => {
            console.log('====================================');
            console.log("Add Session Id call Here ",id);
            console.log('====================================');
            set({
                sessionId: id
            });
        },
        removeSessionId: id => {
            set({
                sessionId: null
            })
        },
        addParticipant: participant => {
            const { participants } = get();
            const existParticipant = participants.find(i => i.userId === participant?.userId);
            if (!existParticipant) {
                set({ participants: [...participants, participant] });
            }
        },
        removeParticipant: participantId => {
            const { participants } = get();
            set({ participants: participants.filter(i => i.userId !== participantId) });
        },
        updateParticipant: updateParticipant => {
            const { participants } = get();
            set(
                {
                    participants: participants.map(p =>
                        p.userId === updateParticipant.userId ?
                            {
                                ...p,
                                micOn: updateParticipant.micOn,
                                videoOn: updateParticipant.videoOn,

                            } : p,
                    )

                }
            )

        },

        setStreamURL: (participantId, streamURL) => {
            const { participants } = get();
            const updateParticipant = participants.map(
                p => {
                    if (p.userId === participantId) {
                        return { ...p, streamURL };
                    }
                    return p;
                }
            );

            set({ participants: updateParticipant });
        },
        toggle: type => {
            if (type == 'mic') {
                set(state => ({ micOn: !state.micOn }))
            } else if (type == 'video') {
                set(state => ({ videoOn: !state.videoOn }))
            }
        },
        toggleLocalstreamFlag: ()=>{
            set({localStreamFlag :!localStreamFlag})
        }
        ,
        // clear:()=>{
        //     set({
        //         sessionId:null,
        //         participants:[],
        //         chatMessages:[],
        //     })
        // }



    }),
    {

        name: "live-storage",
        storage: createJSONStorage(() => mmkvstorage)
    }

);
