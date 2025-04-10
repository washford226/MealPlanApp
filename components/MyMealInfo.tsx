import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, Platform, Switch, TouchableOpacity } from "react-native";
import { Meal } from "@/types/types";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MyMealInfoProps {
  meal: Meal;
  onBack: () => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MyMealInfo: React.FC<MyMealInfoProps> = ({ meal, onBack }) => {
  const { theme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [editedMeal, setEditedMeal] = useState<Meal>({ ...meal });

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/meals/${meal.id}`,
        editedMeal,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Meal updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating meal:", error);
      Alert.alert("Error", "Failed to update meal. Please try again later.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/meals/${meal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Meal deleted successfully!");
        onBack();
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
      Alert.alert("Error", "Failed to delete meal. Please try again later.");
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this meal? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isEditing ? (
        <>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.name}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, name: text })}
            placeholder="Meal Name"
            placeholderTextColor={theme.placeholder}
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.description}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, description: text })}
            placeholder="Description"
            placeholderTextColor={theme.placeholder}
          />
          <TextInput
            style={[styles.ingredientsInput, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.ingredients}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, ingredients: text })}
            placeholder="Ingredients"
            placeholderTextColor={theme.placeholder}
            multiline={true}
            numberOfLines={4}
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.calories.toString()}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, calories: parseInt(text) || 0 })}
            placeholder="Calories"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.protein.toString()}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, protein: parseFloat(text) || 0 })}
            placeholder="Protein (g)"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.carbohydrates.toString()}
            onChangeText={(text) =>
              setEditedMeal({ ...editedMeal, carbohydrates: parseFloat(text) || 0 })
            }
            placeholder="Carbs (g)"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={editedMeal.fat.toString()}
            onChangeText={(text) => setEditedMeal({ ...editedMeal, fat: parseFloat(text) || 0 })}
            placeholder="Fat (g)"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>Visibility:</Text>
            <Switch
              value={editedMeal.visibility}
              onValueChange={(value) => setEditedMeal({ ...editedMeal, visibility: value })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={editedMeal.visibility ? theme.primary : theme.border}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.danger }]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.title, { color: theme.text }]}>{meal.name}</Text>
          <Text style={[styles.description, { color: theme.subtext }]}>{meal.description}</Text>
          <Text style={[styles.details, { color: theme.text }]}>Ingredients: {meal.ingredients}</Text>
          <Text style={[styles.details, { color: theme.text }]}>Calories: {meal.calories}</Text>
          <Text style={[styles.details, { color: theme.text }]}>Protein: {meal.protein}g</Text>
          <Text style={[styles.details, { color: theme.text }]}>Carbs: {meal.carbohydrates}g</Text>
          <Text style={[styles.details, { color: theme.text }]}>Fat: {meal.fat}g</Text>
          <Text style={[styles.details, { color: theme.text }]}>
            Visibility: {meal.visibility ? "Public" : "Private"}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Edit Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.danger }]}
            onPress={confirmDelete}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Delete Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={onBack}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Back to My Meals</Text>
          </TouchableOpacity>
        </>
      )}
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  ingredientsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyMealInfo;