import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { format, startOfWeek, addDays } from "date-fns";

const MealPlanCalendar = () => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  type Meal = {
    name: string;
    color: string;
  };
  
  type Meals = {
    [key: string]: Meal[];
  };

  const mealColors = {
    Breakfast: 'red',
    Lunch: 'green',
    Dinner: 'blue',
  };

  const generateMeals = (): Meal[] => [
    { name: 'Breakfast', color: mealColors.Breakfast },
    { name: 'Lunch', color: mealColors.Lunch },
    { name: 'Dinner', color: mealColors.Dinner },
  ];

  const meals: Meals = days.reduce((acc, day) => {
    acc[format(day, "yyyy-MM-dd")] = generateMeals();
    return acc;
  }, {} as Meals);

  return (
    <View style={styles.grid}>
      {days.map((day) => (
        <View key={day.toISOString()} style={styles.dayContainer}>
          <Text style={styles.dayName}>{format(day, "EEEE")}</Text>
          <Text style={styles.date}>{format(day, "MM/dd")}</Text>
          <View style={styles.mealsContainer}>
            {meals[format(day, "yyyy-MM-dd")].map((meal) => (
              <TouchableOpacity key={meal.name} style={[styles.meal, { backgroundColor: meal.color }]}>
                <Text style={styles.mealText}>{meal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  dayContainer: {
    width: '14.28%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: {
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
  },
  mealsContainer: {
    marginTop: 8,
  },
  meal: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  mealText: {
    color: '#fff',
  },
  noMeal: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
});

export default MealPlanCalendar;