import { InspirationItem } from '../types';

const INSPIRATIONS_KEY = 'communityInspirations';
const MAX_INSPIRATIONS = 100;

export const getInspirations = (): InspirationItem[] => {
    try {
        const stored = localStorage.getItem(INSPIRATIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse inspirations from localStorage", error);
        return [];
    }
};

export const addInspiration = (itemData: Omit<InspirationItem, 'id' | 'timestamp' | 'sourceUser'>): InspirationItem => {
    const inspirations = getInspirations();
    
    // Simple anonymous user naming
    const userNumber = (parseInt(localStorage.getItem('userCount') || '100')) + inspirations.length;
    const anonymousUser = `مستخدم${userNumber}`;

    const newItem: InspirationItem = {
        ...itemData,
        id: `inspiration-${Date.now()}`,
        timestamp: Date.now(),
        sourceUser: anonymousUser
    };
    
    const updatedInspirations = [newItem, ...inspirations].slice(0, MAX_INSPIRATIONS);
    localStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(updatedInspirations));
    return newItem;
};
