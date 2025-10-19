import { UserPlant } from '../types';
import { addDiaryEntry } from './diaryService';

const PLANTS_KEY = 'userPlantsCollection';

export const getPlants = (): UserPlant[] => {
    try {
        const stored = localStorage.getItem(PLANTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse user plants from localStorage", error);
        return [];
    }
};

export const addPlant = (newPlant: Omit<UserPlant, 'id'>): UserPlant => {
    const plants = getPlants();
    const plant: UserPlant = {
        ...newPlant,
        id: `plant-${Date.now()}`
    };
    const updatedPlants = [plant, ...plants];
    localStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
    
    // Automatically create care schedule entries in the diary
    if (plant.careSchedule) {
        const today = new Date();
        addDiaryEntry(today, {
            type: 'plant_care',
            icon: '💧',
            title: `جدول ري جديد لـ ${plant.name}`,
            details: `الري: ${plant.careSchedule.watering}`
        });
         addDiaryEntry(today, {
            type: 'plant_care',
            icon: '🌱',
            title: `جدول تسميد جديد لـ ${plant.name}`,
            details: `التسميد: ${plant.careSchedule.fertilizing}`
        });
    }

    return plant;
};

export const deletePlant = (plantId: string): UserPlant[] => {
    let plants = getPlants();
    const updatedPlants = plants.filter(plant => plant.id !== plantId);
    localStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
    return updatedPlants;
};