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
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";
import { useTheme } from "@/context/ThemeContext";

interface MyMealsProps {
  onMealSelect: (meal: Meal) => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const MyMeals: React.FC<MyMealsProps> = ({ onMealSelect }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{ type: string; greaterThan: string; lessThan: string }[]>([
    { type: "calories", greaterThan: "", lessThan: "" },
    { type: "fat", greaterThan: "", lessThan: "" },
    { type: "protein", greaterThan: "", lessThan: "" },
    { type: "carbohydrates", greaterThan: "", lessThan: "" },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    const fetchMyMeals = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedFilters = await AsyncStorage.getItem("filters");
        const savedSearchQuery = await AsyncStorage.getItem("searchQuery");

        if (!token) {
          Alert.alert("Error", "User not authenticated. Please log in.");
          return;
        }

        if (savedFilters) {
          setFilters(JSON.parse(savedFilters)); // Restore filters
        }

        if (savedSearchQuery) {
          setSearchQuery(savedSearchQuery); // Restore search query
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
    // Apply filters and search query
    const filtered = meals.filter((meal) => {
      const passesFilters = filters.every((filter) => {
        const greaterThanValue = parseFloat(filter.greaterThan);
        const lessThanValue = parseFloat(filter.lessThan);

        if (filter.type in meal) {
          const mealValue = parseFloat(meal[filter.type as keyof Meal] as unknown as string);

          // Apply "greater than" filter if a value is provided
          if (!isNaN(greaterThanValue) && mealValue <= greaterThanValue) {
            return false;
          }

          // Apply "less than" filter if a value is provided
          if (!isNaN(lessThanValue) && mealValue >= lessThanValue) {
            return false;
          }
        }

        return true;
      });

      // Apply search query
      const passesSearch =
        !searchQuery ||
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase());

      return passesFilters && passesSearch;
    });

    setFilteredMeals(filtered);
  }, [searchQuery, filters, meals]);

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text); // Update the search query state
    try {
      await AsyncStorage.setItem("searchQuery", text); // Save the search query to AsyncStorage
    } catch (error) {
      console.error("Error saving search query:", error);
    }
  };

  const applyFilters = async () => {
    try {
      await AsyncStorage.setItem("filters", JSON.stringify(filters)); // Save filters to AsyncStorage
      setIsFilterModalVisible(false); // Close the filter modal
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

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
          onChangeText={handleSearchChange} // Save search query when it changes
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.button }]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Text style={[styles.filterButtonText, { color: theme.buttonText }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Meal List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.mealItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => onMealSelect(item)}
          >
            <Text style={[styles.mealName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.mealDescription, { color: theme.subtext }]}>{item.description}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 60 }} // Add padding to the bottom of the list
      />
      

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filter Meals</Text>
            {filters.map((filter, index) => (
              <View key={index} style={styles.filterRow}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>
                  {filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}
                </Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Greater than"
                  placeholderTextColor={theme.placeholder}
                  value={filter.greaterThan}
                  onChangeText={(text) => {
                    const updatedFilters = [...filters];
                    updatedFilters[index].greaterThan = text;
                    setFilters(updatedFilters);
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Less than"
                  placeholderTextColor={theme.placeholder}
                  value={filter.lessThan}
                  onChangeText={(text) => {
                    const updatedFilters = [...filters];
                    updatedFilters[index].lessThan = text;
                    setFilters(updatedFilters);
                  }}
                  keyboardType="numeric"
                />
              </View>
            ))}
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: theme.button }]} onPress={applyFilters}>
              <Text style={[styles.applyButtonText, { color: theme.buttonText }]}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.danger }]}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.buttonText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    {/* Add Meal Button */}
    <TouchableOpacity
      style={[styles.addMealButton, { backgroundColor: theme.button }]}
      onPress={() => {
        // Add your navigation or action logic here
        Alert.alert("Add Meal", "Navigate to Add Meal screen");
      }}
    >
      <Text style={[styles.addMealButtonText, { color: theme.buttonText }]}>Add Meal</Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    fontSize: 14,
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addMealButton: {
    bottom: 40, // Place it above the navigation bar
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addMealButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyMeals;