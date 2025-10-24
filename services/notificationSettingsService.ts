import { NotificationSettings } from '../types';

const SETTINGS_KEY = 'notificationSettings';

const DEFAULT_SETTINGS: NotificationSettings = {
    morningBriefing: true,
    proactiveInsights: true,
    challengeReminders: true,
    dailyReward: true,
    diaryReminders: true,
};

export const getNotificationSettings = (): NotificationSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        const savedSettings = stored ? JSON.parse(stored) : {};
        // Merge with defaults to ensure all keys are present
        return { ...DEFAULT_SETTINGS, ...savedSettings };
    } catch (error) {
        console.error("Failed to parse notification settings from localStorage", error);
        return DEFAULT_SETTINGS;
    }
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save notification settings to localStorage", error);
    }
};
