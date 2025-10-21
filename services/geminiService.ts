import { GoogleGenAI, GenerateContentResponse, Part, Modality, Content, Type } from "@google/genai";
import { ChatMessage, DiaryEntry, GroundingChunk, VisualFoodAnalysis } from '../types';
import { getDiaryEntries } from "./diaryService";

// Per guidelines, initialize with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * A general-purpose function to call the Gemini API for text and vision tasks.
 * Uses 'gemini-2.5-flash' for speed and efficiency.
 * @param prompt - The text prompt.
 * @param images - An optional array of base64 encoded images.
 * @returns The generated text response.
 */
export const callGeminiApi = async (prompt: string, images?: { mimeType: string; data: string }[]): Promise<string> => {
    try {
        const parts: Part[] = [{ text: prompt }];
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

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        // Per guidelines, access text directly from the response.
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Throw a more user-friendly error message.
        throw new Error("فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
};

/**
 * Calls Gemini API and expects a JSON response based on a provided schema.
 * @param prompt - The text prompt.
 * @param schema - The JSON schema for the expected response.
 * @returns The parsed JSON object from the response.
 */
export const callGeminiJsonApi = async (prompt: string, schema: any): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        
        // Per guidelines, access text directly from the response.
        const jsonText = response.text.trim();
        
        // Basic cleanup, sometimes Gemini wraps it in markdown
        const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(cleanedJsonText);
    } catch (error) {
        console.error("Error calling Gemini JSON API:", error);
        throw new Error("فشل في توليد الخطة المنظمة. يرجى المحاولة مرة أخرى.");
    }
};

const visualFoodSchema = {
    type: Type.OBJECT,
    properties: {
        foodName: { type: Type.STRING, description: "اسم الطعام الذي تم التعرف عليه." },
        estimatedWeight: { type: Type.NUMBER, description: "الوزن المقدر للطعام بالجرام." },
        calories: { type: Type.NUMBER, description: "السعرات الحرارية المقدرة." },
        protein: { type: Type.NUMBER, description: "جرامات البروتين المقدرة." },
        carbohydrates: { type: Type.NUMBER, description: "جرامات الكربوهيدرات المقدرة." },
        fats: { type: Type.NUMBER, description: "جرامات الدهون المقدرة." },
        advice: { type: Type.STRING, description: "نصيحة صحية موجزة حول هذا الطعام." },
    },
    required: ["foodName", "estimatedWeight", "calories", "protein", "carbohydrates", "fats", "advice"],
};

export const callGeminiVisualJsonApi = async (prompt: string, image: { mimeType: string; data: string }): Promise<VisualFoodAnalysis> => {
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: visualFoodSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(cleanedJsonText) as VisualFoodAnalysis;
    } catch (error) {
        console.error("Error calling Gemini Visual JSON API:", error);
        throw new Error("فشل في تحليل الصورة غذائياً. يرجى المحاولة مرة أخرى.");
    }
}


/**
 * Handles conversational chat with the Gemini API.
 * Manages chat history and system instructions.
 * Uses 'gemini-2.5-flash'.
 * @param messages - The history of the conversation.
 * @param systemInstruction - The system prompt to guide the model's behavior.
 * @returns The model's next response in the conversation.
 */
export const callGeminiChatApi = async (messages: ChatMessage[], systemInstruction: string): Promise<string> => {
    try {
        // Filter out the initial greeting message from the model if it exists, to not confuse the model history
        const filteredMessages = messages.filter(m => m.role !== 'model' || m.content.includes('اسالني عن اي شيء يخطر ببالك') === false);

        const contents: Content[] = filteredMessages.map(msg => {
            const parts: Part[] = [{ text: msg.content }];
            if (msg.imageUrl) {
                parts.unshift({ // Add image before text if it exists
                    inlineData: {
                        mimeType: msg.imageUrl.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
                        data: msg.imageUrl.split(',')[1]
                    }
                });
            }
            return {
                role: msg.role,
                parts: parts
            };
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: `${systemInstruction} الرجاء الرد دائماً باللغة العربية الفصحى.`,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error in Gemini Chat API:", error);
        throw new Error("فشل الاتصال بمساعد الدردشة. يرجى المحاولة مرة أخرى.");
    }
};

/**
 * Generates an image using the Imagen model.
 * @param prompt - The text description of the image to generate.
 * @returns A base64 encoded string of the generated image.
 */
export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001', // High-quality image generation model
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg', // JPEG is generally smaller
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("فشل إنشاء الصورة. قد يكون الطلب غير متوافق مع سياسات الأمان.");
    }
};

/**
 * Analyzes the user's diary entries for the past week and provides insights.
 * @returns A string containing the analysis and advice.
 */
