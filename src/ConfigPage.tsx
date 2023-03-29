"use client";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { FormEvent } from "react";
import { GptConfig } from "@/src/GptConfig";

export default function ConfigPage() {

    const saveToLocalStorage = (key: GptConfig, e: FormEvent<HTMLInputElement>) => {
        localStorage.setItem(key, e.currentTarget.value.trim());
    }

    return (
        <div>
            <Link href={"/"} className="absolute top-5 left-5">
                <ArrowLeftCircleIcon className="h-6 hover:opacity-50 cursor-pointer" />
            </Link>
            <div className="p-5 container mx-auto">
                <div className="p-4 bg-gray-800 rounded shadow min-w-[400px]">
                    <label>
                        <strong>OpenAPI API Key:</strong>
                        <br />
                        <a href="https://platform.openai.com/account/api-keys" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="password" onChange={e => saveToLocalStorage(GptConfig.OPEN_AI_API_KEY, e)} defaultValue={getCurrentValue(GptConfig.OPEN_AI_API_KEY)} />
                    </label>
                    <br />
                    <label>
                        ElevenLebs API Key:
                        <br />
                        <a href="https://beta.elevenlabs.io/" className="text-gray-500 hover:text-gray-200" target="_blank" rel="noreferrer">Get API Key (Profile)</a>
                        <input className="block truncate form-input w-full border-none bg-gray-700 mt-2 p-2 rounded shadow" type="password" onChange={e => saveToLocalStorage(GptConfig.ELEVEN_LABS_API_KEY, e)} defaultValue={getCurrentValue(GptConfig.ELEVEN_LABS_API_KEY)} />
                    </label>
                </div>
            </div>
        </div>
    );
}

function getCurrentValue(key: GptConfig) {
    if (typeof window === "undefined") return "";

    return (window?.localStorage?.getItem(key)) ?? "";
}