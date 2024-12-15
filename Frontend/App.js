import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./context/authcontext";
import CustomTabBar from "./Tabs/CustomTabBar";

import LoginScreen from "./screens/AuthScreens/LoginScreen";
import SignupScreen from "./screens/AuthScreens/SignupScreen";
import ForgotPasswordScreen from "./screens/AuthScreens/ForgotPasswordScreen";
import ResetPasswordConfrim from "./screens/AuthScreens/ResetPasswordConfrim";
import HomeScreen from "./screens/HomeScreen";
import Borrow from "./screens/Borrow";
import Add from "./screens/AddScreen";
import MyProfile from "./screens/MyAccount";
import LoanDetails from "./screens/LoanDetails";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StackNav = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="MyProfile" component={MyProfile} />
    <Stack.Screen name="Borrowers" component={Borrow} />
    <Stack.Screen name="AddBorrowersDetails" component={Add} />
    <Stack.Screen name="LoginNav" component={LoginScreen} />
   
  </Stack.Navigator>
);

const BorrowersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Borrowers" component={Borrow} />
    <Stack.Screen name="LoanDetails" component={LoanDetails} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerStyle: {
        backgroundColor: "#EDEDF4",
        borderBottomWidth: 0,
        height: 82,
      },
      headerTintColor: "#616161",
      headerTitleStyle: {
        fontWeight: "800",
        fontFamily: "Rubik-Medium",
      },
    }}
  >
    <Tab.Screen name="Dashboard" component={StackNav} options={{ tabBarLabel: "Dashboard" }} />
    <Tab.Screen name="Borrowers" component={BorrowersStack} options={{ tabBarLabel: "Borrowers" }} />
    <Tab.Screen name="Add" component={Add} options={{ tabBarLabel: "Add" }} />
    <Tab.Screen name="Account" component={MyProfile} options={{ tabBarLabel: "Account" }} />
  </Tab.Navigator>
);

const LoginNav = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: "Forgot Password" }}
    />
    <Stack.Screen
      name="ResetPasswordConfirm"
      component={ResetPasswordConfrim}
      options={{ title: "Reset Password" }}
    />
    <Stack.Screen name="LoanDetails" component={LoanDetails} />
    <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        "Rubik-Black": require("./assets/fonts/Rubik/Rubik-Black.ttf"),
        "Rubik-Regular": require("./assets/fonts/Rubik/Rubik-Regular.ttf"),
        "Rubik-Medium": require("./assets/fonts/Rubik/Rubik-Medium.ttf"),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Error loading fonts", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (loggedIn) setIsLoggedIn(JSON.parse(loggedIn));
    } catch (error) {
      console.error("Failed to fetch login status", error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Local storage cleared");
    } catch (error) {
      console.error("Error clearing storage", error);
    }
  };

 
  useEffect(() => {
    loadFonts();
    checkLoginStatus();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <AuthProvider>{isLoggedIn ? <TabNavigator /> : <LoginNav />}</AuthProvider>
    </NavigationContainer>
  );
}
