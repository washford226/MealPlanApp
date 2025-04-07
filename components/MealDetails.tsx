import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Meal } from "@/types/types"; // Import the shared Meal interface

interface MealDetailsProps {
  meal: Meal; // Include the meal property in the props
  onBack: () => void; // Include the onBack property for navigation
  onAddReview: (meal: Meal) => void; // Callback for navigating to the CreateReview screen
  onViewReviews: (meal: Meal) => void; // Callback for navigating to the ViewReviews screen
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealDetails: React.FC<MealDetailsProps> = ({ meal, onBack, onAddReview, onViewReviews }) => {
  const onAddMeal = async (meal: Meal) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      // Make the POST request to add the meal
      const response = await fetch(`${BASE_URL}/add-meal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from AsyncStorage
        },
        body: JSON.stringify({
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          calories: meal.calories,
          protein: meal.protein,
          carbohydrates: meal.carbohydrates,
          fat: meal.fat,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Meal added successfully!");
      } else {
        const error = await response.text();
        console.error("Error response:", error);
        Alert.alert("Error", `Failed to add meal: ${error}`);
      }
    } catch (err) {
      console.error("Error adding meal:", err);
      Alert.alert("Error", "An error occurred while adding the meal.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.description}>{meal.description}</Text>
      <Text style={styles.sectionTitle}>Ingredients:</Text>
      <Text style={styles.ingredients}>{meal.ingredients}</Text>
      <Text style={styles.sectionTitle}>Nutritional Information:</Text>
      <Text style={styles.nutrition}>Calories: {meal.calories}</Text>
      <Text style={styles.nutrition}>Protein: {meal.protein}g</Text>
      <Text style={styles.nutrition}>Carbohydrates: {meal.carbohydrates}g</Text>
      <Text style={styles.nutrition}>Fat: {meal.fat}g</Text>
      <Text style={styles.user}>Created by: {meal.userName}</Text>

      {/* Add Review Button */}
      <TouchableOpacity style={styles.addReviewButton} onPress={() => onAddReview(meal)}>
        <Text style={styles.addReviewButtonText}>Add Review</Text>
      </TouchableOpacity>

      {/* View Reviews Button */}
      <TouchableOpacity style={styles.viewReviewsButton} onPress={() => onViewReviews(meal)}>
        <Text style={styles.viewReviewsButtonText}>View Reviews</Text>
      </TouchableOpacity>

      {/* Add Meal Button */}
      <TouchableOpacity style={styles.addMealButton} onPress={() => onAddMeal(meal)}>
        <Text style={styles.addMealButtonText}>Add Meal</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
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
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  ingredients: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  nutrition: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  user: {
    fontSize: 14,
    color: "#888",
    marginTop: 16,
    marginBottom: 16,
  },
  addReviewButton: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addReviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewReviewsButton: {
    padding: 12,
    backgroundColor: "#17a2b8",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  viewReviewsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addMealButton: {
    padding: 12,
    backgroundColor: "#ffc107",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addMealButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MealDetails;