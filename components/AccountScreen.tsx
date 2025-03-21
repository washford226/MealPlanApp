import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Button, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

interface AccountScreenProps {
  onBackToCalendar: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ onBackToCalendar, onLogout, onChangePassword }) => {
  const [username, setUsername] = useState<string>('');
  const [caloriesGoal, setCaloriesGoal] = useState<number | null>(null);
  const [isEditingCaloriesGoal, setIsEditingCaloriesGoal] = useState<boolean>(false);
  const [newCaloriesGoal, setNewCaloriesGoal] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('');
  const [isEditingDietaryRestrictions, setIsEditingDietaryRestrictions] = useState<boolean>(false);
  const [newDietaryRestrictions, setNewDietaryRestrictions] = useState<string>('');

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://10.0.2.2:5000/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsername(response.data.username);
        setCaloriesGoal(response.data.calories_goal);
        setDietaryRestrictions(response.data.dietary_restrictions);
        if (response.data.profile_picture) {
          setProfilePicture(`data:image/jpeg;base64,${response.data.profile_picture}`);
        }
        console.log('Fetched profile picture:', response.data.profile_picture); // Debugging log
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.delete('http://10.0.2.2:5000/userdelete', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Account deleted successfully');
        handleLogout();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  // Handle editing calories goal
  const handleEditCaloriesGoal = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put('http://10.0.2.2:5000/user/calories-goal', {
        calories_goal: newCaloriesGoal
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setCaloriesGoal(parseInt(newCaloriesGoal, 10));
        setIsEditingCaloriesGoal(false);
        Alert.alert('Success', 'Calories goal updated successfully');
      }
    } catch (error) {
      console.error('Error updating calories goal:', error);
      Alert.alert('Error', 'Failed to update calories goal');
    }
  };

  // Handle editing dietary restrictions
  const handleEditDietaryRestrictions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put('http://10.0.2.2:5000/user/dietary-restrictions', {
        dietary_restrictions: newDietaryRestrictions
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setDietaryRestrictions(newDietaryRestrictions);
        setIsEditingDietaryRestrictions(false);
        Alert.alert('Success', 'Dietary restrictions updated successfully');
      }
    } catch (error) {
      console.error('Error updating dietary restrictions:', error);
      Alert.alert('Error', 'Failed to update dietary restrictions');
    }
  };

  // Handle uploading profile picture
  const handleUploadProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      if (!profilePicture) {
        throw new Error('No profile picture selected');
      }

      const formData = new FormData();
      formData.append('profile_picture', {
        uri: profilePicture,
        type: 'image/jpeg',
        name: 'profile_picture.jpg'
      } as any);

      const response = await axios.post('http://10.0.2.2:5000/upload-profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Profile picture uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  // Handle picking an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      console.log('Selected profile picture:', result.assets[0].uri); // Debugging log
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button to navigate back to the calendar */}
      <TouchableOpacity style={styles.backButton} onPress={onBackToCalendar}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Account Screen</Text>
      <Text>Welcome, {username}!</Text>
      {profilePicture && (
        <Image
          source={{ uri: profilePicture }}
          style={styles.profilePicture}
        />
      )}
      <View style={styles.row}>
        <Text style={styles.leftAlignText}>Calories Goal: {caloriesGoal}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingCaloriesGoal(true)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      {isEditingCaloriesGoal && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter new calories goal"
            value={newCaloriesGoal}
            onChangeText={setNewCaloriesGoal}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={handleEditCaloriesGoal}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditingCaloriesGoal(false)}>
            <Text style={{ color: 'red', marginTop: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.leftAlignText}>Dietary Restrictions: {dietaryRestrictions}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingDietaryRestrictions(true)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      {isEditingDietaryRestrictions && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter new dietary restrictions"
            value={newDietaryRestrictions}
            onChangeText={setNewDietaryRestrictions}
          />
          <TouchableOpacity onPress={handleEditDietaryRestrictions}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditingDietaryRestrictions(false)}>
            <Text style={{ color: 'red', marginTop: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={pickImage}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Pick Profile Picture</Text>
      </TouchableOpacity>
      {profilePicture && (
        <View>
          <Text>Selected Picture: {profilePicture}</Text>
          <Button title="Upload Profile Picture" onPress={handleUploadProfilePicture} />
        </View>
      )}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: 'red', marginTop: 20 }}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onChangePassword}>
        <Text style={{ color: 'green', marginTop: 20 }}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDeleteAccount}>
        <Text style={{ color: 'purple', marginTop: 20 }}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  leftAlignText: {
    textAlign: 'left',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 5,
    marginVertical: 10,
  },
});

export default AccountScreen;