import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Meal } from "@/types/types";

interface MyMealInfoProps {
  meal: Meal; // The selected meal
  onBack: () => void; // Callback to navigate back
}

const MyMealInfo: React.FC<MyMealInfoProps> = ({ meal, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.description}>{meal.description}</Text>
      <Text style={styles.details}>Ingredients: {meal.ingredients}</Text>
      <Text style={styles.details}>Calories: {meal.calories}</Text>
      <Text style={styles.details}>Protein: {meal.protein}g</Text>
      <Text style={styles.details}>Carbs: {meal.carbohydrates}g</Text>
      <Text style={styles.details}>Fat: {meal.fat}g</Text>
      <Button title="Back to My Meals" onPress={onBack} />
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
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  details: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
});

export default MyMealInfo;