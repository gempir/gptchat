import { useRef } from 'react';
import { GptConfig } from '../GptConfig';
import { Voices } from './voices';

export function useElevenLabsApi(): { makeSound: (text: string) => void } {
    const makeSound = (text: string) => {
        const audioContext = new AudioContext();
        const mediaSource = audioContext.createBufferSource()

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
                // Set media source buffer's buffer to decoded audio
                mediaSource.buffer = decodedAudio;

                // Connect media source buffer to audio context's destination
                mediaSource.connect(audioContext.destination);

                // Start playing audio
                mediaSource.start();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return { makeSound }
}

function getElevenLabsApiKey(): string {
    return localStorage.getItem(GptConfig.ELEVEN_LABS_API_KEY) ?? "";
}