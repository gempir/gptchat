"use client";
import { GptConfig } from "@/src/GptConfig";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { FormEvent } from "react";
import { useVoices } from "./voice/useElevenLabs";
import { VolumeSlider } from "./voice/VolumeSlider";

export default function ConfigPage() {
    const voices = useVoices();

    const saveToLocalStorage = (key: GptConfig, e: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
        localStorage.setItem(key, e.currentTarget.value.trim());
    }

    return (
        <div>
            <Link href={"/"} className="absolute top-5 left-5">
                <ArrowLeftCircleIcon className="h-6 hover:opacity-50 cursor-pointer" />
            </Link>
            <VolumeSlider />
            <div className="p-5 container mx-auto">
                <div className="p-4 bg-gray-800 rounded shadow min-w-[400px]">
                    <label>
                        <strong>OpenAPI API Key:</strong>
                        <br />
                        <a href="https://platform.openai.com/account/api-keys" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="password" onChange={e => saveToLocalStorage(GptConfig.OPEN_AI_API_KEY, e)} defaultValue={getConfig(GptConfig.OPEN_AI_API_KEY)} />
                    </label>
                    <br />
                    <label>
                        ElevenLebs API Key:
                        <br />
                        <a href="https://beta.elevenlabs.io/" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key (Profile)</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="password" onChange={e => saveToLocalStorage(GptConfig.ELEVEN_LABS_API_KEY, e)} defaultValue={getConfig(GptConfig.ELEVEN_LABS_API_KEY)} />
                    </label>
                    <br />
                    <label>
                        <strong>Voice (Refresh after setting API Key):</strong>
                        <br />
                        <select className="block truncate form-select w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" onChange={e => saveToLocalStorage(GptConfig.VOICE_ID, e)}>
                            {Object.values(voices).map(voice =>
                                <option key={voice.voice_id} value={voice.voice_id} selected={getConfig(GptConfig.VOICE_ID) === voice.voice_id}>{voice.name}</option>
                            )}
                        </select>
                        <br />
                        <strong>Custom Voice ID</strong>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="text" onChange={e => saveToLocalStorage(GptConfig.VOICE_ID, e)} value={""} />
                    </label>
                </div>
            </div>
        </div>
    );
}

export function getConfig(key: GptConfig, fallback?: string) {
    if (typeof window === "undefined") return fallback;

    return (window?.localStorage?.getItem(key)) ?? fallback;
}