import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [caloriesGoal, setCaloriesGoal] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Request media library permissions
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your gallery to pick an image.');
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const getBaseUrl = () => {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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
    if (dietaryRestrictions) formData.append('dietary_restrictions', dietaryRestrictions);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct usage for picking images
      allowsEditing: true,
      aspect: [3, 3],
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
          <Text>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
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
        placeholder="Dietary Restrictions (optional)"
        value={dietaryRestrictions}
        onChangeText={setDietaryRestrictions}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload Profile Picture (optional)</Text>
      </TouchableOpacity>
      {profilePicture && (
        <Image
          source={{ uri: profilePicture }}
          style={styles.profilePicture}
        />
      )}
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
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75, // Makes the image circular
    marginBottom: 10,
    borderWidth: 2, // Optional: Add a border
    borderColor: '#ccc', // Optional: Border color
  },
});

export default SignUpScreen;