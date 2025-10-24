import { UserProfile } from '../types';

const PROFILE_KEY = 'userProfile';
const BIOMETRIC_CREDENTIAL_ID_KEY = 'biometricCredentialId';

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))));
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


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

export const saveBiometricCredential = (credentialId: ArrayBuffer): void => {
    const credentialIdBase64 = bufferToBase64(credentialId);
    localStorage.setItem(BIOMETRIC_CREDENTIAL_ID_KEY, credentialIdBase64);
};

export const getBiometricCredentialId = (): string | null => {
    return localStorage.getItem(BIOMETRIC_CREDENTIAL_ID_KEY);
};

export const clearBiometricCredential = (): void => {
    localStorage.removeItem(BIOMETRIC_CREDENTIAL_ID_KEY);
};