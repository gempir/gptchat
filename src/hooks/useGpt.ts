import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { useEffect, useState } from "react";
import { useStore } from "../store";

type ChatMsg = {
    role: "user" | "assistant" | "system";
    content: string;
};

export function useGpt(): { makeRequest: (prompt: string) => Promise<ChatMsg | undefined>, messages: Array<ChatCompletionRequestMessage>, loading: boolean } {
    const [msgs, setMsgs] = useState<Array<ChatCompletionRequestMessage>>([{ content: "You are a helpful assistant.", role: "system" }]);
    const [openAI, setOpenAI] = useState<OpenAIApi>();
    const [loading, setLoading] = useState(false);
    const openAiApiKey = useStore(state => state.openAiApiKey);

    useEffect(() => {
        if (!openAiApiKey) {
            return;
        }

        const configuration = new Configuration({
            apiKey: openAiApiKey,
        });
        const client = new OpenAIApi(configuration);
        setOpenAI(client);
    }, [openAiApiKey]);

    const makeRequest = (prompt: string): Promise<ChatMsg | undefined> => {
        if (!openAI || !prompt) {
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

            const newMsgs: Array<ChatMsg> = [...msgs, userMessage, { content: message, role: "assistant" }];
            setMsgs(newMsgs);

            const chatMsg: ChatMsg = { content: message, role: "assistant" };

            return chatMsg;
        }).finally(() => setLoading(false));
    }

    return { makeRequest, messages: msgs, loading }
}