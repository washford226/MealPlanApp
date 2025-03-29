import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ViewReviewsProps {
  meal: Meal; // The meal for which reviews are being displayed
  onBack: () => void; // Callback to navigate back
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const ViewReviews: React.FC<ViewReviewsProps> = ({ meal, onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "You are not logged in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BASE_URL}/reviews?meal_id=${meal.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        Alert.alert("Error", "Failed to fetch reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [meal.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No reviews available for this meal.</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews for {meal.name}</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.rating}>Rating: {item.rating}/5</Text>
            <Text style={styles.comment}>{item.comment}</Text>
            <Text style={styles.date}>Reviewed on: {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ViewReviews;