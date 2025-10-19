import { QuickAddAction } from '../types';
import { addDiaryEntry } from './diaryService';

const QUICK_ADD_KEY = 'quickAddActions';

const DEFAULT_ACTIONS: QuickAddAction[] = [
  { id: 'water', icon: '💧', label: 'شرب الماء', type: 'note', title: 'شرب الماء', details: 'تم شرب كوب من الماء.' },
  { id: 'walk', icon: '🚶', label: 'مشي 15 د', type: 'activity', title: 'نشاط بدني', details: 'مشي لمدة 15 دقيقة.' },
  { id: 'meditate', icon: '🧘', label: 'تأمل 5 د', type: 'activity', title: 'استرخاء', details: 'جلسة تأمل لمدة 5 دقائق.' },
  { id: 'apple', icon: '🍎', label: 'تفاحة', type: 'food', title: 'وجبة خفيفة', details: 'تفاحة (حوالي 95 سعرة حرارية).' },
];

export const getQuickAddActions = (): QuickAddAction[] => {
    try {
        const stored = localStorage.getItem(QUICK_ADD_KEY);
        if (stored) {
            return JSON.parse(stored);
        } else {
            localStorage.setItem(QUICK_ADD_KEY, JSON.stringify(DEFAULT_ACTIONS));
            return DEFAULT_ACTIONS;
        }
    } catch (error) {
        console.error("Failed to parse quick add actions", error);
        return DEFAULT_ACTIONS;
    }
};

export const saveQuickAddActions = (actions: QuickAddAction[]): void => {
    localStorage.setItem(QUICK_ADD_KEY, JSON.stringify(actions));
};


export const performQuickAdd = (item: QuickAddAction) => {
  addDiaryEntry(new Date(), {
    type: item.type,
    icon: item.icon,
    title: item.title,
    details: item.details,
  });
};