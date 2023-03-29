"use client";
import useWhisper from "@chengsokdara/use-whisper";
import { CogIcon, CommandLineIcon, CpuChipIcon, MicrophoneIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { getOpenAiApiKey, useGpt } from "./useGpt";

export function GptPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [input, setInput] = useState<string>("");

    const { makeRequest, messages, loading } = useGpt();
    const {
        recording,
        speaking,
        transcribing,
        transcript,
        pauseRecording,
        startRecording,
        stopRecording,
    } = useWhisper({
        apiKey: getOpenAiApiKey(),
        streaming: true,
        timeSlice: 1_000, // 1 second
        whisperConfig: {
            language: 'en',
        },
        nonStop: true, // keep recording as long as the user is speaking
        stopTimeout: 4_000, // 4 second
    });

    // useEffect(() => {
    //     if (!transcribing && !recording && input.trim()) {
    //         handleSubmit();
    //     }
    // }, [input, transcribing, recording]);

    console.log(transcript);

    useEffect(() => {
        if (transcript.text) {
            setInput(transcript.text);
        }
    }, [transcript, transcribing]);

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        if (!formRef.current) {
            return;
        }
 
        const formData = new FormData(formRef.current);
        const text = formData.get("prompt") as string;

        setInput("");
        stopRecording();
        makeRequest(text).then(startRecording);
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
        <div className="p-5 container mx-auto">
            <div className="p-4 min-w-[400px]">
                <div className="">
                    {messages.map((message, i) => <div key={i} className="flex items-center gap-2">
                        <div className="text-slate-600">{
                            message.role == "user" ? <UserIcon className="h-6" /> :
                                message.role == "assistant" ? <CpuChipIcon className="h-6" /> :
                                    message.role == "system" ? <CommandLineIcon className="h-6" /> : ""
                        }</div>
                        <div className={`p-2 my-2 w-full rounded  ${message.role == "user" ? "bg-gray-800" : ""} ${message.role == "assistant" ? "bg-gray-700" : ""} ${message.role == "system" ? "text-slate-600 bg-gray-800" : ""}`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                    </div>)}
                </div>
                {loading && <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"></div>
                </div>}
                <form ref={formRef} onSubmit={handleSubmit} className="flex gap-5 items-center" onKeyDown={handleKeyDown}>
                    <div className="h-full p-2 rounded cursor-pointer hover:bg-slate-500" onClick={() => recording ? stopRecording() : startRecording()}>
                        <MicrophoneIcon className={`h-6 ${recording ? "text-red-700" : ""} ${speaking ? "animate-pulse" : ""}`} />
                    </div>
                    <textarea disabled={loading} name="prompt" value={input} onChange={e => setInput(e.currentTarget.value)} className={"min-h-[100px] form-input w-full border-none bg-gray-800 mt-2 p-2 rounded shadow"} placeholder={"Shift+Enter for newlines"} />
                    <input type={"submit"} value={"Send"} className={"h-full bg-gray-700 min-w-[100px] text-gray-200 p-2 mt-2 rounded shadow hover:opacity-50 cursor-pointer"} />
                </form>
            </div>
        </div>
    </div>
}

