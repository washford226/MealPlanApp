import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import MealPlanCalendar from '@/components/MealPlanCalendar';
import LoginScreen from '@/components/LoginScreen';
import SignUpScreen from '@/components/SignUpScreen';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleNavigateToSignUp = () => {
    setIsSigningUp(true);
  };

  const handleSignUp = () => {
    setIsSigningUp(false);
  };

  const handleNavigateToLogin = () => {
    setIsSigningUp(false);
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>My Calendar</Text>
          <MealPlanCalendar />
        </>
      ) : isSigningUp ? (
        <SignUpScreen onSignUp={handleSignUp} onNavigateToLogin={handleNavigateToLogin} />
      ) : (
        <LoginScreen onLogin={handleLogin} onNavigateToSignUp={handleNavigateToSignUp} />
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