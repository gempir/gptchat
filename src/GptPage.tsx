"use client";
import { CogIcon, CommandLineIcon, CpuChipIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useGpt } from "./useGpt";

export function GptPage() {
    const { makeRequest, messages, loading } = useGpt();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const text = formData.get("prompt") as string;

        makeRequest(text)

        const promptEl = e.currentTarget.elements.namedItem("prompt");
        if (promptEl instanceof HTMLTextAreaElement) {
            promptEl.value = "";
        }
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
                <form onSubmit={handleSubmit} className="flex gap-5 min-h-[100px]" onKeyDown={handleKeyDown}>
                    <textarea disabled={loading} name="prompt" className={"form-input w-full border-none bg-gray-800 mt-2 p-2 rounded shadow"} placeholder={"Shift+Enter for newlines"} />
                    <input type={"submit"} value={"Send"} className={"bg-gray-700 min-w-[100px] text-gray-200 p-2 mt-2 rounded shadow hover:opacity-50 cursor-pointer"} />
                </form>
            </div>
        </div>
    </div>
}

