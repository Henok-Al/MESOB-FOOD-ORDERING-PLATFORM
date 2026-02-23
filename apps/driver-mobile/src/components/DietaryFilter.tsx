import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FRANK_COLORS } from '../theme';

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'halal'
  | 'kosher'
  | 'nut-free'
  | 'organic'
  | 'low-carb'
  | 'high-protein';

interface DietaryFilterProps {
  selected: DietaryPreference[];
  onChange: (preferences: DietaryPreference[]) => void;
}

const dietaryOptions: Array<{
  value: DietaryPreference;
  label: string;
  icon: string;
  color: string;
}> = [
  { value: 'vegetarian', label: 'Vegetarian', icon: 'leaf', color: '#4CAF50' },
  { value: 'vegan', label: 'Vegan', icon: 'nutrition', color: '#8BC34A' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: 'pizza', color: '#FF9800' },
  { value: 'dairy-free', label: 'Dairy-Free', icon: 'water', color: '#2196F3' },
  { value: 'keto', label: 'Keto', icon: 'flame', color: '#9C27B0' },
  { value: 'halal', label: 'Halal', icon: 'restaurant', color: '#009688' },
  { value: 'kosher', label: 'Kosher', icon: 'restaurant', color: '#673AB7' },
  { value: 'nut-free', label: 'Nut-Free', icon: 'warning', color: '#F44336' },
  { value: 'organic', label: 'Organic', icon: 'leaf', color: '#4CAF50' },
  { value: 'low-carb', label: 'Low-Carb', icon: 'trending-down', color: '#FF5722' },
  { value: 'high-protein', label: 'High-Protein', icon: 'barbell', color: '#795548' },
];

export default function DietaryFilter({ selected, onChange }: DietaryFilterProps) {
  const handleToggle = (preference: DietaryPreference) => {
    if (selected.includes(preference)) {
      onChange(selected.filter((p) => p !== preference));
    } else {
      onChange([...selected, preference]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dietary Preferences</Text>
        {selected.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {dietaryOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? option.color : 'transparent',
                  borderColor: option.color,
                },
              ]}
              onPress={() => handleToggle(option.value)}
            >
              <Ionicons
                name={option.icon as any}
                size={16}
                color={isSelected ? '#fff' : option.color}
                style={styles.chipIcon}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#fff' : option.color },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selected.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedText}>
            Filtering by: {selected.map((s) => dietaryOptions.find((o) => o.value === s)?.label).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearText: {
    fontSize: 14,
    color: FRANK_COLORS.orange,
  },
  chipContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
  },
  selectedText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
