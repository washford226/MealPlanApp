import React, { useState, useEffect, useRef } from "react";
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
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Other"; // Add meal_type field
};

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealPlanCalendar = ({ onNavigateToCreateMeal }: { onNavigateToCreateMeal: () => void }) => {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0); // State to track the current week offset
  const [meals, setMeals] = useState<{ [key: string]: Meal[] }>({}); // State to store meals for the weeks
  const scrollViewRef = useRef<ScrollView>(null); // Reference for the ScrollView

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

    // Scroll to the current date
    const todayIndex = Math.floor((today.getTime() - startOfCurrentWeek.getTime()) / (1000 * 60 * 60 * 24));
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: todayIndex * 166, animated: true }); // 166 is the approximate width of each day container (150 + margin)
    }
  }, []);

  const handleDatePress = (date: string) => {
    Alert.alert("Date Selected", `You selected ${date}`);
  };

  const handleMealPress = (meal: Meal) => {
    Alert.alert("Meal Selected", `You selected ${meal.name}`);
  };

  const handleNextWeek = () => {
    const nextWeekStartDate = addDays(startOfCurrentWeek, (weekOffset + 1) * 7);
    setWeekOffset((prevOffset) => prevOffset + 1); // Increment the week offset
    fetchMealsForWeek(nextWeekStartDate); // Fetch meals for the next week
  };

  const getMealButtonColor = (mealType: string) => {
    switch (mealType) {
      case "Breakfast":
        return "#FF6347"; // Red for breakfast
      case "Lunch":
        return "#32CD32"; // Green for lunch
      case "Dinner":
        return "#1E90FF"; // Blue for dinner
      case "Other":
      default:
        return "#800080"; // Purple for other meals
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Create Meal Button */}
      <View style={styles.createMealButtonContainer}>
        <TouchableOpacity style={styles.createMealButton} onPress={onNavigateToCreateMeal}>
          <Text style={styles.createMealButtonText}>Create Meal</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} style={styles.scrollView} ref={scrollViewRef}>
        <View style={styles.container}>
          {/* Display meals for all weeks */}
          {Object.keys(meals).map((dateString) => {
            const currentDate = new Date(dateString);
            const isToday = format(currentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"); // Check if the date is today
            return (
              <View
                key={dateString}
                style={[
                  styles.dayContainer,
                  isToday && styles.currentDayContainer, // Apply bold border for the current date
                ]}
              >
                <TouchableOpacity onPress={() => handleDatePress(dateString)}>
                  <Text style={styles.dateLabel}>{format(currentDate, "EEEE, MMMM d")}</Text>
                </TouchableOpacity>
                <View style={styles.mealsContainer}>
                  {meals[dateString]?.length > 0 ? (
                    meals[dateString].map((meal, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.mealButton,
                          { backgroundColor: getMealButtonColor(meal.meal_type) }, // Use meal_type for color
                        ]}
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
    padding: 8, // Add padding inside the border
    borderWidth: 1, // Add a border
    borderColor: "#ccc", // Set the border color
    borderRadius: 8, // Add rounded corners
    backgroundColor: "#f9f9f9", // Add a light background color
  },
  currentDayContainer: {
    borderWidth: 2, // Make the border bold
    borderColor: "#007BFF", // Use a distinct color for the current date
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