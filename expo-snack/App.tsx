import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ScrollView, Modal, Alert, SafeAreaView, SectionList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Types
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
interface FoodEntry {
  id: string;
  name: string;
  mealType: MealType;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes: string;
  timestamp: string;
}

const MealInfo: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: 'sunny' },
  lunch: { label: 'Lunch', icon: 'partly-sunny' },
  dinner: { label: 'Dinner', icon: 'moon' },
  snack: { label: 'Snack', icon: 'leaf' },
};

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const STORAGE_KEY = '@food_entries';

// Storage functions
const loadEntries = async (): Promise<FoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveEntries = async (entries: FoodEntry[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// Main App
export default function App() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);

  useEffect(() => {
    loadEntries().then(setEntries);
  }, []);

  const addEntry = async (entry: FoodEntry) => {
    const updated = [...entries, entry];
    setEntries(updated);
    await saveEntries(updated);
  };

  const deleteEntry = async (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    await saveEntries(updated);
    setSelectedEntry(null);
  };

  const todayEntries = entries.filter(e => {
    const today = new Date().toDateString();
    return new Date(e.timestamp).toDateString() === today;
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = entries.filter(e => new Date(e.timestamp) >= weekStart);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'today' ? 'Today' : 'This Week'}
        </Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.tabActive]}
          onPress={() => setActiveTab('today')}>
          <Ionicons name="restaurant" size={20} color={activeTab === 'today' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'week' && styles.tabActive]}
          onPress={() => setActiveTab('week')}>
          <Ionicons name="calendar" size={20} color={activeTab === 'week' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>Week</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'today' ? (
        <TodayView entries={todayEntries} onSelect={setSelectedEntry} />
      ) : (
        <WeekView entries={weekEntries} onSelect={setSelectedEntry} />
      )}

      {/* Add Modal */}
      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addEntry}
      />

      {/* Detail Modal */}
      <DetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={deleteEntry}
      />
    </SafeAreaView>
  );
}

// Today View Component
function TodayView({ entries, onSelect }: { entries: FoodEntry[]; onSelect: (e: FoodEntry) => void }) {
  const totalCals = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totalProtein = entries.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0);

  const sections = mealTypes
    .map(type => ({ title: MealInfo[type].label, data: entries.filter(e => e.mealType === type) }))
    .filter(s => s.data.length > 0);

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="restaurant-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>No Food Logged Today</Text>
        <Text style={styles.emptySubtitle}>Tap + to add your first meal</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.summary}>
          <SummaryCard label="Calories" value={`${totalCals}`} icon="flame" color="#FF9500" />
          <SummaryCard label="Protein" value={`${totalProtein.toFixed(0)}g`} icon="leaf" color="#34C759" />
          <SummaryCard label="Carbs" value={`${totalCarbs.toFixed(0)}g`} icon="grid" color="#007AFF" />
          <SummaryCard label="Fat" value={`${totalFat.toFixed(0)}g`} icon="water" color="#FFCC00" />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => <FoodRow entry={item} onPress={() => onSelect(item)} />}
    />
  );
}

// Week View Component
function WeekView({ entries, onSelect }: { entries: FoodEntry[]; onSelect: (e: FoodEntry) => void }) {
  const totalCals = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const grouped = new Map<string, FoodEntry[]>();
  entries.forEach(e => {
    const key = new Date(e.timestamp).toDateString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  });
  const days = Array.from(grouped.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const avgCals = days.length > 0 ? Math.round(totalCals / days.length) : 0;

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>No Food This Week</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.weekSummary}>
        <View style={styles.weekStatRow}>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatLabel}>Total Calories</Text>
            <Text style={[styles.weekStatValue, { color: '#FF9500' }]}>{totalCals}</Text>
            <Text style={styles.weekStatSub}>avg {avgCals}/day</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekStatLabel}>Meals</Text>
            <Text style={[styles.weekStatValue, { color: '#007AFF' }]}>{entries.length}</Text>
            <Text style={styles.weekStatSub}>this week</Text>
          </View>
        </View>
      </View>
      {days.map(day => {
        const dayEntries = grouped.get(day)!;
        const dayCals = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
        return (
          <View key={day}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
              <Text style={styles.dayHeaderCals}>{dayCals} cal</Text>
            </View>
            {dayEntries.map(e => <FoodRow key={e.id} entry={e} onPress={() => onSelect(e)} />)}
          </View>
        );
      })}
    </ScrollView>
  );
}

