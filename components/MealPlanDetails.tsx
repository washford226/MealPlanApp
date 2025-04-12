import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";

interface MealPlanDetailsProps {
  meal: Meal;
  onBack: () => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealPlanDetails: React.FC<MealPlanDetailsProps> = ({ meal, onBack }) => {
  const handleDeleteMeal = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to delete meals.");
        return;
      }

      // Use meal.meal_plan_id for the DELETE request
      await axios.delete(`${BASE_URL}/meal-plan/${meal.meal_plan_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Meal deleted successfully.");
      onBack(); // Navigate back to the calendar after deletion
    } catch (error) {
      console.error("Error deleting meal:", error);
      Alert.alert("Error", "Failed to delete the meal. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.description}>{meal.description}</Text>
      <Text style={styles.details}>Calories: {meal.calories}</Text>
      <Text style={styles.details}>Protein: {meal.protein}g</Text>
      <Text style={styles.details}>Carbs: {meal.carbohydrates}g</Text>
      <Text style={styles.details}>Fat: {meal.fat}g</Text>
      <Text style={styles.details}>Meal Type: {meal.meal_type}</Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMeal}>
        <Text style={styles.deleteButtonText}>Delete Meal</Text>
      </TouchableOpacity>

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
  deleteButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FF6347",
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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