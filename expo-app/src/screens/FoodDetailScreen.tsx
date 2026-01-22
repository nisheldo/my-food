import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry, MealType, mealTypes, MealTypeInfo } from '../types';
import { updateEntry, deleteEntry } from '../storage/foodStorage';

export function FoodDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialEntry: FoodEntry = route.params.entry;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialEntry.name);
  const [mealType, setMealType] = useState<MealType>(initialEntry.mealType);
  const [calories, setCalories] = useState(initialEntry.calories?.toString() || '');
  const [protein, setProtein] = useState(initialEntry.protein?.toString() || '');
  const [carbs, setCarbs] = useState(initialEntry.carbs?.toString() || '');
  const [fat, setFat] = useState(initialEntry.fat?.toString() || '');
  const [notes, setNotes] = useState(initialEntry.notes);

  const handleSave = async () => {
    const updated: FoodEntry = {
      ...initialEntry,
      name,
      mealType,
      calories: calories ? parseInt(calories, 10) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
      notes,
    };
    await updateEntry(updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(initialEntry.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={styles.headerButton}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, name, mealType, calories, protein, carbs, fat, notes]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Food name"
            />
          ) : (
            <Text style={styles.value}>{name}</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Meal</Text>
          {isEditing ? (
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
          ) : (
            <View style={styles.mealDisplay}>
              <Ionicons
                name={MealTypeInfo[mealType].icon as any}
                size={18}
                color="#007AFF"
              />
              <Text style={styles.value}>{MealTypeInfo[mealType].label}</Text>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatDate(initialEntry.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition</Text>

        <View style={styles.nutritionRow}>
          <Ionicons name="flame" size={20} color="#FF9500" />
          <Text style={styles.nutritionLabel}>Calories</Text>
          {isEditing ? (
            <TextInput
              style={styles.nutritionInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="0"
            />
          ) : (
            <Text style={styles.nutritionValue}>
              {calories || '-'} cal
            </Text>
          )}
        </View>

        <View style={styles.nutritionRow}>
          <Ionicons name="leaf" size={20} color="#34C759" />
          <Text style={styles.nutritionLabel}>Protein</Text>
          {isEditing ? (
            <TextInput
              style={styles.nutritionInput}
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ) : (
            <Text style={styles.nutritionValue}>
              {protein || '-'} g
            </Text>
          )}
        </View>

        <View style={styles.nutritionRow}>
          <Ionicons name="grid" size={20} color="#007AFF" />
          <Text style={styles.nutritionLabel}>Carbs</Text>
          {isEditing ? (
            <TextInput
              style={styles.nutritionInput}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ) : (
            <Text style={styles.nutritionValue}>
              {carbs || '-'} g
            </Text>
          )}
        </View>

        <View style={styles.nutritionRow}>
          <Ionicons name="water" size={20} color="#FFCC00" />
          <Text style={styles.nutritionLabel}>Fat</Text>
          {isEditing ? (
            <TextInput
              style={styles.nutritionInput}
              value={fat}
              onChangeText={setFat}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ) : (
            <Text style={styles.nutritionValue}>
              {fat || '-'} g
            </Text>
          )}
        </View>
      </View>

      {(notes || isEditing) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.notesText}>{notes || 'No notes'}</Text>
          )}
        </View>
      )}

      {!isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    color: '#000',
  },
  input: {
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  mealDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  mealTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    gap: 12,
  },
  nutritionLabel: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  nutritionValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
  nutritionInput: {
    fontSize: 17,
    color: '#000',
    textAlign: 'right',
    minWidth: 60,
  },
  notesInput: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 12,
    minHeight: 80,
  },
  notesText: {
    fontSize: 17,
    color: '#8E8E93',
    paddingVertical: 12,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
  },
  headerButton: {
    color: '#007AFF',
    fontSize: 17,
  },
});
