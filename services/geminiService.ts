// FIX: Removed unused 'Blob' import to prevent type collision with the DOM Blob type.
import { GoogleGenAI, GenerateContentResponse, Content, Part, Modality } from "@google/genai";
import { ChatMessage, GroundingChunk } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const toGeminiContent = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
        const parts: Part[] = [{ text: msg.content }];
        if (msg.imageUrl) {
            parts.unshift({
                inlineData: {
                    mimeType: msg.imageUrl.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                    data: msg.imageUrl.split(',')[1],
                },
            });
        }
        return {
            role: msg.role,
            parts,
        };
    });
};

export const callGeminiApi = async (
    prompt: string,
    images?: { mimeType: string; data: string }[]
): Promise<string> => {
    try {
        const parts: Part[] = [];
        if (images && images.length > 0) {
            images.forEach(image => {
                parts.push({
                    inlineData: {
                        mimeType: image.mimeType,
                        data: image.data,
                    },
                });
            });
        }
        parts.push({ text: prompt });

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // FIX: Corrected the 'contents' structure to be an array of Content objects with a user role.
            contents: [{ role: 'user', parts }],
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
};

export const callGeminiChatApi = async (
    history: ChatMessage[],
    systemInstruction: string
): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
            history: toGeminiContent(history.slice(0, -1))
        });

        const lastMessage = history[history.length - 1];
        
        const messageParts: Part[] = [{ text: lastMessage.content }];
        if (lastMessage.imageUrl) {
            messageParts.unshift({
                inlineData: {
                    mimeType: lastMessage.imageUrl.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                    data: lastMessage.imageUrl.split(',')[1],
                },
            });
        }
        
        // FIX: The `sendMessage` method expects the parts array directly, not an object.
        const result = await chat.sendMessage(messageParts);

        return result.text;
    } catch (error) {
        console.error("Gemini Chat API call failed:", error);
        throw new Error("فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
};

export const callGeminiSearchApi = async (
    prompt: string
): Promise<{ text: string, groundingChunks: GroundingChunk[] }> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const chunks: GroundingChunk[] = groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => ({ web: c.web! })) || [];
        
        return { text: response.text, groundingChunks: chunks };
    } catch (error) {
        console.error("Gemini Search API call failed:", error);
        throw new Error("فشل البحث باستخدام الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg'
            }
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("فشل إنشاء الصورة. قد يكون الطلب غير متوافق مع سياسات الاستخدام.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
            config: {
                // FIX: Use Modality enum for responseModalities.
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Speech generation failed:", error);
        throw new Error("فشل توليد الكلام.");
    }
};

export const analyzeCaloriesForVoice = async (foodName: string): Promise<string> => {
    try {
        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية. قدم تقديراً للسعرات الحرارية والمكونات الرئيسية (بروتين، كربوهيدرات، دهون) لطعام "${foodName}". كن موجزاً ومباشراً.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Calorie analysis for voice failed:", error);
        return "عذراً، لم أتمكن من تحليل السعرات الحرارية الآن.";
    }
};
