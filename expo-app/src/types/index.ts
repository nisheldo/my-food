export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  mealType: MealType;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes: string;
  timestamp: string; // ISO string
}

export const MealTypeInfo: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: 'sunny' },
  lunch: { label: 'Lunch', icon: 'sunny' },
  dinner: { label: 'Dinner', icon: 'moon' },
  snack: { label: 'Snack', icon: 'leaf' },
};

export const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
