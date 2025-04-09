import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const logo = require("../assets/images/logo-transparent-png.png"); // Update the path if the file name or location is different

const LoginScreen = ({
  onLogin,
  onNavigateToSignUp,
  onNavigateForgotPassword,
}: {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateForgotPassword: () => void;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000"}/login`, {
        username,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem("token", token);
        onLogin();
      }
    } catch (error) {
      Alert.alert("Error", "Invalid username or password.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={logo} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Login</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          textAlign="left"
        />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          textAlign="left"
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Text style={styles.showPasswordText}>{isPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onNavigateToSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNavigateForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot username or password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%", // Ensure the container spans the full width
  },
  logo: {
    width: 120, // Adjust the width of the logo
    height: 120, // Adjust the height of the logo
    marginBottom: 16, // Add spacing below the logo
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  inputContainer: {
    width: "100%", // Ensure the container stretches across the screen
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 8, // Add padding inside the container
  },
  input: {
    width: "100%", // Explicitly set the width of the TextInput
    paddingVertical: 12,
    fontSize: 16, // Ensure consistent font size
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row", // Align the password input and button horizontally
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 8, // Add padding inside the container
  },
  passwordInput: {
    flex: 1, // Allow the password input to take up available space
    paddingVertical: 12, // Match the padding of the input field
    fontSize: 16, // Ensure consistent font size
  },
  showPasswordButton: {
    marginLeft: 8, // Add spacing between the input and the button
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#007bff",
  },
  showPasswordText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    width: "100%", // Ensure the button spans the full width
    paddingVertical: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordText: {
    color: "#007bff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

export default LoginScreen;