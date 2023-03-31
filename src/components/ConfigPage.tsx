"use client";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useVoices } from "../hooks/useElevenLabs";
import { useStore } from "../store";
import { VolumeSlider } from "./VolumeSlider";

export default function ConfigPage() {
    const openMic = useStore(state => state.openMic);
    const setOpenMic = useStore(state => state.setOpenMic);

    const openAiApiKey = useStore(state => state.openAiApiKey);
    const setOpenAiApiKey = useStore(state => state.setOpenAiApiKey);

    const elevenLabsApiKey = useStore(state => state.elevenLabsApiKey);
    const setElevenLabsApiKey = useStore(state => state.setElevenLabsApiKey);

    const elevenLabsVoiceId = useStore(state => state.elevenLabsVoiceId);
    const setElevenLabsVoiceId = useStore(state => state.setElevenLabsVoiceId);

    const voices = useVoices();

    return (
        <div>
            <Link href={"/"} className="absolute top-5 left-5">
                <ArrowLeftCircleIcon className="h-6 hover:opacity-50 cursor-pointer" />
            </Link>
            <VolumeSlider />
            <div className="p-5 container mx-auto">
                <div className="p-4 bg-gray-800 rounded shadow min-w-[400px]">
                    <label>
                        <strong>Open Mic</strong>
                        <br />
                        <label className="cursor-pointer">
                            <span className="select-none">Listen for input again after TTS finishes</span>
                            <input className="block truncate form-input border-none bg-gray-700 mt-2 p-2 rounded shadow" type="checkbox" onChange={e => setOpenMic(e.currentTarget.checked)} checked={openMic} />
                        </label>
                    </label>
                    <br />
                    <label>
                        <strong>OpenAPI API Key:</strong>
                        <br />
                        <a href="https://platform.openai.com/account/api-keys" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="password" onChange={e => setOpenAiApiKey(e.currentTarget.value)} value={openAiApiKey} />
                    </label>
                    <br />
                    <label>
                        ElevenLebs API Key:
                        <br />
                        <a href="https://beta.elevenlabs.io/" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key (Profile)</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow"
                            type="password"
                            onChange={e => setElevenLabsApiKey(e.currentTarget.value)}
                            value={elevenLabsApiKey} />
                    </label>
                    <br />
                    <label>
                        <strong>Voice</strong>
                        <br />
                        <select className="block truncate form-select w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" onChange={e => setElevenLabsVoiceId(e.currentTarget.value)} value={elevenLabsVoiceId}>
                            {Object.values(voices).map(voice =>
                                <option key={voice.voice_id} value={voice.voice_id}>{voice.name}</option>
                            )}
                        </select>
                        <br />
                        <strong>Voice ID</strong>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="text" onChange={e => setElevenLabsVoiceId(e.currentTarget.value)} value={elevenLabsVoiceId} />
                    </label>
                </div>
            </div>
        </div>
    );
}