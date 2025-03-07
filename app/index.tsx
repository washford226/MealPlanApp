import 'react-native-gesture-handler';
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MealPlanCalendar from '@/components/MealPlanCalendar';
import LoginScreen from '@/components/LoginScreen';
import SignUpScreen from '@/components/SignUpScreen';
import AccountScreen from '@/components/AccountScreen';
import NewMealScreen from '@/components/NewMealScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isAccountScreen, setIsAccountScreen] = useState(false);

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

  const handleNavigateToAccount = () => {
    setIsAccountScreen(true);
  };

  const handleBackToCalendar = () => {
    setIsAccountScreen(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {isLoggedIn ? (
          isAccountScreen ? (
            <Stack.Screen name="AccountScreen">
              {props => <AccountScreen {...props} onBackToCalendar={handleBackToCalendar} onLogout={() => setIsLoggedIn(false)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="MealPlanCalendar">
                {props => (
                  <>
                    <View style={styles.header}>
                      <Text style={styles.title}>My Calendar</Text>
                      <TouchableOpacity onPress={handleNavigateToAccount}>
                        <Icon name="user" size={30} color="#000" />
                      </TouchableOpacity>
                    </View>
                    <MealPlanCalendar {...props} />
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="NewMealScreen" component={NewMealScreen} />
            </>
          )
        ) : isSigningUp ? (
          <Stack.Screen name="SignUpScreen">
            {props => <SignUpScreen {...props} onSignUp={handleSignUp} onNavigateToLogin={handleNavigateToLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="LoginScreen">
            {props => <LoginScreen {...props} onLogin={handleLogin} onNavigateToSignUp={handleNavigateToSignUp} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
});