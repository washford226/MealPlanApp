import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const NewMealScreen = ({ route, navigation }) => {
  const { day } = route.params;
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealIngredients, setMealIngredients] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbohydrates, setMealCarbohydrates] = useState('');
  const [mealFat, setMealFat] = useState('');

  const addMeal = async () => {
    try {
      const response = await fetch('http://localhost:5000/addMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          name: mealName,
          description: mealDescription,
          ingredients: mealIngredients,
          calories: parseInt(mealCalories),
          protein: parseInt(mealProtein),
          carbohydrates: parseInt(mealCarbohydrates),
          fat: parseInt(mealFat),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Meal added successfully!");
        // Clear the input fields
        setMealName('');
        setMealDescription('');
        setMealIngredients('');
        setMealCalories('');
        setMealProtein('');
        setMealCarbohydrates('');
        setMealFat('');
        // Navigate back to the calendar screen
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to add meal.");
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert("Error", "Failed to add meal.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Meal</Text>
      <TextInput
        style={styles.input}
        placeholder="Meal Name"
        value={mealName}
        onChangeText={setMealName}
      />
      <TextInput
        style={styles.input}
        placeholder="Meal Description"
        value={mealDescription}
        onChangeText={setMealDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Meal Ingredients"
        value={mealIngredients}
        onChangeText={setMealIngredients}
      />
      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={mealCalories}
        onChangeText={setMealCalories}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Protein"
        value={mealProtein}
        onChangeText={setMealProtein}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Carbohydrates"
        value={mealCarbohydrates}
        onChangeText={setMealCarbohydrates}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Fat"
        value={mealFat}
        onChangeText={setMealFat}
        keyboardType="numeric"
      />
      <Button title="Add Meal" onPress={addMeal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
  },
});

export default NewMealScreen;