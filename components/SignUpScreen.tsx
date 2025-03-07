import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${getBaseUrl()}/signup`, {
        username,
        email,
        password,
      });
      if (response.status === 200) {
        Alert.alert('Success', 'User signed up successfully');
        onSignUp();
      }
    } catch (error) {
      if ((error as any).response && (error as any).response.data) {
        const errorMessage = (error as any).response?.data?.message || 'Failed to sign up';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Failed to sign up');
      }
      console.error('Error signing up:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Back to Login" onPress={onNavigateToLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default SignUpScreen;