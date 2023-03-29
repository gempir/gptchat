import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { useEffect, useState } from "react";
import { GptConfig } from "./GptConfig";
import { useElevenLabsApi } from "./voice/useElevenLabs";

type ChatMsg = {
    role: "user" | "assistant" | "system";
    content: string;
};

export function useGpt(): { makeRequest: (prompt: string) => void, messages: Array<ChatCompletionRequestMessage> } {
    const [msgs, setMsgs] = useState<Array<ChatCompletionRequestMessage>>([{content: "You are a helpful assistant who speaks like it is Skynet from the Terminator movies", role: "system"}]);
    const [openAI, setOpenAI] = useState<OpenAIApi>();
    const {makeSound} = useElevenLabsApi();

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

    const makeRequest = (prompt: string): void => {
        if (!openAI) {
            return;
        }

        const userMessage: ChatCompletionRequestMessage = { content: prompt, role: "user" };
        const newMsgs = [...msgs, userMessage];

        const request: CreateChatCompletionRequest = {
            messages: newMsgs,
            model: "gpt-3.5-turbo",
        };

        setMsgs(newMsgs);

        openAI.createChatCompletion(request).then(response => {
            const message = response.data.choices[response.data.choices.length - 1].message?.content
            if (!message) {
                return;
            }
            
            makeSound(message);
            // message.split(".").map(makeSound)

            setMsgs([...msgs, userMessage, { content: message, role: "assistant" }]);
        });
    }

    return { makeRequest, messages: msgs }
}

function getOpenAiApiKey() {
    return localStorage.getItem(GptConfig.OPEN_AI_API_KEY);
}