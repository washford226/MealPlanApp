import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import MealPlanCalendar from '@/components/MealPlanCalendar';
import LoginScreen from '@/components/LoginScreen';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>My Calendar</Text>
          <MealPlanCalendar />
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});