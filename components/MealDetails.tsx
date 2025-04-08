import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Meal } from "@/types/types"; // Import the shared Meal interface
import { useTheme } from "@/context/ThemeContext"; // Import ThemeContext

interface MealDetailsProps {
  meal: Meal; // Include the meal property in the props
  onBack: () => void; // Include the onBack property for navigation
  onAddReview: (meal: Meal) => void; // Callback for navigating to the CreateReview screen
  onViewReviews: (meal: Meal) => void; // Callback for navigating to the ViewReviews screen
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealDetails: React.FC<MealDetailsProps> = ({ meal, onBack, onAddReview, onViewReviews }) => {
  const { theme } = useTheme(); // Access the theme from ThemeContext

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{meal.name}</Text>
      <Text style={[styles.description, { color: theme.text }]}>{meal.description}</Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients:</Text>
      <Text style={[styles.ingredients, { color: theme.text }]}>{meal.ingredients}</Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutritional Information:</Text>
      <Text style={[styles.nutrition, { color: theme.text }]}>Calories: {meal.calories}</Text>
      <Text style={[styles.nutrition, { color: theme.text }]}>Protein: {meal.protein}g</Text>
      <Text style={[styles.nutrition, { color: theme.text }]}>Carbohydrates: {meal.carbohydrates}g</Text>
      <Text style={[styles.nutrition, { color: theme.text }]}>Fat: {meal.fat}g</Text>
      <Text style={[styles.user, { color: theme.text }]}>Created by: {meal.userName}</Text>

      {/* Add Review Button */}
      <TouchableOpacity
        style={[styles.addReviewButton, { backgroundColor: theme.button }]}
        onPress={() => onAddReview(meal)}
      >
        <Text style={[styles.addReviewButtonText, { color: theme.buttonText }]}>Add Review</Text>
      </TouchableOpacity>

      {/* View Reviews Button */}
      <TouchableOpacity
        style={[styles.viewReviewsButton, { backgroundColor: theme.button }]}
        onPress={() => onViewReviews(meal)}
      >
        <Text style={[styles.viewReviewsButtonText, { color: theme.buttonText }]}>View Reviews</Text>
      </TouchableOpacity>

      {/* Add Meal Button */}
      <TouchableOpacity
        style={[styles.addMealButton, { backgroundColor: theme.button }]}
        onPress={() => onAddMeal(meal)}
      >
        <Text style={[styles.addMealButtonText, { color: theme.buttonText }]}>Add Meal</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.button }]}
        onPress={onBack}
      >
        <Text style={[styles.backButtonText, { color: theme.buttonText }]}>Back</Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  ingredients: {
    fontSize: 16,
    marginBottom: 16,
  },
  nutrition: {
    fontSize: 16,
    marginBottom: 8,
  },
  user: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  addReviewButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addReviewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewReviewsButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  viewReviewsButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addMealButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addMealButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
  },
});

export default MealDetails;