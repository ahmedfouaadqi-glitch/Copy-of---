import { UserChallenge } from '../types';

const USER_CHALLENGES_KEY = 'userActiveChallenges';

export const getActiveChallenges = (): UserChallenge[] => {
    try {
        const stored = localStorage.getItem(USER_CHALLENGES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse active challenges", error);
        return [];
    }
};
