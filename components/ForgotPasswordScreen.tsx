import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { Platform } from "react-native";

const ForgotPasswordScreen = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const [email, setEmail] = useState("");

  const getBaseUrl = () => {
    return Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
  };

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post(`${getBaseUrl()}/forgot-password`, { email });

      if (response.status === 200) {
        Alert.alert("Success", "An email with your username and password has been sent.");
        onBackToLogin(); // Use the onBackToLogin prop to navigate back
      }
    } catch (error) {
      console.error("Error sending forgot password email:", error);

      // Ensure the error message is wrapped in a string
      Alert.alert("Error", "Failed to send email. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Username or Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <View style={styles.buttonSpacing} />
      <Button title="Send Email" onPress={handleForgotPassword} />
      <View style={styles.buttonSpacing} />
      <Button title="Back to Login" onPress={onBackToLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: "80%",
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  buttonSpacing: {
    height: 16, // Add space between buttons
  },
});

export default ForgotPasswordScreen;