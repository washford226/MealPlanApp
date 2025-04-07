import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";
import StarRating from "react-native-star-rating-widget"; // Import the star rating widget

interface OtherMealsProps {
  onMealSelect: (meal: Meal) => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const OtherMeals: React.FC<OtherMealsProps> = ({ onMealSelect }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMeals(response.data);
        setFilteredMeals(response.data); // Initialize filteredMeals with all meals
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching meals:", error.response?.data || error.message);
        } else {
          console.error("Error fetching meals:", error);
        }
        Alert.alert("Error", "Failed to fetch meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Filter meals based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMeals(meals); // Show all meals if the search query is empty
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = meals.filter((meal) =>
        meal.name.toLowerCase().includes(lowercasedQuery) ||
        meal.description.toLowerCase().includes(lowercasedQuery) ||
        meal.userName.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredMeals(filtered);
    }
  }, [searchQuery, meals]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading meals...</Text>
      </View>
    );
  }

  if (filteredMeals.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No meals match your search.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search meals..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Meals List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <TouchableOpacity onPress={() => onMealSelect(item)}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealDescription}>{item.description}</Text>
              <Text style={styles.mealUser}>By: {item.userName}</Text>
              <StarRating
                rating={Math.round(Math.min(Math.max(Number(item.averageRating || 0), 0), 5))}
                maxStars={5}
                starSize={20}
                color="#FFD700"
                enableSwiping={false}
                onChange={() => {}}
              />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  mealItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mealDescription: {
    fontSize: 14,
    color: "#555",
  },
  mealUser: {
    fontSize: 12,
    color: "#888",
  },
});

export default OtherMeals;