import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry } from '../types';
import { getAllEntries, getWeekEntries, groupEntriesByDay } from '../storage/foodStorage';
import { FoodEntryRow } from '../components/FoodEntryRow';

export function WeeklyScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    const all = await getAllEntries();
    const week = getWeekEntries(all);
    week.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setEntries(week);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
  const totalFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);

  const groupedByDay = groupEntriesByDay(entries);
  const sortedDays = Array.from(groupedByDay.keys()).sort((a, b) => b.localeCompare(a));
  const daysWithEntries = sortedDays.length;
  const avgCalories = daysWithEntries > 0 ? Math.round(totalCalories / daysWithEntries) : 0;

  const sections = sortedDays.map((dateKey) => {
    const dayEntries = groupedByDay.get(dateKey)!;
    const date = new Date(dateKey);
    const dayCalories = dayEntries.reduce((sum, e) => sum + (e.calories || 0), 0);

    return {
      title: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      calories: dayCalories,
      data: dayEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  });

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Weekly Summary</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Calories</Text>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{totalCalories}</Text>
          <Text style={styles.statSubtext}>avg {avgCalories}/day</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Meals Logged</Text>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{entries.length}</Text>
          <Text style={styles.statSubtext}>this week</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#34C759' }]}>{totalProtein.toFixed(0)}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#007AFF' }]}>{totalCarbs.toFixed(0)}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#FFCC00' }]}>{totalFat.toFixed(0)}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Food This Week</Text>
      <Text style={styles.emptySubtitle}>Start logging your meals to see your weekly summary</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodEntryRow
            entry={item}
            onPress={() => navigation.navigate('FoodDetail', { entry: item })}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
            <Text style={styles.sectionHeaderCalories}>{section.calories} cal</Text>
          </View>
        )}
        ListHeaderComponent={entries.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={entries.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  statSubtext: {
    fontSize: 13,
    color: '#8E8E93',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginVertical: 16,
  },
  macrosRow: {
    flexDirection: 'row',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  sectionHeaderCalories: {
    fontSize: 13,
    color: '#8E8E93',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
