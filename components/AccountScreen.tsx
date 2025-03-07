import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccountScreenProps {
  onBackToCalendar: () => void;
  onLogout: () => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ onBackToCalendar, onLogout }) => {
  const [username, setUsername] = useState<string>('');

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
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Account Screen</Text>
      <Text>Welcome, {username}!</Text>
      <TouchableOpacity onPress={onBackToCalendar}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Back to Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: 'red', marginTop: 20 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountScreen;