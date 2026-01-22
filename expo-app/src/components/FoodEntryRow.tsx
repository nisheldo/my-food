import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry, MealTypeInfo } from '../types';

interface Props {
  entry: FoodEntry;
  onPress: () => void;
}

export function FoodEntryRow({ entry, onPress }: Props) {
  const mealInfo = MealTypeInfo[entry.mealType];
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={mealInfo.icon as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{entry.name}</Text>
        {entry.calories !== undefined && (
          <Text style={styles.calories}>{entry.calories} cal</Text>
        )}
      </View>
      <Text style={styles.time}>{time}</Text>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    color: '#000',
  },
  calories: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  time: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
});
