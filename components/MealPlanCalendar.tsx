import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, Modal, TextInput, Alert } from "react-native";
import { format, startOfWeek, addDays, subWeeks, isSameDay } from "date-fns";

const MealPlanCalendar = () => {
  const today = new Date();
  const [weeksToShow, setWeeksToShow] = useState(1);
  const [startDate, setStartDate] = useState(startOfWeek(today, { weekStartsOn: 0 }));
  const scrollViewRef = useRef<ScrollView>(null);
  const hasCenteredOnToday = useRef(false);

  // Generate an array of days based on the number of weeks to show
  const days = Array.from({ length: 7 * weeksToShow }, (_, i) => addDays(startDate, i));

  type Meal = {
    name: string;
    color: string;
  };
  
  type Meals = {
    [key: string]: Meal[];
  };

  const mealColors = {
    Breakfast: 'red',
    Lunch: 'green',
    Dinner: 'blue',
    Snack: 'purple',
  };

  // Function to generate default meals for a day
  const generateMeals = (): Meal[] => [
    { name: 'Breakfast', color: mealColors.Breakfast },
    { name: 'Lunch', color: mealColors.Lunch },
    { name: 'Dinner', color: mealColors.Dinner },
  ];

  // Function to initialize meals for the given days
  const initializeMeals = (days: Date[], existingMeals: Meals): Meals => {
    return days.reduce((acc, day) => {
      const dayString = format(day, "yyyy-MM-dd");
      acc[dayString] = existingMeals[dayString] || generateMeals();
      return acc;
    }, { ...existingMeals });
  };

  const [meals, setMeals] = useState<Meals>(initializeMeals(days, {} as Meals));
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Update meals when weeksToShow or startDate changes
  useEffect(() => {
    setMeals((prevMeals) => initializeMeals(days, prevMeals));
  }, [weeksToShow, startDate]);

  // Scroll to the current date when the component mounts
  useEffect(() => {
    if (!hasCenteredOnToday.current) {
      const todayIndex = days.findIndex(day => isSameDay(day, today));
      if (todayIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: todayIndex * 116, animated: true });
        hasCenteredOnToday.current = true;
      }
    }
  }, [days]); // Dependency array includes days to ensure it runs when days change

  // Function to add a new meal
  const addMeal = () => {
    if (meals[selectedDay].some(meal => meal.name === newMealName)) {
      Alert.alert("Error", "Meal name already exists for this day.");
      return;
    }
    const newMeal: Meal = { name: newMealName, color: mealColors.Snack };
    setMeals((prevMeals) => ({
      ...prevMeals,
      [selectedDay]: [...prevMeals[selectedDay], newMeal],
    }));
    setModalVisible(false);
    setNewMealName('');
  };

  // Function to open the modal for adding a meal
  const openModal = (day: string) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  // Function to open the modal for editing a meal
  const openEditModal = (day: string, meal: Meal) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setNewMealName(meal.name);
    setEditModalVisible(true);
  };

  // Function to delete a meal
  const deleteMeal = () => {
    if (selectedMeal) {
      setMeals((prevMeals) => ({
        ...prevMeals,
        [selectedDay]: prevMeals[selectedDay].filter(meal => meal.name !== selectedMeal.name),
      }));
      setEditModalVisible(false);
      setSelectedMeal(null);
    }
  };

  // Function to rename a meal
  const renameMeal = () => {
    if (selectedMeal) {
      if (meals[selectedDay].some(meal => meal.name === newMealName)) {
        Alert.alert("Error", "Meal name already exists for this day.");
        return;
      }
      setMeals((prevMeals) => ({
        ...prevMeals,
        [selectedDay]: prevMeals[selectedDay].map(meal =>
          meal.name === selectedMeal.name ? { ...meal, name: newMealName } : meal
        ),
      }));
      setEditModalVisible(false);
      setSelectedMeal(null);
      setNewMealName('');
    }
  };

  // Function to show more days (add another week)
  const showMoreDays = () => {
    setWeeksToShow(weeksToShow + 1);
  };

  // Function to reset to the current week
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
          {days.map((day, index) => {
            const dayString = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, today);
            const dayMeals = meals[dayString] || [];
            const dayHeight = 100 + dayMeals.length * 50; // Base height + additional height per meal
            return (
              <View key={day.toISOString()} style={[styles.dayContainer, isToday && styles.todayContainer, { height: dayHeight }]}>
                <Text style={styles.dayName}>{format(day, "EEEE")}</Text>
                <Text style={styles.date}>{format(day, "MM/dd")}</Text>
                <View style={styles.mealsContainer}>
                  {dayMeals.map((meal) => (
                    <TouchableOpacity key={meal.name} style={[styles.meal, { backgroundColor: meal.color }]} onPress={() => openEditModal(dayString, meal)}>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    padding: 16,
  },
  dayContainer: {
    width: 100,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 16,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: 'black',
  },
  dayName: {
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
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
    color: '#fff',
  },
  noMeal: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    width: '80%',
  },
});

export default MealPlanCalendar;