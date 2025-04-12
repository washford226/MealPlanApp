import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from "react-native";
import { format, startOfWeek, addDays } from "date-fns";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";


type MealPlanCalendarProps = {
  onMealSelect: (meal: Meal) => void; // Callback for selecting a meal
  onNavigateToCreateMeal: () => void;
};

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({ onMealSelect, onNavigateToCreateMeal }) => {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [meals, setMeals] = useState<{ [key: string]: Meal[] }>({});
  const scrollViewRef = useRef<ScrollView>(null);

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
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStartDate, i);
      const currentDateString = format(currentDate, "yyyy-MM-dd");
      const mealsForDate = await fetchMealsForDate(currentDateString);
      newMeals[currentDateString] = mealsForDate;
    }
    setMeals((prevMeals) => ({ ...prevMeals, ...newMeals }));
  };

  useEffect(() => {
    fetchMealsForWeek(startOfCurrentWeek);

    const todayIndex = Math.floor((today.getTime() - startOfCurrentWeek.getTime()) / (1000 * 60 * 60 * 24));
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: todayIndex * 166, animated: true });
    }
  }, []);

  const handleMealPress = (meal: Meal) => {
    onMealSelect(meal); // Call the onMealSelect callback with the selected meal
  };

  const handleNextWeek = () => {
    const nextWeekStartDate = addDays(startOfCurrentWeek, (weekOffset + 1) * 7);
    setWeekOffset((prevOffset) => prevOffset + 1);
    fetchMealsForWeek(nextWeekStartDate);
  };

  const getMealButtonColor = (mealType: string) => {
    switch (mealType) {
      case "Breakfast":
        return "#FF6347";
      case "Lunch":
        return "#32CD32";
      case "Dinner":
        return "#1E90FF";
      case "Other":
      default:
        return "#800080";
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.createMealButtonContainer}>
        <TouchableOpacity style={styles.createMealButton} onPress={onNavigateToCreateMeal}>
          <Text style={styles.createMealButtonText}>Create Meal</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} style={styles.scrollView} ref={scrollViewRef}>
        <View style={styles.container}>
          {Object.keys(meals).map((dateString) => {
            const currentDate = new Date(dateString);
            const isToday = format(currentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            return (
              <View
                key={dateString}
                style={[
                  styles.dayContainer,
                  isToday && styles.currentDayContainer,
                ]}
              >
                <TouchableOpacity>
                  <Text style={styles.dateLabel}>{format(currentDate, "EEEE, MMMM d")}</Text>
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
    flexDirection: "row",
    padding: 16,
  },
  dayContainer: {
    width: 150,
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
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 100,
  },
  nextWeekButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MealPlanCalendar;