import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry, MealTypeInfo, mealTypes, MealType } from '../types';
import { getAllEntries, getTodayEntries, deleteEntry } from '../storage/foodStorage';
import { FoodEntryRow } from '../components/FoodEntryRow';
import { SummaryCard } from '../components/SummaryCard';

export function TodayScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    const all = await getAllEntries();
    const today = getTodayEntries(all);
    today.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setEntries(today);
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

  const sections = mealTypes
    .map((type) => ({
      title: MealTypeInfo[type].label,
      data: entries.filter((e) => e.mealType === type),
    }))
    .filter((section) => section.data.length > 0);

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.summaryRow}>
        <SummaryCard title="Calories" value={`${totalCalories}`} icon="flame" color="#FF9500" />
        <SummaryCard title="Protein" value={`${totalProtein.toFixed(0)}g`} icon="leaf" color="#34C759" />
        <SummaryCard title="Carbs" value={`${totalCarbs.toFixed(0)}g`} icon="grid" color="#007AFF" />
        <SummaryCard title="Fat" value={`${totalFat.toFixed(0)}g`} icon="water" color="#FFCC00" />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Food Logged Today</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to add your first meal</Text>
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
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        ListHeaderComponent={entries.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={entries.length === 0 ? styles.emptyList : undefined}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddFood')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
