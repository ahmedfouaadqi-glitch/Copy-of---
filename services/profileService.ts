import { UserProfile } from '../types';

const PROFILE_KEY = 'userProfile';
const BIOMETRIC_KEY = 'isBiometricEnabled';

export const saveUserProfile = (profile: UserProfile): void => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
    }
};

export const getUserProfile = (): UserProfile | null => {
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Failed to parse user profile from localStorage", error);
        return null;
    }
};

export const setBiometricEnabled = (enabled: boolean): void => {
    localStorage.setItem(BIOMETRIC_KEY, JSON.stringify(enabled));
};

export const isBiometricEnabled = (): boolean => {
    const stored = localStorage.getItem(BIOMETRIC_KEY);
    return stored ? JSON.parse(stored) : false;
};