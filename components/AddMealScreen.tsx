import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type AddMealScreenRouteProp = RouteProp<{ params: { day: string } }, 'params'>;
type AddMealScreenNavigationProp = StackNavigationProp<any>;

const AddMealScreen = ({ route, navigation }: { route: AddMealScreenRouteProp; navigation: AddMealScreenNavigationProp }) => {
  const { day } = route.params;
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealIngredients, setMealIngredients] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbohydrates, setMealCarbohydrates] = useState('');
  const [mealFat, setMealFat] = useState('');

  const handleAddMeal = async () => {
    // Validate input
    if (!mealName || !mealDescription || !mealIngredients || !mealCalories || !mealProtein || !mealCarbohydrates || !mealFat) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Convert numeric fields to integers
    const calories = parseInt(mealCalories, 10);
    const protein = parseInt(mealProtein, 10);
    const carbohydrates = parseInt(mealCarbohydrates, 10);
    const fat = parseInt(mealFat, 10);

    if (isNaN(calories) || isNaN(protein) || isNaN(carbohydrates) || isNaN(fat)) {
      Alert.alert('Error', 'Please enter valid numbers for calories, protein, carbohydrates, and fat.');
      return;
    }

    // Create meal object
    const newMeal = {
      name: mealName,
      description: mealDescription,
      ingredients: mealIngredients,
      calories: mealCalories,
      protein: mealProtein,
      carbohydrates: mealCarbohydrates,
      fat: mealFat,
      day: day,
    };

    try {
        // Save the meal to the database
        const response = await fetch('http://localhost:5000/meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMeal),
        });
    
        if (!response.ok) {
          throw new Error('Failed to save meal');
        }
    
        // Navigate back to the calendar
        navigation.goBack();
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Error', 'An unknown error occurred.');
        }
      }

    // Save the meal to the database (replace this with your actual database logic)
    // Example: await saveMealToDatabase(newMeal);

    // Navigate back to the calendar
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add Meal for {day}</Text>
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
      <Button title="Add Meal" onPress={handleAddMeal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
});

export default AddMealScreen;