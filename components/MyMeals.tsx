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
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading your meals...</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.noMealsText, { color: theme.text }]}>No meals found.</Text>
        {/* Add Meals Button */}
        <TouchableOpacity style={[styles.addMealButton, { backgroundColor: theme.button }]}>
          <Text style={[styles.addMealButtonText, { color: theme.buttonText }]}>Add Meals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar and Filter Button */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={[styles.searchBar, { borderColor: theme.border, color: theme.text }]}
          placeholder="Search meals..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.button }]}>
          <Text style={[styles.filterButtonText, { color: theme.buttonText }]}>Filter</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.mealItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => onMealSelect(item)} // Call the onMealSelect callback
          >
            <Text style={[styles.mealName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.mealDescription, { color: theme.subtext }]}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Add Meals Button */}
      <TouchableOpacity style={[styles.addMealButton, { backgroundColor: theme.button }]}>
        <Text style={[styles.addMealButtonText, { color: theme.buttonText }]}>Add Meals</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 16, // Ensure content doesn't overlap with the navigation bar
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "bold",
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
  addMealButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 50, // Prevent overlap with the navigation bar
  },
  addMealButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyMeals;