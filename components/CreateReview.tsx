import React, { useState } from "react";
import { Platform } from "react-native";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";
import StarRating from "react-native-star-rating-widget"; // Import the star rating widget
import { useTheme } from "@/context/ThemeContext"; // Import ThemeContext

interface CreateReviewProps {
  meal: Meal; // The meal for which the review is being created
  onReviewSubmit: () => void; // Callback to handle review submission
  onCancel: () => void; // Callback to handle cancel action
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const CreateReview: React.FC<CreateReviewProps> = ({ meal, onReviewSubmit, onCancel }) => {
  const [rating, setRating] = useState<number>(0); // Star rating input
  const [comment, setComment] = useState<string>(""); // Comment input
  const [loading, setLoading] = useState(false); // Loading state

  const { theme } = useTheme(); // Access the theme from ThemeContext

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert("Invalid Rating", "Please select a rating between 1 and 5 stars.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/reviews`,
        {
          meal_id: meal.id,
          rating, // Use the selected star rating
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Your review has been submitted!");
      onReviewSubmit(); // Notify parent component of successful submission
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit your review. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Create Review for {meal.name}</Text>

      {/* Star Rating Component */}
      <StarRating
        rating={rating}
        onChange={setRating}
        maxStars={5}
        starSize={30}
        color="#FFD700" // Gold color for stars
      />

      {/* Comment Input */}
      <TextInput
        style={[styles.input, styles.commentInput, { borderColor: theme.text, color: theme.text }]}
        placeholder="Enter a comment (optional)"
        placeholderTextColor={theme.text}
        multiline
        value={comment}
        onChangeText={setComment}
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.button }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>
            {loading ? "Submitting..." : "Submit Review"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.text }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  commentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

export default CreateReview;