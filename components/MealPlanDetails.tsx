import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Meal } from "@/types/types";

interface MealPlanDetailsProps {
  meal: Meal;
  onBack: () => void;
}

const MealPlanDetails: React.FC<MealPlanDetailsProps> = ({ meal, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.description}>{meal.description}</Text>
      <Text style={styles.details}>Calories: {meal.calories}</Text>
      <Text style={styles.details}>Protein: {meal.protein}g</Text>
      <Text style={styles.details}>Carbs: {meal.carbohydrates}g</Text>
      <Text style={styles.details}>Fat: {meal.fat}g</Text>
      <Text style={styles.details}>Meal Type: {meal.meal_type}</Text>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Calendar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  details: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MealPlanDetails;