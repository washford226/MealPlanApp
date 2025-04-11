import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from "react-native";
import { format, startOfWeek, addDays } from "date-fns";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Meal = {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealPlanCalendar = ({ onNavigateToCreateMeal }: { onNavigateToCreateMeal: () => void }) => {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0); // State to track the current week offset
  const [meals, setMeals] = useState<{ [key: string]: Meal[] }>({}); // State to store meals for the weeks

  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Week starts on Sunday

  // Fetch meals for a specific date
  const fetchMealsForDate = async (date: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view your meals.");
        return [];
      }

      const response = await axios.get(`${BASE_URL}/meal-plan`, {
        params: { date },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn(`Unexpected response for date (${date}):`, response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching meals for date (${date}):`, error);
      return [];
    }
  };

  // Fetch meals for a specific week
  const fetchMealsForWeek = async (weekStartDate: Date) => {
    const newMeals: { [key: string]: Meal[] } = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStartDate, i);
      const currentDateString = format(currentDate, "yyyy-MM-dd");
      const mealsForDate = await fetchMealsForDate(currentDateString);
      newMeals[currentDateString] = mealsForDate;
    }
    setMeals((prevMeals) => ({ ...prevMeals, ...newMeals })); // Append new meals to the existing state
  };

  // Fetch meals for the current week on initial render
  useEffect(() => {
    fetchMealsForWeek(startOfCurrentWeek);
  }, []);

  const handleMealPress = (meal: Meal) => {
    Alert.alert("Meal Selected", `You selected ${meal.name}`);
  };

  const handleNextWeek = () => {
    const nextWeekStartDate = addDays(startOfCurrentWeek, (weekOffset + 1) * 7);
    setWeekOffset((prevOffset) => prevOffset + 1); // Increment the week offset
    fetchMealsForWeek(nextWeekStartDate); // Fetch meals for the next week
  };

  return (
    <View style={styles.outerContainer}>
      {/* Create Meal Button */}
      <View style={styles.createMealButtonContainer}>
        <TouchableOpacity style={styles.createMealButton} onPress={onNavigateToCreateMeal}>
          <Text style={styles.createMealButtonText}>Create Meal</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} style={styles.scrollView}>
        <View style={styles.container}>
          {/* Display meals for all weeks */}
          {Object.keys(meals).map((dateString) => {
            const currentDate = new Date(dateString);
            return (
              <View key={dateString} style={styles.dayContainer}>
                <Text style={styles.dateLabel}>{format(currentDate, "EEEE, MMMM d")}</Text>
                <View style={styles.mealsContainer}>
                  {meals[dateString]?.length > 0 ? (
                    meals[dateString].map((meal, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.mealButton}
                        onPress={() => handleMealPress(meal)}
                      >
                        <Text style={styles.mealText}>{meal.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noMealText}>No meals for this day</Text>
                  )}
                </View>
              </View>
            );
          })}
          {/* Button to display the next week */}
          <TouchableOpacity style={styles.nextWeekButton} onPress={handleNextWeek}>
            <Text style={styles.nextWeekButtonText}>Next Week</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  createMealButtonContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  createMealButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
  },
  createMealButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexDirection: "row", // Arrange days horizontally
    padding: 16,
  },
  dayContainer: {
    width: 150, // Set a fixed width for each day
    marginRight: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  mealsContainer: {
    marginTop: 8,
  },
  mealButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealText: {
    fontSize: 14,
    textAlign: "center",
  },
  noMealText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
  },
  nextWeekButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 150, // Match the width of day containers
    height: 100, // Match the height of day containers
  },
  nextWeekButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MealPlanCalendar;