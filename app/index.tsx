import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import LoginScreen from "@/components/LoginScreen";
import SignUpScreen from "@/components/SignUpScreen";
import AccountScreen from "@/components/AccountScreen";
import ChangePasswordScreen from "@/components/ChangePasswordScreen";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen"; // Import the ForgotPasswordScreen
import Icon from "react-native-vector-icons/FontAwesome";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isAccountScreen, setIsAccountScreen] = useState(false);
  const [isChangePasswordScreen, setIsChangePasswordScreen] = useState(false);
  const [isForgotPasswordScreen, setIsForgotPasswordScreen] = useState(false); // Add state for forgot password screen

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
    setIsForgotPasswordScreen(false); // Ensure we navigate back to login
  };

  const handleNavigateToAccount = () => {
    setIsAccountScreen(true);
  };

  const handleBackToCalendar = () => {
    setIsAccountScreen(false);
  };

  const handleChangePassword = () => {
    setIsChangePasswordScreen(true);
  };

  const handleBackToAccount = () => {
    setIsChangePasswordScreen(false);
  };

  const handleNavigateToForgotPassword = () => {
    setIsForgotPasswordScreen(true); // Navigate to ForgotPasswordScreen
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordScreen(false); // Navigate back to LoginScreen
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        isChangePasswordScreen ? (
          <ChangePasswordScreen onBackToAccount={handleBackToAccount} />
        ) : isAccountScreen ? (
          <AccountScreen
            onBackToCalendar={handleBackToCalendar}
            onLogout={() => setIsLoggedIn(false)}
            onChangePassword={handleChangePassword}
          />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Calendar</Text>
              <TouchableOpacity onPress={handleNavigateToAccount}>
                <Icon name="user" size={30} color="#000" />
              </TouchableOpacity>
            </View>
            <MealPlanCalendar />
          </>
        )
      ) : isSigningUp ? (
        <SignUpScreen onSignUp={handleSignUp} onNavigateToLogin={handleNavigateToLogin} />
      ) : isForgotPasswordScreen ? (
        <ForgotPasswordScreen onBackToLogin={handleBackToLogin} />
      ) : (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToSignUp={handleNavigateToSignUp}
          onNavigateForgotPassword={handleNavigateToForgotPassword} // Pass navigation to ForgotPasswordScreen
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
});