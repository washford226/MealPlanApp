import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCurrentUser } from '../hooks/useCurrentUser'; // Ensure this file exists or adjust the path
import axios from 'axios'; // Using axios for API calls

const OtherMeals: React.FC = () => {
  const [meals, setMeals] = useState<{ id: number; name: string; userName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useCurrentUser(); // Get the current user's info

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = currentUser?.token; // Safely access the token property
        const response = await axios.get('/meals/other-users', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token for authentication
          },
        });
        setMeals(response.data); // Set the fetched meals
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMeals();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading meals...</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No meals found for other users.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meals from Other Users</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealDetails}>By: {item.userName}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealDetails: {
    fontSize: 14,
    color: '#555',
  },
});

export default OtherMeals;