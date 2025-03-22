import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  useEffect(() => {
    const loadCredentials = async () => {
      const storedFailedAttempts = await AsyncStorage.getItem("failedAttempts");
      const storedLockoutTime = await AsyncStorage.getItem("lockoutTime");

      if (storedFailedAttempts) {
        setFailedAttempts(parseInt(storedFailedAttempts, 10));
      }

      if (storedLockoutTime) {
        setLockoutTime(parseInt(storedLockoutTime, 10));
      }
    };

    loadCredentials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lockoutTime && Date.now() >= lockoutTime) {
        setLockoutTime(null);
        setFailedAttempts(0);
        AsyncStorage.removeItem("lockoutTime");
        AsyncStorage.setItem("failedAttempts", "0");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const getBaseUrl = () => {
    return Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
  };

  const handleLogin = async () => {
    if (lockoutTime && Date.now() < lockoutTime) {
      Alert.alert("Too many attempts", "Please wait 5 minutes before trying again.");
      return;
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/login`, {
        username,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem("token", token);
        setFailedAttempts(0);
        await AsyncStorage.setItem("failedAttempts", "0");
        onLogin();
      }
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      await AsyncStorage.setItem("failedAttempts", newFailedAttempts.toString());

      if (newFailedAttempts >= 5) {
        const newLockoutTime = Date.now() + 5 * 60 * 1000;
        setLockoutTime(newLockoutTime);
        await AsyncStorage.setItem("lockoutTime", newLockoutTime.toString());
        Alert.alert("Too many attempts", "Please wait 5 minutes before trying again.");
      } else {
        Alert.alert("Invalid credentials", "Please enter the correct username and password.");
      }

      console.error("Error during login:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Text>{isPasswordVisible ? "Hide" : "Show"}</Text> {/* Wrap text in <Text> */}
        </TouchableOpacity>
      </View>
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.buttonSpacing} />
      <Button title="Create Account" onPress={onNavigateToSignUp} />
      <View style={styles.buttonSpacing} /> {/* Add spacing between the buttons */}
      <Button title="Forgot username or password?" onPress={onNavigateForgotPassword}
      />
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
  },
  showPasswordButton: {
    marginLeft: 8,
  },
  buttonSpacing: {
    height: 16, // Add space between buttons
  },
});

export default LoginScreen;