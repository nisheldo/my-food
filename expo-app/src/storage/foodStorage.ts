import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry } from '../types';

const STORAGE_KEY = '@food_entries';

export async function getAllEntries(): Promise<FoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
}

export async function saveEntry(entry: FoodEntry): Promise<void> {
  try {
    const entries = await getAllEntries();
    entries.push(entry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
}

export async function updateEntry(updatedEntry: FoodEntry): Promise<void> {
  try {
    const entries = await getAllEntries();
    const index = entries.findIndex((e) => e.id === updatedEntry.id);
    if (index !== -1) {
      entries[index] = updatedEntry;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating entry:', error);
  }
}

export async function deleteEntry(id: string): Promise<void> {
  try {
    const entries = await getAllEntries();
    const filtered = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
}

export function getTodayEntries(entries: FoodEntry[]): FoodEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
}

export function getWeekEntries(entries: FoodEntry[]): FoodEntry[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startOfWeek;
  });
}

export function groupEntriesByDay(entries: FoodEntry[]): Map<string, FoodEntry[]> {
  const grouped = new Map<string, FoodEntry[]>();

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const key = date.toISOString().split('T')[0];

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entry);
  });

  return grouped;
}
