import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Store {
    openAiApiKey?: string
    elevenLabsApiKey?: string
    elevenLabsVoiceId?: string
    gain: number,
    openMic: boolean,
    setOpenAiApiKey: (key: string) => void
    setElevenLabsApiKey: (key: string) => void
    setElevenLabsVoiceId: (id: string) => void
    setGain: (gain: number) => void
    setOpenMic: (openMic: boolean) => void
}

export const useStore = create<Store>()(
    devtools(
        persist(
            (set) => (
                {
                    openAiApiKey: undefined,
                    elevenLabsApiKey: undefined,
                    elevenLabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
                    gain: 100,
                    openMic: false,
                    setOpenAiApiKey: (key: string) => set({ openAiApiKey: key }),
                    setElevenLabsApiKey: (key: string) => set({ elevenLabsApiKey: key }),
                    setElevenLabsVoiceId: (id: string) => set({ elevenLabsVoiceId: id }),
                    setGain: (gain: number) => set({ gain }),
                    setOpenMic: (openMic: boolean) => set({ openMic }),
                }
            ),
            {
                name: 'gptchat-storage',
            }
        )
    )
)