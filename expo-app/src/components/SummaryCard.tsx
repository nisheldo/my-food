import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export function SummaryCard({ title, value, icon, color }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
    color: '#000',
  },
  title: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});
