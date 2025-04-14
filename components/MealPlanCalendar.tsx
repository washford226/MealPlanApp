import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Modal } from "react-native";
import { format, startOfWeek, addDays } from "date-fns";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";
import { useTheme } from "@/context/ThemeContext"; // Import the ThemeContext

type MealPlanCalendarProps = {
  onMealSelect: (meal: Meal) => void; // Callback for selecting a meal
  onNavigateToCreateMeal: () => void;
  onNavigateToAddMeal: (date: string) => void; // Callback to navigate to the "Add Meal" screen
};

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  onMealSelect,
  onNavigateToCreateMeal,
  onNavigateToAddMeal,
}) => {
  const today = new Date();
  const { theme } = useTheme(); // Access the theme from the context
  const [daysToShow, setDaysToShow] = useState(7); // Start with 7 days
  const [meals, setMeals] = useState<{ [key: string]: Meal[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Track the selected date
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate the start of the current week (Sunday)
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });

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

  const fetchMealsForWeek = async (weekStartDate: Date) => {
    const newMeals: { [key: string]: Meal[] } = {};
    for (let i = 0; i < daysToShow; i++) {
      const currentDate = addDays(weekStartDate, i);
      const currentDateString = format(currentDate, "yyyy-MM-dd");
      const mealsForDate = await fetchMealsForDate(currentDateString);
      newMeals[currentDateString] = mealsForDate;
    }
    setMeals((prevMeals) => ({ ...prevMeals, ...newMeals }));
  };

  const deleteAllMealsForDate = async (date: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to delete meals.");
        return;
      }

      await axios.delete(`${BASE_URL}/meal-plan-clear`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { date },
      });

      Alert.alert("Success", `All meals for ${date} have been deleted.`);
      setMeals((prevMeals) => {
        const updatedMeals = { ...prevMeals };
        delete updatedMeals[date];
        return updatedMeals;
      });
    } catch (error) {
      console.error("Error deleting meals for date:", error);
      Alert.alert("Error", "Failed to delete meals for the selected date. Please try again.");
    }
  };

  useEffect(() => {
    fetchMealsForWeek(startOfCurrentWeek);
  }, [daysToShow]);
  
  useEffect(() => {
    // Center on the current date only when the component mounts
    const todayIndex = Math.floor(
      (today.getTime() - startOfWeek(today, { weekStartsOn: 0 }).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: todayIndex * 166, animated: true });
    }
  }, []); // Empty dependency array ensures this runs only once

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
    setIsModalVisible(true); // Show the modal with options
  };

  const handleAddMeal = () => {
    if (selectedDate) {
      onNavigateToAddMeal(selectedDate); // Navigate to the "Add Meal" screen
      setIsModalVisible(false);
    }
  };

  const handleDeleteMeals = () => {
    if (selectedDate) {
      deleteAllMealsForDate(selectedDate); // Delete all meals for the selected date
      setIsModalVisible(false);
    }
  };

  const handleNextWeek = () => {
    setDaysToShow((prevDays) => prevDays + 7); // Add 7 more days to the calendar
  };

  const getMealButtonColor = (mealType: string) => {
    const mealTypeKey = mealType.toLowerCase() as keyof typeof theme.mealColors;
    return theme.mealColors[mealTypeKey] || theme.button;
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <View style={styles.createMealButtonContainer}>
        <TouchableOpacity
          style={[styles.createMealButton, { backgroundColor: theme.primary }]}
          onPress={onNavigateToCreateMeal}
        >
          <Text style={[styles.createMealButtonText, { color: theme.buttonText }]}>Create Meal</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} style={styles.scrollView} ref={scrollViewRef}>
        <View style={styles.container}>
          {Array.from({ length: daysToShow }).map((_, i) => {
            const currentDate = addDays(startOfCurrentWeek, i);
            const dateString = format(currentDate, "yyyy-MM-dd");
            const isToday = format(currentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            return (
              <View
                key={dateString}
                style={[
                  styles.dayContainer,
                  { backgroundColor: theme.card },
                  isToday && { borderColor: theme.primary },
                ]}
              >
                <TouchableOpacity onPress={() => handleDatePress(dateString)}>
                  <Text style={[styles.dateLabel, { color: theme.text }]}>
                    {format(currentDate, "EEEE, MMMM d")}
                  </Text>
                </TouchableOpacity>
                <View style={styles.mealsContainer}>
                  {meals[dateString]?.length > 0 ? (
                    meals[dateString].map((meal, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.mealButton,
                          { backgroundColor: getMealButtonColor(meal.meal_type) },
                        ]}
                        onPress={() => onMealSelect(meal)}
                      >
                        <Text style={[styles.mealText, { color: theme.mealText }]}>{meal.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={[styles.noMealText, { color: theme.subtext }]}>
                      No meals for this day
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
          {/* Next Week Button */}
          <TouchableOpacity
            style={[styles.nextWeekButton, { backgroundColor: theme.primary }]}
            onPress={handleNextWeek}
          >
            <Text style={[styles.nextWeekButtonText, { color: theme.buttonText }]}>Next Week</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for Date Options */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Options for {selectedDate}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleAddMeal}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>
                Add Meal to Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.danger }]}
              onPress={handleDeleteMeals}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>
                Delete All Meals on Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: theme.border }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.modalCancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    padding: 16,
  },
  dayContainer: {
    width: 200,    //Change the width of the day container 
    marginRight: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  currentDayContainer: {
    borderWidth: 2,
    borderColor: "#007BFF",
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
    width: 150,
    marginLeft: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  nextWeekButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
    width: "100%",
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MealPlanCalendar;