import { LucideIcon } from 'lucide-react';

export type PageType = 'home' | 'imageAnalysis' | 'calorieCounter' | 'smartHealth' | 'pharmacy' | 'healthDiary' | 'chat' | 'myPlants' | 'globalSearch' | 'schedule' | 'beauty' | 'decorations';

export type Page =
  | { type: 'home' }
  | { type: 'imageAnalysis' }
  | { type: 'calorieCounter' }
  | { type: 'pharmacy' }
  | { type: 'healthDiary' }
  | { type: 'chat' }
  | { type: 'myPlants' }
  | { type: 'globalSearch' }
  | { type: 'smartHealth', pageType: 'beauty' | 'decorations' | 'schedule' }
  | { type: 'schedule' };


export interface NavigationProps {
  navigateTo: (page: Page) => void;
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

export interface UserPlant {
    id: string;
    name: string;
    image: string;
    addedDate: number;
    careSchedule?: {
        watering: string;
        fertilizing: string;
    };
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface AnalysisHistoryItem {
    id: string;
    timestamp: number;
    images: string[];
    analysisTypeLabel: string;
    result: string;
}