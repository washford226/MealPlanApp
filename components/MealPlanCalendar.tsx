import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, Modal, TextInput, Alert } from "react-native";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

type Meal = {
  name: string;
  color: string;
};

type Meals = {
  [key: string]: Meal[];
};

const MealPlanCalendar = ({ onNavigateToCreateMeal }: { onNavigateToCreateMeal: () => void }) => {
  const today = new Date();
  const [weeksToShow, setWeeksToShow] = useState(1);
  const [startDate, setStartDate] = useState(startOfWeek(today, { weekStartsOn: 0 }));
  const scrollViewRef = useRef<ScrollView>(null);
  const hasCenteredOnToday = useRef(false);

  const mealColors = {
    Breakfast: "red",
    Lunch: "green",
    Dinner: "blue",
    Snack: "purple",
  };

  const generateMeals = (): Meal[] => [
    { name: "Breakfast", color: mealColors.Breakfast },
    { name: "Lunch", color: mealColors.Lunch },
    { name: "Dinner", color: mealColors.Dinner },
  ];

  const initializeMeals = (days: Date[], existingMeals: Meals): Meals => {
    return days.reduce((acc, day) => {
      const dayString = format(day, "yyyy-MM-dd");
      acc[dayString] = existingMeals[dayString] || generateMeals();
      return acc;
    }, { ...existingMeals });
  };

  const days = Array.from({ length: weeksToShow * 7 }, (_, i) => addDays(startDate, i));
  const [meals, setMeals] = useState<Meals>(initializeMeals(days, {}));
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    setMeals((prevMeals) => initializeMeals(days, prevMeals));
  }, [weeksToShow, startDate]);

  useEffect(() => {
    if (!hasCenteredOnToday.current) {
      const todayIndex = days.findIndex((day) => isSameDay(day, today));
      if (todayIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: todayIndex * 116, animated: true });
        hasCenteredOnToday.current = true;
      }
    }
  }, [days]);

  const addMeal = () => {
    if (meals[selectedDay].some((meal) => meal.name === newMealName)) {
      Alert.alert("Error", "Meal name already exists for this day.");
      return;
    }
    const newMeal: Meal = { name: newMealName, color: mealColors.Snack };
    setMeals((prevMeals) => ({
      ...prevMeals,
      [selectedDay]: [...prevMeals[selectedDay], newMeal],
    }));
    setModalVisible(false);
    setNewMealName("");
  };

  const openModal = (day: string) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const openEditModal = (day: string, meal: Meal) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setNewMealName(meal.name);
    setEditModalVisible(true);
  };

  const deleteMeal = () => {
    if (selectedMeal) {
      setMeals((prevMeals) => ({
        ...prevMeals,
        [selectedDay]: prevMeals[selectedDay].filter((meal) => meal.name !== selectedMeal.name),
      }));
      setEditModalVisible(false);
      setSelectedMeal(null);
    }
  };

  const renameMeal = () => {
    if (selectedMeal) {
      if (meals[selectedDay].some((meal) => meal.name === newMealName)) {
        Alert.alert("Error", "Meal name already exists for this day.");
        return;
      }
      setMeals((prevMeals) => ({
        ...prevMeals,
        [selectedDay]: prevMeals[selectedDay].map((meal) =>
          meal.name === selectedMeal.name ? { ...meal, name: newMealName } : meal
        ),
      }));
      setEditModalVisible(false);
      setSelectedMeal(null);
      setNewMealName("");
    }
  };

  const showMoreDays = () => {
    setWeeksToShow(weeksToShow + 1);
  };

  const resetToToday = () => {
    setStartDate(startOfWeek(today, { weekStartsOn: 0 }));
    setWeeksToShow(1);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: true });
    }
  };

  return (
    <View>
      <Button title="Reset to Today" onPress={resetToToday} />
      <ScrollView horizontal={true} style={styles.scrollView} ref={scrollViewRef}>
        <View style={styles.grid}>
          {days.map((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, today);
            const dayMeals = meals[dayString] || [];
            const dayHeight = 100 + dayMeals.length * 50;
            return (
              <View
                key={day.toISOString()}
                style={[styles.dayContainer, isToday && styles.todayContainer, { height: dayHeight }]}
              >
                <Text style={styles.dayName}>{format(day, "EEEE")}</Text>
                <Text style={styles.date}>{format(day, "MM/dd")}</Text>
                <View style={styles.mealsContainer}>
                  {dayMeals.map((meal) => (
                    <TouchableOpacity
                      key={meal.name}
                      style={[styles.meal, { backgroundColor: meal.color }]}
                      onPress={() => openEditModal(dayString, meal)}
                    >
                      <Text style={styles.mealText}>{meal.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title="Add Meal" onPress={() => openModal(dayString)} />
              </View>
            );
          })}
          <Button title="Show More Days" onPress={showMoreDays} />
        </View>
      </ScrollView>
      <View style={styles.createMealButtonContainer}>
        <TouchableOpacity style={styles.createMealButton} onPress={onNavigateToCreateMeal}>
          <Text style={styles.createMealButtonText}>Create Meal</Text>
        </TouchableOpacity>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Enter Meal Name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setNewMealName}
            value={newMealName}
            placeholder="Meal Name"
          />
          <Button title="Add" onPress={addMeal} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Edit Meal Name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setNewMealName}
            value={newMealName}
            placeholder="Meal Name"
          />
          <Button title="Rename" onPress={renameMeal} />
          <Button title="Delete" onPress={deleteMeal} />
          <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    padding: 16,
  },
  dayContainer: {
    width: 100,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 16,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: "black",
  },
  dayName: {
    fontWeight: "bold",
  },
  date: {
    color: "#888",
  },
  mealsContainer: {
    marginTop: 8,
  },
  meal: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  mealText: {
    color: "#fff",
  },
  createMealButtonContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  createMealButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
  },
  createMealButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    width: "80%",
  },
});

export default MealPlanCalendar;