import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  title: string;
  calories: number;
  onPress: () => void;
}

export function QuickAddButton({ title, calories, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.calories}>{calories} cal</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  calories: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});
