import { GoogleGenAI, Modality, Part } from '@google/genai';
import { ChatMessage, GroundingChunk, DiaryEntry } from '../types';
import { getDiaryEntries } from './diaryService';

// Initialize the GoogleGenAI client. The API key is sourced from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * A general-purpose function to call the Gemini API for content generation.
 * Handles both text-only and multimodal (text + image) prompts.
 */
export const callGeminiApi = async (prompt: string, images?: { mimeType: string; data: string }[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let requestContents: any = prompt;

    if (images && images.length > 0) {
      const textPart = { text: prompt };
      const imageParts = images.map(img => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      }));
      // For multimodal prompts, the text and images should be in the same parts array.
      requestContents = { parts: [textPart, ...imageParts] };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: requestContents,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error('فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Handles chat conversations with the Gemini API.
 * It takes the entire chat history and a system instruction.
 */
export const callGeminiChatApi = async (history: ChatMessage[], systemInstruction: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';

    // Convert the app's ChatMessage format to the API's Content format.
    const contents = history.map(msg => {
      const parts: Part[] = [{ text: msg.content }];
      if (msg.imageUrl) {
        parts.push({
          inlineData: {
            mimeType: msg.imageUrl.match(/data:(.*);base64,/)?.[1] || 'image/jpeg',
            data: msg.imageUrl.split(',')[1],
          },
        });
      }
      return { role: msg.role, parts };
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Chat API call failed:', error);
    throw new Error('فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Generates an image using the Imagen model based on a text prompt.
 */
export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error('لم يتم إنشاء أي صورة.');
        }
    } catch (error) {
        console.error('Image generation failed:', error);
        throw new Error('فشل إنشاء الصورة. يرجى المحاولة مرة أخرى.');
    }
};

// FIX: Added generateSpeech function to handle text-to-speech generation.
/**
 * Generates speech from text using the TTS model.
 * Returns a base64 encoded audio string.
 */
export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Same voice as in modal
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error('No audio data received from API.');
        }
        return base64Audio;
    } catch (error) {
        console.error('Speech generation failed:', error);
        throw new Error('فشل إنشاء الكلام. يرجى المحاولة مرة أخرى.');
    }
};

// FIX: Added analyzeCaloriesForVoice function to handle voice-based calorie analysis.
/**
 * Analyzes the calories for a given food item for voice responses.
 */
export const analyzeCaloriesForVoice = async (foodName: string): Promise<string> => {
    const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تغذية. قدم تحليلاً موجزاً جداً للسعرات الحرارية في "${foodName}". اذكر الرقم التقريبي للسعرات الحرارية ومعلومة صحية واحدة سريعة. كن مختصراً ومباشراً.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Calorie analysis for voice failed:', error);
        return `عذراً، لم أتمكن من تحليل السعرات الحرارية لـ ${foodName} حالياً.`;
    }
};

/**
 * Calls the Gemini API with Google Search grounding enabled.
 * Returns the generated text and a list of web sources.
 */
export const callGeminiSearchApi = async (prompt: string): Promise<{ text: string; groundingChunks: GroundingChunk[] }> => {
    const trimmedPrompt = prompt.trim();

    // Specific name check should come first.
    if (trimmedPrompt.includes('احمد معروف') || trimmedPrompt.includes('أحمد معروف')) {
        const ahmedBio = `أهلاً بك، يبدو أنك تبحث عن **أحمد معروف**.

أحمد معروف هو صاحب الفكرة والمالك لتطبيق **"صحتك/كي (AiHealthQ)"**.

هو خبير متخصص في مجال التكنولوجيا المالية (FinTech)، حيث يمتلك رؤية عميقة في كيفية تسخير التكنولوجيا لتبسيط الخدمات وجعلها في متناول الجميع. من خلال خبرته، استلهم فكرة إنشاء تطبيق "صحتك/كي" ليطبق نفس المبادئ في قطاع الصحة والحياة، بهدف تمكين الأفراد من إدارة حياتهم الصحية بذكاء وسهولة عبر حلول تقنية مبتكرة.`;
        return { text: ahmedBio, groundingChunks: [] };
    }

    const appNameRegex = /صحتك[\s/\\-]*كي|aihealthq/i;
    if (appNameRegex.test(trimmedPrompt)) {
        const appDescription = `
أهلاً بك! أنا **صحتك/كي (AiHealthQ)**، تطبيق الحياة والصحة ورفيقك الرقمي.

**مهمتي:** هي تمكينك من عيش حياة أكثر صحة وسعادة من خلال توفير أدوات ذكية وسهولة الاستخدام. أنا هنا لأكون مستشارك الشخصي في مختلف جوانب حياتك.

**ماذا أقدم؟**
*   **الكاميرا الذكية:** لتحليل الطعام، النباتات، الأدوية، وحالة البشرة.
*   **مركز المستشار الشخصي:** للحصول على نصائح مخصصة في الجمال، الموضة، والديكور.
*   **مستشار الطهي:** لابتكار وصفات صحية وحساب سعراتها الحرارية.
*   **الصيدلية المنزلية:** للتعرف على معلومات الأدوية.
*   **يومياتي:** لتسجيل وتتبع أهدافك الصحية.
*   **البحث الشامل:** للإجابة على أي سؤال لديك بالاعتماد على أحدث المعلومات.

أنا هنا لأجعل رحلتك نحو حياة أفضل أسهل وأكثر متعة. كيف يمكنني مساعدتك اليوم؟

---
*صاحب الفكرة والمالك: **أحمد معروف***`;
        return { text: appDescription, groundingChunks: [] };
    }
    
    try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model: model,
            contents: `**مهمتك: الرد باللغة العربية الفصحى فقط.** ${prompt}`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
        
        return { text, groundingChunks };
    } catch (error) {
        console.error('Gemini Search API call failed:', error);
        throw new Error('فشل البحث. يرجى المحاولة مرة أخرى.');
    }
};

/**
 * Analyzes the user's diary entries for the past week and provides insights.
 */
export const analyzeDiaryEntries = async (): Promise<string> => {
    let allEntries: { date: string, entries: DiaryEntry[] }[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const entries = getDiaryEntries(date);
        if (entries.length > 0) {
            allEntries.push({ date: date.toLocaleDateString('ar-EG'), entries });
        }
    }

    if (allEntries.length === 0) {
        return "لم أجد أي إدخالات في يومياتك خلال الأسبوع الماضي. حاول تسجيل أنشطتك اليومية أولاً!";
    }

    const formattedEntries = allEntries.map(day => 
        `**${day.date}:**\n${day.entries.map(e => `- ${e.title}: ${e.details}`).join('\n')}`
    ).join('\n\n');

    const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مستشار صحي ذكي ومحفز. حلل بيانات يوميات المستخدم التالية للأسبوع الماضي.
    
    **البيانات:**
    ${formattedEntries}
    
    **المطلوب:**
    1.  قدم للمستخدم **3 ملاحظات بناءة وموجزة** حول أنماطه (مثال: انتظام في شرب الماء، قلة النشاط في أيام معينة).
    2.  قدم **نصيحة واحدة قابلة للتنفيذ** يمكنه تطبيقها في الأسبوع القادم لتحسين نمط حياته.
    3.  أنهِ ردك بعبارة تشجيعية.
    
    كن إيجابياً وداعماً في أسلوبك.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Diary analysis failed:', error);
        throw new Error('فشل تحليل بيانات اليوميات. يرجى المحاولة مرة أخرى.');
    }
};