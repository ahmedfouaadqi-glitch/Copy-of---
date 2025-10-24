import { AppHistoryItem, HistoryType } from '../types';

const HISTORY_KEY = 'appHistory';
const MAX_HISTORY_ITEMS = 200; // Overall limit

export const getHistory = (type?: HistoryType): AppHistoryItem[] => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        const allHistory: AppHistoryItem[] = stored ? JSON.parse(stored) : [];
        if (type) {
            return allHistory.filter(item => item.type === type);
        }
        return allHistory;
    } catch (error) {
        console.error("Failed to parse app history from localStorage", error);
        return [];
    }
};

export const addHistoryItem = (itemData: Omit<AppHistoryItem, 'id' | 'timestamp'>): AppHistoryItem => {
    const allHistory = getHistory();
    const newItem: AppHistoryItem = {
        ...itemData,
        id: `${itemData.type}-${Date.now()}`,
        timestamp: Date.now()
    };
    
    const updatedHistory = [newItem, ...allHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return newItem;
};

export const clearHistory = (type?: HistoryType): void => {
     if (type) {
        const allHistory = getHistory();
        const updatedHistory = allHistory.filter(item => item.type !== type);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } else {
        localStorage.removeItem(HISTORY_KEY);
    }
};
