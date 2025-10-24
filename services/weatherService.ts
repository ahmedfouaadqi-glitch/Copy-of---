import { GoogleGenAI, Type } from "@google/genai";
import { WeatherInfo } from '../types';
import toast from 'react-hot-toast';

const weatherSchema = {
    type: Type.OBJECT,
    properties: {
        temperature: { type: Type.NUMBER, description: "درجة الحرارة الحالية بالدرجة المئوية." },
        condition: { type: Type.STRING, description: "وصف موجز لحالة الطقس (مثال: مشمس, غائم جزئياً)." },
        icon: { type: Type.STRING, description: "رمز تعبيري (emoji) واحد فقط يمثل حالة الطقس (مثال: ☀️, ☁️, 🌦️)." },
    },
    required: ["temperature", "condition", "icon"],
};

const handleWeatherError = (error: any): string => {
    console.error("Weather Service Error:", error);
    if (error.message.includes('geolocation')) {
        return "فشل الوصول للموقع. لا يمكن عرض الطقس.";
    }
    return "فشل جلب معلومات الطقس.";
};

export const getWeatherInfo = async (): Promise<WeatherInfo | null> => {
    let location: { latitude: number; longitude: number; };

    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
    } catch (geoError) {
        toast.error("فشل الوصول للموقع. يرجى تفعيل خدمة الموقع لعرض الطقس.");
        console.error("Geolocation error:", geoError);
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير أرصاد جوية. بناءً على إحداثيات الموقع التالية: خط العرض ${location.latitude} وخط الطول ${location.longitude}, قدم حالة الطقس الحالية بتنسيق JSON.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: weatherSchema,
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(cleanedJsonText) as WeatherInfo;
    } catch (error) {
        toast.error(handleWeatherError(error));
        return null;
    }
};
