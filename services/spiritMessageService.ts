import { SpiritMessage, SpiritMessageType, UserProfile, DiaryEntry } from '../types';
import { getSpiritMessageFromGemini } from './geminiService';
import { getDiaryEntries } from './diaryService';

const MESSAGE_KEY = 'dailySpiritMessage';

interface StoredMessage {
    date: string; // YYYY-MM-DD
    message: SpiritMessage;
}

const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Check for local, contextual alerts before fetching from API
const getLocalAlert = (): SpiritMessage | null => {
    const hour = new Date().getHours();
    const today = new Date();
    
    // Alert for breakfast between 7 AM and 10 AM if not logged
    if (hour >= 7 && hour < 10) {
        const todaysEntries = getDiaryEntries(today);
        const hasLoggedBreakfast = todaysEntries.some(e => e.type === 'food' && e.title.toLowerCase().includes('فطور'));
        if (!hasLoggedBreakfast) {
            return {
                type: 'alert',
                content: 'لا تنسَ تسجيل وجبة فطورك لبدء يومك بطاقة ونشاط!'
            };
        }
    }
    
    // More local alerts can be added here
    
    return null;
}


export const getDailySpiritMessage = async (userProfile: UserProfile): Promise<SpiritMessage | null> => {
    const localAlert = getLocalAlert();
    if (localAlert) {
        return localAlert;
    }

    const todayStr = getFormattedDate(new Date());
    const stored = localStorage.getItem(MESSAGE_KEY);

    if (stored) {
        try {
            const storedMessage: StoredMessage = JSON.parse(stored);
            if (storedMessage.date === todayStr) {
                return storedMessage.message; // Return cached message for today
            }
        } catch (error) {
            console.error("Failed to parse stored spirit message", error);
        }
    }

    // If no message for today, fetch a new one
    try {
        const messageTypes: SpiritMessageType[] = ['tip', 'joke', 'hint'];
        const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
        
        const content = await getSpiritMessageFromGemini(randomType, userProfile.mainGoal);

        if (content) {
            const newMessage: SpiritMessage = { type: randomType, content };
            const newStoredMessage: StoredMessage = { date: todayStr, message: newMessage };
            localStorage.setItem(MESSAGE_KEY, JSON.stringify(newStoredMessage));
            return newMessage;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch daily spirit message", error);
        return {
            type: 'tip',
            content: "تذكر أن كل خطوة صغيرة هي إنجاز بحد ذاتها. استمر في التقدم!"
        }; // Return a default fallback message
    }
};