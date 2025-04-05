import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
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
      } catch (error) {
        console.error("Error fetching meals:", error);
        Alert.alert("Error", "Failed to fetch meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading meals...</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No meals available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.mealItem}>
          <TouchableOpacity onPress={() => onMealSelect(item)}>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealDescription}>{item.description}</Text>
            <Text style={styles.mealUser}>By: {item.userName}</Text>
            {/* Star Rating Display */}
            <StarRating
              rating={Math.round(Math.min(Math.max(Number(item.averageRating || 0), 0), 5))} // Clamp the value between 0 and 5
              maxStars={5}
              starSize={20}
              color="#FFD700" // Gold color for stars
              enableSwiping={false} // Disable interaction
              onChange={() => {}} // No-op function to satisfy the required prop
            />
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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