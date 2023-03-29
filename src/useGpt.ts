import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { useEffect, useState } from "react";
import { GptConfig } from "./GptConfig";
import { useElevenLabsApi } from "./voice/useElevenLabs";

type ChatMsg = {
    role: "user" | "assistant" | "system";
    content: string;
};

export function useGpt(): { makeRequest: (prompt: string) => Promise<ChatMsg | undefined>, messages: Array<ChatCompletionRequestMessage>, loading: boolean } {
    const [msgs, setMsgs] = useState<Array<ChatCompletionRequestMessage>>([{ content: "You are a helpful assistant.", role: "system" }]);
    const [openAI, setOpenAI] = useState<OpenAIApi>();
    const { makeSound } = useElevenLabsApi();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const apiKey = getOpenAiApiKey();
        if (!apiKey) {
            return;
        }

        const configuration = new Configuration({
            apiKey: apiKey,
        });
        const client = new OpenAIApi(configuration);
        setOpenAI(client);
    }, []);

    const makeRequest = (prompt: string): Promise<ChatMsg | undefined> => {
        if (!openAI) {
            return Promise.resolve(undefined);
        }

        const userMessage: ChatCompletionRequestMessage = { content: prompt, role: "user" };
        const newMsgs = [...msgs, userMessage];

        const request: CreateChatCompletionRequest = {
            messages: newMsgs,
            model: "gpt-3.5-turbo",
        };

        setMsgs(newMsgs);

        setLoading(true);
        return openAI.createChatCompletion(request).then(response => {
            const message = response.data.choices[response.data.choices.length - 1].message?.content
            if (!message) {
                return;
            }

            makeSound(message);
            // message.split(".").map(makeSound)

            setMsgs([...msgs, userMessage, { content: message, role: "assistant" }]);

            const chatMsg: ChatMsg = { content: message, role: "assistant" };

            return chatMsg;
        }).finally(() => setLoading(false));
    }

    return { makeRequest, messages: msgs, loading }
}

export function getOpenAiApiKey() {
    return localStorage.getItem(GptConfig.OPEN_AI_API_KEY) ?? "NO_KEY";
}