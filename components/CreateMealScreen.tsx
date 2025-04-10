import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const CreateMealScreen = ({ route, navigation }: any) => {
  const { selectedDay } = route.params || {};
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [mealIngredients, setMealIngredients] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbohydrates, setMealCarbohydrates] = useState("");
  const [mealFat, setMealFat] = useState("");

  const handleAddMeal = async () => {
    console.log(mealName, mealDescription, mealIngredients, mealCalories, mealProtein, mealCarbohydrates, mealFat);
    if (!mealName || !mealDescription || !mealIngredients) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    const newMeal = {
      name: mealName,
      description: mealDescription,
      ingredients: mealIngredients.split(",").map((ingredient) => ingredient.trim()),
      calories: parseInt(mealCalories, 10) || 0,
      protein: parseInt(mealProtein, 10) || 0,
      carbohydrates: parseInt(mealCarbohydrates, 10) || 0,
      fat: parseInt(mealFat, 10) || 0,
    };

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meal: newMeal, day: selectedDay }),
      });

      if (!response.ok) {
        throw new Error("Failed to add meal to the database.");
      }

      Alert.alert("Success", "Meal added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add the meal to the database.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Meal</Text>
      <TextInput style={styles.input} placeholder="Meal Name" value={mealName} onChangeText={setMealName} />
      <TextInput style={styles.input} placeholder="Meal Description" value={mealDescription} onChangeText={setMealDescription} />
      <TextInput style={styles.input} placeholder="Ingredients (comma-separated)" value={mealIngredients} onChangeText={setMealIngredients} />
      <TextInput style={styles.input} placeholder="Calories" value={mealCalories} onChangeText={setMealCalories} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Protein (g)" value={mealProtein} onChangeText={setMealProtein} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Carbs (g)" value={mealCarbohydrates} onChangeText={setMealCarbohydrates} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Fat (g)" value={mealFat} onChangeText={setMealFat} keyboardType="numeric" />
      <Button title="Create Meal" onPress={handleAddMeal} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "80%",
  },
});

export default CreateMealScreen;