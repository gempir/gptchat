import { useEffect, useState } from 'react';
import { useStore } from '../store';
import useMap, { useMapReturn } from './useMap';


type Return = {
    makeSound: (text?: string, textId?: string) => void;
    sounds: useMapReturn<string, Sound>;
    stopSound: (textId: string) => void;
    setGain: (gain: string) => void;
};

type Sound = {
    audio: AudioBufferSourceNode;
    textId: string;
    loading: boolean;
    gainNode: GainNode;
}

export interface Voice {
    voice_id: string;
    name: string;
}

export function useVoices() {
    const elevenLabsApiKey = useStore(state => state.elevenLabsApiKey);

    const [voices, setVoices] = useState<Array<Voice>>([]);

    useEffect(() => {
        if (!elevenLabsApiKey) {
            return;
        }

        fetch(`https://api.elevenlabs.io/v1/voices`, {
            headers: {
                'xi-api-key': elevenLabsApiKey,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(resp => resp.voices).then(voices => {
            if (voices) {
                setVoices(voices);
            }
        }).catch(console.error);
    }, [elevenLabsApiKey]);

    return voices;
}

export function useElevenLabsApi(onEnded?: (textId: string) => void): Return {
    const elevenLabsVoiceId = useStore(state => state.elevenLabsVoiceId);
    const elevenLabsApiKey = useStore(state => state.elevenLabsApiKey);
    const gain = useStore(state => state.gain);

    const [sounds, actions] = useMap(new Map<string, Sound>);

    useEffect(() => {
        sounds.forEach(sound => {
            sound.gainNode.gain.value = gain / 100;
        });
    }, [gain, sounds]);

    const makeSound = (text?: string, textId?: string) => {
        if (!text || !textId || !elevenLabsApiKey) {
            return;
        }

        const audioContext = new AudioContext();
        const mediaSource = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = gain / 100;

        actions.set(textId, {
            audio: mediaSource,
            gainNode,
            textId,
            loading: true,
        });

        fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': elevenLabsApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        }).then(response => response.arrayBuffer())
            .then(audioData => audioContext.decodeAudioData(audioData))
            .then(decodedAudio => {
                actions.set(textId, {
                    audio: mediaSource,
                    gainNode,
                    textId,
                    loading: false
                });

                mediaSource.connect(gainNode).connect(audioContext.destination)

                mediaSource.buffer = decodedAudio;
                mediaSource.onended = () => {
                    mediaSource.disconnect();
                    actions.remove(textId);
                    if (onEnded) {
                        onEnded(textId);
                    }
                }
                mediaSource.start();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const stopSound = (textId: string) => {
        const sound = sounds.get(textId);
        if (sound) {
            sound.audio.stop();
            sound.audio.disconnect();
            actions.remove(textId);
            if (onEnded) {
                onEnded(textId);
            }
        }
    }

    const setGain = (value: string) => {
        sounds.forEach(sound => {
            sound.gainNode.gain.value = Number(value) / 100;
        });
    }

    return { makeSound, sounds, stopSound, setGain };
}
