import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onLogin, onNavigateToSignUp }: { onLogin: () => void, onNavigateToSignUp: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${getBaseUrl()}/login`, {
        username,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        // Store the token and use it for subsequent requests
        await AsyncStorage.setItem('token', token);
        onLogin();
      }
    } catch (error) {
      Alert.alert("Invalid credentials", "Please enter the correct username and password.");
      console.error('Error during login:', error);
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Create Account" onPress={onNavigateToSignUp} />
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
});

export default LoginScreen;