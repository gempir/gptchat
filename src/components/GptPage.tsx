"use client";
import { CogIcon, CommandLineIcon, CpuChipIcon, MicrophoneIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { useGpt } from "../hooks/useGpt";
import { useElevenLabsApi } from "../hooks/useElevenLabs";
import { VolumeSlider } from "./VolumeSlider";
import { useStore } from "../store";
import { ResultType } from "react-hook-speech-to-text";

export default function GptPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const openMic = useStore(state => state.openMic);
    const [input, setInput] = useState<string>("");
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const {
        error,
        interimResult,
        isRecording,
        results,
        setResults,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: openMic,
        useLegacyResults: false,
    });
    const { makeSound, sounds, stopSound } = useElevenLabsApi(() => {
        if (openMic) {
            startSpeechToText().catch();
        }
    });

    const { makeRequest, messages, loading } = useGpt();

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        let inputVal = results.map(result => (result as ResultType).transcript).join(" ");
        inputVal = inputVal.trim();
        if (interimResult) {
            inputVal += ` ${interimResult}`;
        }

        if (inputVal.trim()) {
            setInput(inputVal);
        }
    }, [interimResult, results]);

    useEffect(() => {
        if (results.length > 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                console.log(results);
                handleSubmit(undefined, results.map(result => (result as ResultType).transcript).join(" "));
            }, 3000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results]);

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, prompt?: string) => {
        let text;
        if (!prompt) {
            e?.preventDefault();

            if (!formRef.current) {
                return;
            }

            const formData = new FormData(formRef.current);
            text = formData.get("prompt") as string;
        } else {
            text = prompt;
        }

        setResults([]);
        setInput("");
        try {
            stopSpeechToText()
        } catch (e) { }
        makeRequest(text).then(chatMsg => makeSound(chatMsg?.content, chatMsg?.content));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.requestSubmit();
        }
    };

    return <div>
        <Link href="/config" className="absolute top-5 left-5">
            <CogIcon className="h-6 hover:opacity-50 cursor-pointer" />
        </Link>
        <VolumeSlider />
        <div className="p-5 container mx-auto">
            <div className="p-4 min-w-[400px]">
                <div className="">
                    {messages.map((message, i) => <div key={i} className="flex items-center gap-2">
                        <div className="text-slate-600">{
                            message.role == "user" ? <UserIcon className="h-6" /> :
                                message.role == "assistant" ? <CpuChipIcon className={`h-6 ${sounds.get(message.content)?.loading === false ? "text-red-700 cursor-pointer" : ""} ${sounds.get(message.content)?.loading === true ? "animate-pulse cursor-pointer" : ""}`} onClick={() => stopSound(message.content)} /> :
                                    message.role == "system" ? <CommandLineIcon className="h-6" /> : ""
                        }</div>
                        <div className={`p-2 my-2 w-full rounded  ${message.role == "user" ? "bg-gray-800" : ""} ${message.role == "assistant" ? "bg-gray-700" : ""} ${message.role == "system" ? "text-slate-600 bg-gray-800" : ""}`}>
                            <div className={`whitespace-pre-wrap`}>{message.content}</div>
                        </div>
                    </div>)}
                </div>
                {loading && <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"></div>
                </div>}
                <form ref={formRef} onSubmit={handleSubmit} className="flex gap-5 items-center" onKeyDown={handleKeyDown}>
                    <div className="h-full p-2 rounded cursor-pointer hover:bg-slate-500" onClick={() => isRecording ? stopSpeechToText() : startSpeechToText()}>
                        <MicrophoneIcon className={`h-6 ${isRecording ? "text-red-700" : ""}`} />
                    </div>
                    <textarea disabled={loading} name="prompt" value={input} onChange={e => setInput(e.currentTarget.value)} className={"min-h-[100px] form-input w-full border-none bg-gray-800 mt-2 p-2 rounded shadow"} placeholder={"Shift+Enter for newlines"} />
                    <input type={"submit"} value={"Send"} className={"h-full bg-gray-700 min-w-[100px] text-gray-200 p-2 mt-2 rounded shadow hover:opacity-50 cursor-pointer"} />
                </form>
            </div>
        </div>
    </div>
}

