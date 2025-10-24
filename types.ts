import { LucideIcon } from 'lucide-react';

export type PageType = 'home' | 'imageAnalysis' | 'calorieCounter' | 'smartHealth' | 'pharmacy' | 'healthDiary' | 'chat' | 'myPlants' | 'globalSearch' | 'schedule' | 'beauty' | 'decorations' | 'sportsTrainer' | 'gaming' | 'financial' | 'auto' | 'shoppingList' | 'challenges' | 'communityInspirations' | 'dietPlan' | 'favoriteMovies' | 'imageEditing' | 'videoAnalysis' | 'videoGeneration' | 'liveConversation' | 'transcription';

export type Page =
  | { type: 'home' }
  | { type: 'imageAnalysis' }
  | { type: 'calorieCounter' }
  | { type: 'pharmacy' }
  | { type: 'healthDiary' }
  | { type: 'chat' }
  | { type: 'myPlants' }
  | { type: 'globalSearch' }
  | { type: 'smartHealth', pageType: 'beauty' | 'decorations' | 'schedule' | 'gaming' | 'financial' | 'auto' }
  | { type: 'sportsTrainer' }
  | { type: 'shoppingList' }
  | { type: 'challenges' }
  | { type: 'communityInspirations' }
  | { type: 'dietPlan' }
  | { type: 'favoriteMovies' }
  | { type: 'imageEditing' }
  | { type: 'videoAnalysis' }
  | { type: 'videoGeneration' }
  | { type: 'liveConversation' }
  | { type: 'transcription' };


export interface NavigationProps {
  navigateTo: (page: Page) => void;
}

export interface UserProfile {
    name: string;
    age: number;
    weight: number;
    profession: string;
    mainGoal: string;
}

export interface Feature {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  page: Page;
  pageType: PageType;
}

export interface AnalysisData {
  analysisType: 'food' | 'plant_id' | 'medication' | 'skin' | 'general';
  image?: string;
  images?: string[];
  text?: string;
  analysisDetails?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    imageUrl?: string | null;
}

export interface DiaryEntry {
    id: string;
    timestamp: number;
    type: 'food' | 'activity' | 'medication' | 'note' | 'plant_care';
    icon: string;
    title: string;
    details: string;
}

export interface QuickAddAction {
    id: string;
    icon: string;
    label: string;
    type: DiaryEntry['type'];
    title: string;
    details: string;
}

export interface PlantJournalEntry {
    id: string;
    timestamp: number;
    photo: string;
    note: string;
}

export interface UserPlant {
    id: string;
    name: string;
    image: string;
    addedDate: number;
    careSchedule?: {
        watering: string;
        fertilizing: string;
    };
    journal?: PlantJournalEntry[];
}

export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources: {
            reviewSnippets: {
                uri: string;
                text: string;
            }[];
        }[];
    };
}


export interface AnalysisHistoryItem {
    id: string;
    timestamp: number;
    images: string[];
    analysisTypeLabel: string;
    result: string;
}

export interface WorkoutExercise {
    name: string;
    sets: string;
    reps: string;
    description: string;
}

export interface WorkoutDay {
    day: string;
    focus: string;
    exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
    weeklyPlan: WorkoutDay[];
}

export interface VisualFoodAnalysis {
    foodName: string;
    estimatedWeight: number;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    advice: string;
}

export interface ShoppingListItem {
    id: string;
    name: string;
    relatedFeature: PageType;
    isChecked: boolean;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    goal: number; // e.g., 7 for 7 days
    unit: string; // e.g., 'days'
    relatedDiaryType: DiaryEntry['type'];
    relatedDiaryTitle?: string; // e.g., 'شرب الماء'
}

export interface UserChallenge extends Challenge {
    startDate: number;
    progress: number;
}

export interface InspirationItem {
    id: string;
    timestamp: number;
    type: 'recipe' | 'workout';
    title: string;
    content: string | WorkoutPlan; // Can be markdown for recipe or a WorkoutPlan object
    sourceUser: string; // Anonymous user name
}

export interface DietMeal {
    meal: string;
    description: string;
    calories: number;
}

export interface DietDay {
    day: string;
    meals: DietMeal[];
    dailyTotalCalories: number;
    dailyTip: string;
}

export interface DietPlan {
    planTitle: string;
    dailyPlan: DietDay[];
}

export interface FavoriteMovie {
    id: string;
    title: string;
    details: string;
    addedDate: number;
}