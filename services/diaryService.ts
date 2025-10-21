import { DiaryEntry } from '../types';

const DIARY_KEY_PREFIX = 'healthDiary-';

const getFormattedDate = (date: Date): string => {
    // Ensures the date is treated as local time, not UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDiaryEntries = (date: Date): DiaryEntry[] => {
    try {
        const key = DIARY_KEY_PREFIX + getFormattedDate(date);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse diary entries from localStorage", error);
        return [];
    }
};

export const addDiaryEntry = (date: Date, newEntryData: Omit<DiaryEntry, 'id' | 'timestamp'>): DiaryEntry => {
    const entries = getDiaryEntries(date);
    const entry: DiaryEntry = {
        ...newEntryData,
        id: `entry-${Date.now()}`,
        timestamp: Date.now()
    };
    const updatedEntries = [entry, ...entries];
    const key = DIARY_KEY_PREFIX + getFormattedDate(date);
    localStorage.setItem(key, JSON.stringify(updatedEntries));
    return entry;
};

export const deleteDiaryEntry = (date: Date, entryId: string): DiaryEntry[] => {
    let entries = getDiaryEntries(date);
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    const key = DIARY_KEY_PREFIX + getFormattedDate(date);
    localStorage.setItem(key, JSON.stringify(updatedEntries));
    return updatedEntries;
};