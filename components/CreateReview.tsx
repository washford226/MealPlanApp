import React, { useState } from "react";
import { Platform } from "react-native";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Meal } from "@/types/types";

interface CreateReviewProps {
  meal: Meal; // The meal for which the review is being created
  onReviewSubmit: () => void; // Callback to handle review submission
  onCancel: () => void; // Callback to handle cancel action
}

const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const CreateReview: React.FC<CreateReviewProps> = ({ meal, onReviewSubmit, onCancel }) => {
  const [rating, setRating] = useState<string>(""); // Rating input
  const [comment, setComment] = useState<string>(""); // Comment input
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async () => {
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      Alert.alert("Invalid Rating", "Please enter a rating between 1 and 5.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/reviews`,
        {
          meal_id: meal.id,
          rating: Number(rating),
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
    <View style={styles.container}>
      <Text style={styles.title}>Create Review for {meal.name}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a rating (1-5)"
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
      />
      <TextInput
        style={[styles.input, styles.commentInput]}
        placeholder="Enter a comment (optional)"
        multiline
        value={comment}
        onChangeText={setComment}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? "Submitting..." : "Submit Review"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
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
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
  },
});

export default CreateReview;