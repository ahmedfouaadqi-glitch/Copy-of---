import { AnalysisHistoryItem } from '../types';

const HISTORY_KEY = 'analysisHistory';
const MAX_HISTORY_ITEMS = 50;

export const getAnalysisHistory = (): AnalysisHistoryItem[] => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse analysis history from localStorage", error);
        return [];
    }
};

export const addAnalysisToHistory = (itemData: Omit<AnalysisHistoryItem, 'id' | 'timestamp'>): AnalysisHistoryItem => {
    const history = getAnalysisHistory();
    const newItem: AnalysisHistoryItem = {
        ...itemData,
        id: `analysis-${Date.now()}`,
        timestamp: Date.now()
    };
    
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return newItem;
};

export const deleteAnalysisHistoryItem = (id: string): void => {
    let history = getAnalysisHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const clearAnalysisHistory = (): void => {
    localStorage.removeItem(HISTORY_KEY);
};