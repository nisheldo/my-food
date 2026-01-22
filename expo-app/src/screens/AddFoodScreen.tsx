import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { MealType, mealTypes, MealTypeInfo, FoodEntry } from '../types';
import { saveEntry } from '../storage/foodStorage';
import { QuickAddButton } from '../components/QuickAddButton';

export function AddFoodScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('snack');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;

    const entry: FoodEntry = {
      id: uuidv4(),
      name: name.trim(),
      mealType,
      calories: calories ? parseInt(calories, 10) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    };

    await saveEntry(entry);
    navigation.goBack();
  };

  const handleQuickAdd = (foodName: string, cal: number, prot?: number, carb?: number) => {
    setName(foodName);
    setCalories(cal.toString());
    if (prot) setProtein(prot.toString());
    if (carb) setCarbs(carb.toString());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Details</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Food name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <Text style={styles.label}>Meal</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type)}
              >
                <Ionicons
                  name={MealTypeInfo[type].icon as any}
                  size={20}
                  color={mealType === type ? '#fff' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === type && styles.mealTypeTextActive,
                  ]}
                >
                  {MealTypeInfo[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition (optional)</Text>

          <View style={styles.nutritionRow}>
            <Ionicons name="flame" size={20} color="#FF9500" style={styles.nutritionIcon} />
            <TextInput
              style={styles.nutritionInput}
              placeholder="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={styles.nutritionRow}>
            <Ionicons name="leaf" size={20} color="#34C759" style={styles.nutritionIcon} />
            <TextInput
              style={styles.nutritionInput}
              placeholder="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={styles.nutritionRow}>
            <Ionicons name="grid" size={20} color="#007AFF" style={styles.nutritionIcon} />
            <TextInput
              style={styles.nutritionInput}
              placeholder="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="decimal-pad"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={styles.nutritionRow}>
            <Ionicons name="water" size={20} color="#FFCC00" style={styles.nutritionIcon} />
            <TextInput
              style={styles.nutritionInput}
              placeholder="Fat (g)"
              value={fat}
              onChangeText={setFat}
              keyboardType="decimal-pad"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddContainer}>
            <QuickAddButton title="Coffee" calories={5} onPress={() => handleQuickAdd('Coffee', 5)} />
            <QuickAddButton title="Apple" calories={95} onPress={() => handleQuickAdd('Apple', 95, undefined, 25)} />
            <QuickAddButton title="Banana" calories={105} onPress={() => handleQuickAdd('Banana', 105, undefined, 27)} />
            <QuickAddButton title="Water" calories={0} onPress={() => handleQuickAdd('Water', 0)} />
            <QuickAddButton title="Protein Shake" calories={150} onPress={() => handleQuickAdd('Protein Shake', 150, 25)} />
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 17,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    color: '#000',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  mealTypeText: {
    fontSize: 14,
    color: '#007AFF',
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  nutritionIcon: {
    marginRight: 12,
  },
  nutritionInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 12,
    color: '#000',
  },
  quickAddContainer: {
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
