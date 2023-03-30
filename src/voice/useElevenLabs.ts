import { GptConfig } from '../GptConfig';
import useMap, { useMapReturn } from './useMap';
import { Voices } from './voices';


type Return = {
    makeSound: (text?: string, textId?: string) => void;
    sounds: useMapReturn<string, Sound>;
    stopSound: (textId: string) => void;
};

type Sound = {
    audio: AudioBufferSourceNode;
    textId: string;
    loading: boolean;
}

export function useElevenLabsApi(onEnded: (textId: string) => void): Return {
    const [sounds, actions] = useMap(new Map<string, Sound>);

    const makeSound = (text?: string, textId?: string) => {
        if (!text || !textId) {
            return;
        }

        const audioContext = new AudioContext();
        const mediaSource = audioContext.createBufferSource();

        actions.set(textId, {
            audio: mediaSource,
            textId,
            loading: true,
        });

        fetch(`https://api.elevenlabs.io/v1/text-to-speech/${Voices[0].voice_id}/stream`, {
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
                    textId,
                    loading: false
                });

                // Set media source buffer's buffer to decoded audio
                mediaSource.buffer = decodedAudio;

                // Connect media source buffer to audio context's destination
                mediaSource.connect(audioContext.destination);

                mediaSource.onended = () => {
                    // Clean up
                    mediaSource.disconnect();
                    actions.remove(textId);
                    onEnded(textId);
                }

                // Start playing audio
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

    return { makeSound, sounds, stopSound };
}

function getElevenLabsApiKey(): string {
    return localStorage.getItem(GptConfig.ELEVEN_LABS_API_KEY) ?? "";
}