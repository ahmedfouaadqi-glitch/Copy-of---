import { SpiritMessage, SpiritMessageType, UserProfile, DiaryEntry } from '../types';
import { getSpiritMessageFromGemini } from './geminiService';
import { getDiaryEntries } from './diaryService';
import { FEATURES } from '../constants';
import { getNotificationSettings } from './notificationSettingsService';

const MESSAGE_KEY = 'dailySpiritMessage';
const USAGE_STATS_KEY = 'featureUsageStats';

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
    const settings = getNotificationSettings();
    if (!settings.diaryReminders) {
        return null;
    }

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
        let messageType: SpiritMessageType;
        let context: string | undefined;

        // Smart Hint Logic
        const usageStats = JSON.parse(localStorage.getItem(USAGE_STATS_KEY) || '{}');
        const allFeaturePageTypes = FEATURES.map(f => f.pageType);
        const usedFeaturePageTypes = Object.keys(usageStats);
        const unusedFeatures = FEATURES.filter(f => !usedFeaturePageTypes.includes(f.pageType) && !['home', 'chat', 'imageAnalysis', 'globalSearch', 'healthDiary'].includes(f.pageType));

        if (unusedFeatures.length > 0) {
            // Prioritize showing hints for unused features
            messageType = 'hint';
            const randomUnusedFeature = unusedFeatures[Math.floor(Math.random() * unusedFeatures.length)];
            context = randomUnusedFeature.title;
        } else {
            // If all features used, choose randomly between tip, joke, or a "pro tip" hint
            const messageTypes: SpiritMessageType[] = ['tip', 'joke', 'hint'];
            messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];

            if (messageType === 'hint') {
                // Generate a pro tip for the most used feature
                const mostUsed = Object.entries(usageStats).sort(([,a],[,b]) => (b as any).count - (a as any).count)[0];
                const mostUsedFeature = FEATURES.find(f => f.pageType === mostUsed[0]);
                context = `نصيحة متقدمة حول ميزة "${mostUsedFeature?.title || 'مفضلتك'}"`;
            } else { // tip or joke
                context = undefined;
            }
        }
        
        const content = await getSpiritMessageFromGemini(messageType, userProfile, context);

        if (content) {
            const newMessage: SpiritMessage = { type: messageType, content };
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
