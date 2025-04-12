import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, Modal } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";
import Icon from "react-native-vector-icons/FontAwesome";

type AddMealToDateProps = {
  route: { params: { date: string } }; // Receive the selected date as a prop
  navigation: any;
};

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const AddMealToDate: React.FC<AddMealToDateProps> = ({ route, navigation }) => {
  const { date } = route.params; // Extract the selected date
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null); // Track the selected meal
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  const fetchMeals = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view your meals.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setMeals(response.data);
      } else {
        console.warn("Unexpected response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      Alert.alert("Error", "Failed to fetch meals. Please try again.");
    }
  };

  const addMealToDate = async (mealId: number, mealType: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to add meals.");
        return;
      }

      await axios.post(
        `${BASE_URL}/meal-plan`,
        { date, meal_id: mealId, meal_type: mealType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Meal added to the calendar.");
      setIsModalVisible(false); // Close the modal
      navigation.goBack(); // Navigate back to the calendar
    } catch (error) {
      console.error("Error adding meal to date:", error);
      Alert.alert("Error", "Failed to add meal to the calendar. Please try again.");
    }
  };

  const handleMealPress = (meal: Meal) => {
    setSelectedMeal(meal); // Set the selected meal
    setIsModalVisible(true); // Show the modal
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Meal to {date}</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mealItem} onPress={() => handleMealPress(item)}>
            <Text style={styles.mealName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No meals available</Text>}
      />

      {/* Modal for Meal Type Selection */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Meal Type</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => addMealToDate(selectedMeal!.id, "Breakfast")}
            >
              <Text style={styles.modalButtonText}>Breakfast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => addMealToDate(selectedMeal!.id, "Lunch")}
            >
              <Text style={styles.modalButtonText}>Lunch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => addMealToDate(selectedMeal!.id, "Dinner")}
            >
              <Text style={styles.modalButtonText}>Dinner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Back Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Calendar</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mealItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007BFF",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#007BFF",
    marginBottom: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
});

export default AddMealToDate;