import { WeatherInfo } from '../types';
import toast from 'react-hot-toast';
import { callGeminiSearchApi } from './geminiService';

const handleWeatherError = (error: any): string => {
    console.error("Weather Service Error:", error);
    if (error.message.includes('geolocation')) {
        return "فشل الوصول للموقع. لا يمكن عرض الطقس.";
    }
    return "فشل جلب معلومات الطقس.";
};

// Simple regex to parse the expected output format
const parseWeatherText = (text: string): Omit<WeatherInfo, 'isDay'> | null => {
    const tempMatch = text.match(/(\d+\.?\d*)\s*°C/);
    const conditionMatch = text.match(/(مشمس|غائم|ممطر|عاصف|ضبابي|مثلج|صاف|غائم جزئياً)/);
    const iconMatch = text.match(/([☀️☁️🌧️🌦️ snowy:❄️ foggy:🌫️ windy:💨🌙])/); // More robust emoji matching

    if (tempMatch && tempMatch[1] && conditionMatch && conditionMatch[1] && iconMatch && iconMatch[1]) {
        return {
            temperature: parseFloat(tempMatch[1]),
            condition: conditionMatch[1],
            icon: iconMatch[1],
        };
    }
    console.warn("Could not parse weather text:", text);
    return null;
}


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
        const prompt = `**مهمتك: الرد باللغة العربية الفصحى فقط.** باستخدام بحث Google المباشر، ما هي حالة الطقس الحالية والدقيقة في الموقع ذي الإحداثيات: خط العرض ${location.latitude} وخط الطول ${location.longitude}؟
        يجب أن يحتوي ردك على درجة الحرارة بالدرجة المئوية، ووصف قصير للحالة باللغة العربية، ورمز تعبيري (emoji) واحد فقط يمثل الحالة.`;
        
        const { text } = await callGeminiSearchApi(prompt, false); // false for useMaps

        const parsedData = parseWeatherText(text);

        if (!parsedData) {
             throw new Error("لم يتمكن الذكاء الاصطناعي من تحليل بيانات الطقس من البحث.");
        }
        
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 19; // 6 AM to 7 PM is considered day

        const weatherInfo: WeatherInfo = {
            ...parsedData,
            isDay: isDay
        };

        return weatherInfo;
    } catch (error) {
        toast.error(handleWeatherError(error));
        return null;
    }
};