export const analyzeDiaryEntries = async (): Promise<string> => {
    try {
        const allEntries: { date: string, entries: DiaryEntry[] }[] = [];
        // Get entries for the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const entriesForDate = getDiaryEntries(date);
            if (entriesForDate.length > 0) {
                allEntries.push({ date: date.toLocaleDateString('ar-EG'), entries: entriesForDate });
            }
        }

        if (allEntries.length === 0) {
            return "لا توجد بيانات كافية في يومياتك خلال الأسبوع الماضي لتقديم تحليل. حاول تسجيل أنشطتك اليومية بانتظام!";
        }

        // Format data for the prompt
        const formattedData = allEntries.map(day => 
            `**${day.date}:**\n` + day.entries.map(e => `- ${e.title}: ${e.details}`).join('\n')
        ).join('\n\n');

        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مستشار صحي استباقي. حلل بيانات اليوميات التالية للمستخدم على مدار الأسبوع الماضي. قدم رؤى واضحة حول الأنماط الإيجابية والسلبية، وقدم نصيحتين عمليتين ومخصصتين لتحسين صحته بناءً على البيانات المقدمة فقط.\n\n**بيانات الأسبوع:**\n${formattedData}`;
        
        const response = await callGeminiApi(prompt);
        return response;

    } catch (error) {
        console.error("Error analyzing diary entries:", error);
        throw new Error("فشل تحليل بيانات اليوميات.");
    }
};

/**
 * Generates a proactive morning briefing based on yesterday's diary entries.
 * @returns A string containing the morning briefing.
 */
export const generateMorningBriefing = async (): Promise<string> => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const entries = getDiaryEntries(yesterday);

        if (entries.length === 0) {
            return "**صباح الخير أحمد!** يوم جديد هو فرصة جديدة. لم تسجل أي أنشطة بالأمس، ما رأيك أن تبدأ اليوم بتسجيل وجبة فطور صحية أو نشاط بسيط؟ أتمنى لك يوماً رائعاً!";
        }
        
        const formattedData = entries.map(e => `- ${e.title}: ${e.details}`).join('\n');

        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط وبشكل شخصي وموجز جداً.** أنت "رفيق الحياة الاستباقي" في تطبيق صحتك/كي. حلل بيانات يوم أمس من يوميات المستخدم، وقدم له موجز صباحي ذكي ومحفز. يجب أن يكون الموجز قصيراً وشخصياً.
- ابدأ بـ "**صباح الخير أحمد!**".
- علّق على شيء إيجابي واحد من يوم أمس (إن وجد).
- قدم نصيحة واحدة صغيرة ومؤثرة لليوم بناءً على نشاطه الأخير.
- كن ودوداً ومشجعاً. لا تتجاوز 3 جمل.

**بيانات يوم أمس:**
${formattedData}`;

        const response = await callGeminiApi(prompt);
        return response;
    } catch (error) {
        console.error("Error generating morning briefing:", error);
        return "**صباح الخير أحمد!** أتمنى لك يوماً مليئاً بالصحة والنشاط. تذكر أن كل خطوة صغيرة هي إنجاز بحد ذاتها.";
    }
};

/**
 * Suggests a movie based on yesterday's diary entries.
 * @returns A string containing the movie suggestion.
 */
export const suggestMovieBasedOnDiary = async (): Promise<string> => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const entries = getDiaryEntries(yesterday);

        if (entries.length === 0) {
            return "اسم الفيلم: Forrest Gump\n\nلا توجد بيانات كافية في يومياتك لاقتراح فيلم مخصص. لكن بناءً على أنك تبدأ يوماً جديداً، أقترح عليك فيلم 'Forrest Gump'. إنه فيلم ملهم ومؤثر عن رحلة رجل بسيط القلب عبر أحداث تاريخية عظيمة، يعلمنا أن الحياة مثل علبة الشوكولاتة، لا تعرف أبداً ما ستحصل عليه. مشاهدة ممتعة!";
        }

        const formattedData = entries.map(e => `- ${e.title}: ${e.details}`).join('\n');

        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير سينمائي ومحلل نفسي. بناءً على يوميات المستخدم بالأمس، اقترح فيلماً واحداً يناسب مزاجه أو أنشطته. إذا كانت اليوميات تشير إلى نشاط وحيوية (مثل 'نشاط بدني')، اقترح فيلماً حماسياً أو فيلم أكشن. إذا كانت تشير إلى الاسترخاء أو ملاحظات هادئة، اقترح فيلماً درامياً هادئاً أو كوميدياً خفيفاً.
- قدم ملخصاً للفيلم وسبب اقتراحك له بناءً على اليوميات.
- **مهم جداً:** في بداية ردك، اكتب السطر التالي تماماً وبدون أي إضافات قبله: "اسم الفيلم: [اسم الفيلم هنا]".

**يوميات الأمس:**
${formattedData}`;

        const response = await callGeminiApi(prompt);
        return response;

    } catch (error) {
        console.error("Error suggesting movie:", error);
        throw new Error("فشل في اقتراح فيلم. يرجى المحاولة مرة أخرى.");
    }
};


/**
 * Calls Gemini API with Google Search grounding for up-to-date information.
 * @param query - The user's search query.
 * @returns An object with the text response and grounding source chunks.
 */
export const callGeminiSearchApi = async (query: string): Promise<{ text: string, groundingChunks: GroundingChunk[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: 'أنت مساعد بحث مفيد. لخص النتائج باللغة العربية الفصحى.',
            },
        });
        
        const text = response.text;
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        // Ensure the chunks conform to the GroundingChunk type
        const groundingChunks: GroundingChunk[] = chunks
            .filter((c: any) => c.web && c.web.uri)
            .map((c: any) => ({
                web: {
                    uri: c.web.uri,
                    title: c.web.title || 'مصدر غير معنون',
                }
            }));

        return { text, groundingChunks };
    } catch (error) {
        console.error("Error in Gemini Search API:", error);
        throw new Error("فشل البحث. يرجى المحاولة مرة أخرى.");
    }
};