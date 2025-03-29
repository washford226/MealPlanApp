import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import LoginScreen from "@/components/LoginScreen";
import SignUpScreen from "@/components/SignUpScreen";
import AccountScreen from "@/components/AccountScreen";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen";
import OtherMeals from "@/components/OtherMeals";
import MealDetails from "@/components/MealDetails";
import CreateReview from "@/components/CreateReview";
import ViewReviews from "@/components/ViewReviews"; // Import ViewReviews
import Icon from "react-native-vector-icons/FontAwesome";
import { Meal } from "@/types/types";

function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isAccountScreen, setIsAccountScreen] = useState(false);
  const [isForgotPasswordScreen, setIsForgotPasswordScreen] = useState(false);
  const [isOtherMealsScreen, setIsOtherMealsScreen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [isViewingReviews, setIsViewingReviews] = useState(false); // New state for viewing reviews

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
    setIsForgotPasswordScreen(false);
  };

  const handleNavigateToAccount = () => {
    setIsAccountScreen(true);
  };

  const handleBackToCalendar = () => {
    setIsAccountScreen(false);
    setIsOtherMealsScreen(false);
    setSelectedMeal(null);
  };

  const handleNavigateToForgotPassword = () => {
    setIsForgotPasswordScreen(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordScreen(false);
  };

  const handleNavigateToOtherMeals = () => {
    setIsAccountScreen(false);
    setIsOtherMealsScreen(true);
    setSelectedMeal(null);
  };

  const handleNavigateToMealDetails = (meal: Meal): void => {
    setSelectedMeal(meal);
  };

  const handleAddReview = (meal: Meal): void => {
    setSelectedMeal(meal);
    setIsCreatingReview(true); // Navigate to CreateReview screen
  };

  const handleViewReviews = (meal: Meal): void => {
    setSelectedMeal(meal);
    setIsViewingReviews(true); // Navigate to ViewReviews screen
  };

  const handleReviewSubmit = () => {
    setIsCreatingReview(false);
    setSelectedMeal(null);
    // Optionally refresh the meals list or show a success message
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        isCreatingReview && selectedMeal ? (
          <CreateReview
            meal={selectedMeal}
            onReviewSubmit={handleReviewSubmit}
            onCancel={() => setIsCreatingReview(false)}
          />
        ) : isViewingReviews && selectedMeal ? (
          <ViewReviews
            meal={selectedMeal}
            onBack={() => setIsViewingReviews(false)} // Navigate back to MealDetails
          />
        ) : selectedMeal ? (
          <MealDetails
            meal={selectedMeal}
            onBack={() => setSelectedMeal(null)}
            onAddReview={handleAddReview} // Pass the Add Review handler
            onViewReviews={handleViewReviews} // Pass the View Reviews handler
          />
        ) : isAccountScreen ? (
          <>
            <AccountScreen onLogout={() => setIsLoggedIn(false)} />
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.barButton} onPress={handleBackToCalendar}>
                <Icon name="calendar" size={24} color="#000" />
                <Text style={styles.barButtonText}>Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton}>
                <Icon name="plus" size={24} color="#000" />
                <Text style={styles.barButtonText}>Middle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToOtherMeals}>
                <Icon name="cutlery" size={24} color="#000" />
                <Text style={styles.barButtonText}>Other Meals</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToAccount}>
                <Icon name="user" size={24} color="#000" />
                <Text style={styles.barButtonText}>Account</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : isOtherMealsScreen ? (
          <>
            <OtherMeals
              onMealSelect={handleNavigateToMealDetails}
            />
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.barButton} onPress={handleBackToCalendar}>
                <Icon name="calendar" size={24} color="#000" />
                <Text style={styles.barButtonText}>Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton}>
                <Icon name="plus" size={24} color="#000" />
                <Text style={styles.barButtonText}>Middle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToOtherMeals}>
                <Icon name="cutlery" size={24} color="#000" />
                <Text style={styles.barButtonText}>Other Meals</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToAccount}>
                <Icon name="user" size={24} color="#000" />
                <Text style={styles.barButtonText}>Account</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Calendar</Text>
            </View>
            <MealPlanCalendar />
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.barButton} onPress={handleBackToCalendar}>
                <Icon name="calendar" size={24} color="#000" />
                <Text style={styles.barButtonText}>Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton}>
                <Icon name="plus" size={24} color="#000" />
                <Text style={styles.barButtonText}>Middle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToOtherMeals}>
                <Icon name="cutlery" size={24} color="#000" />
                <Text style={styles.barButtonText}>Other Meals</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.barButton} onPress={handleNavigateToAccount}>
                <Icon name="user" size={24} color="#000" />
                <Text style={styles.barButtonText}>Account</Text>
              </TouchableOpacity>
            </View>
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
          onNavigateForgotPassword={handleNavigateToForgotPassword}
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
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 60,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: "absolute",
    bottom: 0,
  },
  barButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  barButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Index;