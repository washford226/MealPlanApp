import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Meal } from "@/types/types";
import { useTheme } from "@/context/ThemeContext"; // Import the ThemeContext

interface MyMealInfoProps {
  meal: Meal; // The selected meal
  onBack: () => void; // Callback to navigate back
}

const MyMealInfo: React.FC<MyMealInfoProps> = ({ meal, onBack }) => {
  const { theme } = useTheme(); // Access the current theme

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{meal.name}</Text>
      <Text style={[styles.description, { color: theme.text }]}>{meal.description}</Text>
      <Text style={[styles.details, { color: theme.text }]}>Ingredients: {meal.ingredients}</Text>
      <Text style={[styles.details, { color: theme.text }]}>Calories: {meal.calories}</Text>
      <Text style={[styles.details, { color: theme.text }]}>Protein: {meal.protein}g</Text>
      <Text style={[styles.details, { color: theme.text }]}>Carbs: {meal.carbohydrates}g</Text>
      <Text style={[styles.details, { color: theme.text }]}>Fat: {meal.fat}g</Text>
      <Button
        title="Back to My Meals"
        onPress={onBack}
        color={theme.button} // Use theme color for the button
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  details: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default MyMealInfo;