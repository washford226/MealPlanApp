import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";
import StarRating from "react-native-star-rating-widget"; // Import the star rating widget
import { useTheme } from "@/context/ThemeContext"; // Import ThemeContext

interface OtherMealsProps {
  onMealSelect: (meal: Meal) => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const OtherMeals: React.FC<OtherMealsProps> = ({ onMealSelect }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme(); // Access the theme from ThemeContext

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
      const filtered = meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(lowercasedQuery) ||
          meal.description.toLowerCase().includes(lowercasedQuery) ||
          meal.userName.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredMeals(filtered);
    }
  }, [searchQuery, meals]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading meals...</Text>
      </View>
    );
  }

  if (filteredMeals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.noMealsText, { color: theme.text }]}>No meals match your search.</Text>
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

      {/* Meals List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.mealItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity onPress={() => onMealSelect(item)}>
              <Text style={[styles.mealName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.mealDescription, { color: theme.subtext }]}>{item.description}</Text>
              <Text style={[styles.mealUser, { color: theme.subtext }]}>By: {item.userName}</Text>
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={Math.round(Math.min(Math.max(Number(item.averageRating || 0), 0), 5))}
                  maxStars={5}
                  starSize={20}
                  color={theme.starColor} // Use theme's starColor
                  enableSwiping={false}
                  onChange={() => {}}
                />
                <Text style={[styles.reviewCount, { color: theme.subtext }]}>
                  ({item.reviewCount} reviews)
                </Text>
              </View>
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
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
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
  listContent: {
    padding: 16,
  },
  mealItem: {
    marginBottom: 16,
    padding: 16,
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
  mealUser: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  noMealsText: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default OtherMeals;