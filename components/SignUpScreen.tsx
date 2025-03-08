import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin }) => {
  // State variables to manage form inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [caloriesGoal, setCaloriesGoal] = useState('');
  const [diataryRestrictions, setDiataryRestrictions] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Function to get the base URL based on the platform
  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  };

  // Function to validate email format
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Function to handle sign-up process
  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (caloriesGoal) formData.append('calories_goal', caloriesGoal);
    if (diataryRestrictions) formData.append('diatary_restrictions', diataryRestrictions);
    if (profilePicture) {
      const uriParts = profilePicture.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('profile_picture', {
        uri: profilePicture,
        name: `profile_picture.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  // Function to handle picking an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button to navigate to login screen */}
      <TouchableOpacity style={styles.backButton} onPress={onNavigateToLogin}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.largeInput}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.largeInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Text>{isPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.largeInput}
        placeholder="Calories Goal (optional)"
        value={caloriesGoal}
        onChangeText={setCaloriesGoal}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.largeInput}
        placeholder="Diatary Restrictions (optional)"
        value={diataryRestrictions}
        onChangeText={setDiataryRestrictions}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload Profile Picture (optional)</Text>
      </TouchableOpacity>
      {profilePicture && <Text style={styles.uploadedText}>Profile picture selected</Text>}
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%', // Increased width
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // Increased width
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '70%',
  },
  showPasswordButton: {
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  uploadedText: {
    marginBottom: 10,
    color: 'green',
  },
});

export default SignUpScreen;