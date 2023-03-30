import { useEffect, useState } from 'react';
import { getConfig } from '../ConfigPage';
import { GptConfig } from '../GptConfig';
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
    const [voices, setVoices] = useState<Array<Voice>>([]);

    const apiKey = getElevenLabsApiKey();

    useEffect(() => {
        fetch(`https://api.elevenlabs.io/v1/voices`, {
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(resp => resp.voices).then(voices => {
            if (voices) {
                setVoices(voices);
            }
        }).catch(console.error);
    }, [apiKey]);

    return voices;
}

export function useElevenLabsApi(onEnded: (textId: string) => void): Return {
    const [sounds, actions] = useMap(new Map<string, Sound>);

    const makeSound = (text?: string, textId?: string) => {
        if (!text || !textId) {
            return;
        }

        const audioContext = new AudioContext();
        const mediaSource = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const gainStr = getConfig(GptConfig.GAIN);
        if (gainStr) {
            gainNode.gain.value = Number(gainStr) / 100;
        }

        actions.set(textId, {
            audio: mediaSource,
            gainNode,
            textId,
            loading: true,
        });

        fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getConfig(GptConfig.VOICE_ID, "21m00Tcm4TlvDq8ikWAM")}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': getElevenLabsApiKey(),
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
                    onEnded(textId);
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
            onEnded(textId);
        }
    }

    const setGain = (value: string) => {
        sounds.forEach(sound => {
            sound.gainNode.gain.value = Number(value) / 100;
        });
    }

    return { makeSound, sounds, stopSound, setGain };
}

function getElevenLabsApiKey(): string {
    return localStorage.getItem(GptConfig.ELEVEN_LABS_API_KEY) ?? "";
}