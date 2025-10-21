import { ShoppingListItem } from '../types';

const SHOPPING_LIST_KEY = 'shoppingList';

export const getShoppingList = (): ShoppingListItem[] => {
    try {
        const stored = localStorage.getItem(SHOPPING_LIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse shopping list from localStorage", error);
        return [];
    }
};

export const saveShoppingList = (items: ShoppingListItem[]): void => {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
};

export const addItemToShoppingList = (newItem: ShoppingListItem): void => {
    const items = getShoppingList();
    // Prevent duplicates
    if (!items.some(item => item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase())) {
        const updatedList = [newItem, ...items];
        saveShoppingList(updatedList);
    }
};

export const updateShoppingListItem = (itemId: string, updates: Partial<ShoppingListItem>): void => {
    const items = getShoppingList();
    const updatedList = items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
    );
    saveShoppingList(updatedList);
};

export const deleteShoppingListItem = (itemId: string): void => {
    const items = getShoppingList();
    const updatedList = items.filter(item => item.id !== itemId);
    saveShoppingList(updatedList);
};

export const clearCheckedItems = (): void => {
    const items = getShoppingList();
    const updatedList = items.filter(item => !item.isChecked);
    saveShoppingList(updatedList);
};