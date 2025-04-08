import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";
import { useTheme } from "@/context/ThemeContext"; // Import the ThemeContext

interface MyMealsProps {
  onMealSelect: (meal: Meal) => void; // Callback for selecting a meal
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MyMeals: React.FC<MyMealsProps> = ({ onMealSelect }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { theme } = useTheme(); // Access the current theme

  useEffect(() => {
    const fetchMyMeals = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "User not authenticated. Please log in.");
          return;
        }

        const response = await axios.get(`${BASE_URL}/my-meals`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMeals(response.data);
        setFilteredMeals(response.data); // Initialize filteredMeals with all meals
      } catch (error) {
        console.error("Error fetching meals:", error);
        Alert.alert("Error", "Failed to fetch meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyMeals();
  }, []);

  useEffect(() => {
    // Filter meals based on the search query
    const filtered = meals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMeals(filtered);
  }, [searchQuery, meals]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading your meals...</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.noMealsText, { color: theme.text }]}>No meals found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.searchBar, { borderColor: theme.text, color: theme.text }]}
        placeholder="Search meals..."
        placeholderTextColor={theme.text}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.mealItem, { backgroundColor: theme.background, borderColor: theme.text }]}
            onPress={() => onMealSelect(item)} // Call the onMealSelect callback
          >
            <Text style={[styles.mealName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.mealDescription, { color: theme.text }]}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  mealItem: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mealDescription: {
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  noMealsText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default MyMeals;