// Food Row Component
function FoodRow({ entry, onPress }: { entry: FoodEntry; onPress: () => void }) {
  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={MealInfo[entry.mealType].icon as any} size={24} color="#007AFF" />
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{entry.name}</Text>
        {entry.calories && <Text style={styles.rowCals}>{entry.calories} cal</Text>}
      </View>
      <Text style={styles.rowTime}>{time}</Text>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

// Summary Card Component
function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

// Add Food Modal
function AddFoodModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (e: FoodEntry) => void }) {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('snack');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const reset = () => { setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setMealType('snack'); };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      mealType,
      calories: calories ? parseInt(calories) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
      notes: '',
      timestamp: new Date().toISOString(),
    });
    reset();
    onClose();
  };

  const quickAdd = (n: string, c: number, p?: number, cb?: number) => {
    setName(n); setCalories(c.toString());
    if (p) setProtein(p.toString());
    if (cb) setCarbs(cb.toString());
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Food</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.modalSave, !name.trim() && { color: '#C7C7CC' }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.inputLabel}>Food Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="What did you eat?" />

          <Text style={styles.inputLabel}>Meal Type</Text>
          <View style={styles.mealPicker}>
            {mealTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.mealBtn, mealType === type && styles.mealBtnActive]}
                onPress={() => setMealType(type)}>
                <Text style={[styles.mealBtnText, mealType === type && styles.mealBtnTextActive]}>
                  {MealInfo[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Nutrition (optional)</Text>
          <View style={styles.nutritionRow}>
            <Ionicons name="flame" size={20} color="#FF9500" />
            <TextInput style={styles.nutritionInput} value={calories} onChangeText={setCalories} placeholder="Calories" keyboardType="numeric" />
          </View>
          <View style={styles.nutritionRow}>
            <Ionicons name="leaf" size={20} color="#34C759" />
            <TextInput style={styles.nutritionInput} value={protein} onChangeText={setProtein} placeholder="Protein (g)" keyboardType="decimal-pad" />
          </View>
          <View style={styles.nutritionRow}>
            <Ionicons name="grid" size={20} color="#007AFF" />
            <TextInput style={styles.nutritionInput} value={carbs} onChangeText={setCarbs} placeholder="Carbs (g)" keyboardType="decimal-pad" />
          </View>
          <View style={styles.nutritionRow}>
            <Ionicons name="water" size={20} color="#FFCC00" />
            <TextInput style={styles.nutritionInput} value={fat} onChangeText={setFat} placeholder="Fat (g)" keyboardType="decimal-pad" />
          </View>

          <Text style={styles.inputLabel}>Quick Add</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
            {[
              { n: 'Coffee', c: 5 },
              { n: 'Apple', c: 95, cb: 25 },
              { n: 'Banana', c: 105, cb: 27 },
              { n: 'Water', c: 0 },
              { n: 'Protein Shake', c: 150, p: 25 },
            ].map(q => (
              <TouchableOpacity key={q.n} style={styles.quickBtn} onPress={() => quickAdd(q.n, q.c, q.p, q.cb)}>
                <Text style={styles.quickBtnText}>{q.n}</Text>
                <Text style={styles.quickBtnCals}>{q.c} cal</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Detail Modal
function DetailModal({ entry, onClose, onDelete }: { entry: FoodEntry | null; onClose: () => void; onDelete: (id: string) => void }) {
  if (!entry) return null;

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  };

  return (
    <Modal visible={!!entry} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{entry.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Meal</Text>
            <Text style={styles.detailValue}>{MealInfo[entry.mealType].label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{new Date(entry.timestamp).toLocaleString()}</Text>
          </View>
          {entry.calories && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Calories</Text>
              <Text style={styles.detailValue}>{entry.calories}</Text>
            </View>
          )}
          {entry.protein && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Protein</Text>
              <Text style={styles.detailValue}>{entry.protein}g</Text>
            </View>
          )}
          {entry.carbs && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Carbs</Text>
              <Text style={styles.detailValue}>{entry.carbs}g</Text>
            </View>
          )}
          {entry.fat && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fat</Text>
              <Text style={styles.detailValue}>{entry.fat}g</Text>
            </View>
          )}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Entry</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#C6C6C8' },
  headerTitle: { fontSize: 34, fontWeight: 'bold' },
  addBtn: { padding: 8 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#C6C6C8' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#8E8E93' },
  tabTextActive: { color: '#007AFF', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 15, color: '#8E8E93', marginTop: 8 },
  summary: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 16 },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 17, fontWeight: '600', marginTop: 4 },
  summaryLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  sectionHeader: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', backgroundColor: '#F2F2F7', paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#C6C6C8', gap: 12 },
  rowContent: { flex: 1 },
  rowName: { fontSize: 17 },
  rowCals: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  rowTime: { fontSize: 14, color: '#8E8E93' },
  weekSummary: { backgroundColor: '#fff', padding: 16, marginBottom: 20 },
  weekStatRow: { flexDirection: 'row' },
  weekStat: { flex: 1 },
  weekStatLabel: { fontSize: 13, color: '#8E8E93' },
  weekStatValue: { fontSize: 28, fontWeight: '700', marginVertical: 4 },
  weekStatSub: { fontSize: 13, color: '#8E8E93' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F2F2F7', paddingHorizontal: 16, paddingVertical: 8 },
  dayHeaderText: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
  dayHeaderCals: { fontSize: 13, color: '#8E8E93' },
  modal: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#C6C6C8' },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalCancel: { fontSize: 17, color: '#007AFF' },
  modalSave: { fontSize: 17, color: '#007AFF', fontWeight: '600' },
  modalContent: { flex: 1, padding: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', fontSize: 17, padding: 12, borderRadius: 10 },
  mealPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  mealBtnActive: { backgroundColor: '#007AFF' },
  mealBtnText: { fontSize: 14, color: '#007AFF' },
  mealBtnTextActive: { color: '#fff' },
  nutritionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, marginBottom: 1, gap: 12 },
  nutritionInput: { flex: 1, fontSize: 17, paddingVertical: 12 },
  quickRow: { marginBottom: 40 },
  quickBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  quickBtnText: { fontSize: 14, fontWeight: '500' },
  quickBtnCals: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  detailRow: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#C6C6C8' },
  detailLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 4 },
  detailValue: { fontSize: 17 },
  deleteBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginTop: 24, alignItems: 'center' },
  deleteBtnText: { color: '#FF3B30', fontSize: 17 },
});
