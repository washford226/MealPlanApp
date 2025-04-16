import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
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
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "@/types/types";
import StarRating from "react-native-star-rating-widget";
import { useTheme } from "@/context/ThemeContext";

interface OtherMealsProps {
  onMealSelect: (meal: Meal) => void;
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const OtherMeals: React.FC<OtherMealsProps> = ({ onMealSelect }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<{ type: string; greaterThan: string; lessThan: string }[]>([
    { type: "calories", greaterThan: "", lessThan: "" },
    { type: "fat", greaterThan: "", lessThan: "" },
    { type: "protein", greaterThan: "", lessThan: "" },
    { type: "carbohydrates", greaterThan: "", lessThan: "" },
  ]);

  const { theme } = useTheme();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedFilters = await AsyncStorage.getItem("filters");
        const savedSearchQuery = await AsyncStorage.getItem("searchQuery"); // Load saved search query
    
        if (savedSearchQuery) {
          setSearchQuery(savedSearchQuery); // Restore search query
        }
    
        const response = await axios.get(`${BASE_URL}/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: savedSearchQuery || searchQuery, // Use restored or current search query
            filters: savedFilters, // Send saved filters as a query parameter
          },
        });
    
        setMeals(response.data);
        setFilteredMeals(response.data); // Automatically set filtered meals
      } catch (error) {
        console.error("Error fetching meals:", error);
        Alert.alert("Error", "Failed to fetch meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const applyFilters = async () => {
      try {
        // Save filters to AsyncStorage
        await AsyncStorage.setItem("filters", JSON.stringify(filters));
    
        const filtered = meals.filter((meal) => {
          // Apply filters
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
            meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meal.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
          return passesFilters && passesSearch;
        });
    
        setFilteredMeals(filtered);
        setIsFilterModalVisible(false);
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    };
    
    const loadFiltersAndApply = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem("filters");
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          setFilters(parsedFilters);
    
          // Automatically apply the filters and search query
          const filtered = meals.filter((meal) => {
            // Apply filters
            const passesFilters = parsedFilters.every((filter: { type: string; greaterThan: string; lessThan: string }) => {
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
              meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              meal.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
            return passesFilters && passesSearch;
          });
    
          setFilteredMeals(filtered);
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
  
    fetchMeals();
    loadFiltersAndApply(); // Restore and apply filters when the component mounts
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading meals...</Text>
      </View>
    );
  }

  function applyFilters(): void {
    const filtered = meals.filter((meal) => {
      return filters.every((filter) => {
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
    });

    setFilteredMeals(filtered);
    setIsFilterModalVisible(false);

    // Save filters to AsyncStorage for persistence
    AsyncStorage.setItem("filters", JSON.stringify(filters)).catch((error) => {
      console.error("Error saving filters:", error);
    });
  }

  function handleSearchChange(text: string): void {
    setSearchQuery(text); // Update the search query state
    AsyncStorage.setItem("searchQuery", text).catch((error) => {
      console.error("Error saving search query:", error);
    });
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

      {/* Meals List or No Results Message */}
      {filteredMeals.length > 0 ? (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.mealItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity onPress={() => onMealSelect(item)}>
                <Text style={[styles.mealName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.mealDescription, { color: theme.subtext }]}>{item.description}</Text>
                <Text style={[styles.mealUser, { color: theme.subtext }]}>By: {item.userName}</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={[styles.noMealsText, { color: theme.text }]}>No meals match your search.</Text>
      )}

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filter Meals</Text>

            {/* Header Row for Labels */}
            <View style={styles.filterHeaderRow}>
              <Text style={[styles.filterHeaderLabel, { color: theme.text }]}>Filter Type</Text>
              <Text style={[styles.filterHeaderLabel, { color: theme.text }]}>Greater Than</Text>
              <Text style={[styles.filterHeaderLabel, { color: theme.text }]}>Less Than</Text>
            </View>

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
    paddingBottom: 50,
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
  picker: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    flex: 1, // Ensures the input takes up available space
    height: 50, // Reduced height
    borderWidth: 1,
    borderRadius: 6, // Slightly smaller border radius
    paddingHorizontal: 6, // Reduced horizontal padding
    marginHorizontal: 4, // Reduced margin between inputs
    fontSize: 14, // Slightly smaller font size
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addFilterText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  removeFilterText: {
    fontSize: 14,
    marginLeft: 8,
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterHeaderLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OtherMeals;