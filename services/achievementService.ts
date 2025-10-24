// FIX: Import React to use React.createElement for the custom toast.
import React from 'react';
import { Achievement, Badge } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';
import toast from 'react-hot-toast';
import { getDiaryEntries } from './diaryService';

const ACHIEVEMENTS_KEY = 'userAchievements';

export const getEarnedAchievements = (): Achievement[] => {
    try {
        const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse achievements from localStorage", error);
        return [];
    }
};

const awardAchievement = (badge: Badge) => {
    const earned = getEarnedAchievements();
    if (earned.some(a => a.badgeId === badge.id)) {
        return; // Already earned
    }

    const newAchievement: Achievement = {
        badgeId: badge.id,
        earnedDate: Date.now(),
    };

    const updatedAchievements = [...earned, newAchievement];
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements));

    // Show a toast notification
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    toast.custom((t) => (
        React.createElement('div', {
            className: `${
            t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`
        },
        React.createElement('div', { className: 'flex-1 w-0 p-4' },
            React.createElement('div', { className: 'flex items-start' },
                React.createElement('div', { className: 'flex-shrink-0 pt-0.5 text-3xl' },
                    React.createElement('span', null, badge.icon)
                ),
                React.createElement('div', { className: 'ml-3 flex-1' },
                    React.createElement('p', { className: 'text-sm font-bold text-gray-900 dark:text-gray-100' },
                        `إنجاز جديد: ${badge.title}!`
                    ),
                    React.createElement('p', { className: 'mt-1 text-sm text-gray-500 dark:text-gray-400' },
                        badge.description
                    )
                )
            )
        ))
    ), { duration: 4000 });
};

export const checkAndAwardAchievements = () => {
    const earned = getEarnedAchievements();
    const diaryEntryCount = (() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('healthDiary-'));
        return keys.reduce((acc, key) => acc + (JSON.parse(localStorage.getItem(key)!) as any[]).length, 0);
    })();
    const featureUsageStats = JSON.parse(localStorage.getItem('featureUsageStats') || '{}');
    const usedFeaturesCount = Object.keys(featureUsageStats).length;

    ACHIEVEMENTS_LIST.forEach(badge => {
        if (earned.some(a => a.badgeId === badge.id)) {
            return;
        }

        let conditionMet = false;
        switch (badge.criteria.type) {
            case 'diary_entry_count':
                if (diaryEntryCount >= (badge.criteria.value as number)) {
                    conditionMet = true;
                }
                break;
            case 'feature_usage':
                 if (typeof badge.criteria.value === 'number') {
                    if (usedFeaturesCount >= badge.criteria.value) {
                        conditionMet = true;
                    }
                } else {
                    if (featureUsageStats[badge.criteria.value as string]) {
                        conditionMet = true;
                    }
                }
                break;
            case 'challenge_completed':
                const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
                if (completedChallenges.length >= (badge.criteria.value as number)) {
                    conditionMet = true;
                }
                break;
        }

        if (conditionMet) {
            awardAchievement(badge);
        }
    });
};
