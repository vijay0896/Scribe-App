// App.js
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { StyleSheet, Text, View, TouchableOpacity, Image,} from "react-native";
import Home from "./screens/homeScreen";
import Add from "./screens/Add";
import Borrow from "./screens/Borrowers";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import { ThemeProvider, useTheme } from "./screens/ThemeContext";

import MyProfile from "./screens/My Profile";
import { NavigationContainer } from "@react-navigation/native";
import SignUp from "./screens/SignUp";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LogBox } from "react-native";
import CustomTabBar from "./screens/CustomTabBar"; // Import CustomTabBar component

// Ignore log notification by message:
LogBox.ignoreLogs(["Warning: ..."]);

// Ignore all log notifications:
LogBox.ignoreAllLogs();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = ({ navigation }) => {
  useEffect(() => {
    LogBox.ignoreLogs(["Warning: ..."]); // Ignore specific logs
    // Add more logs to ignore as needed
  }, []);
  return (
    <ThemeProvider theme={{ mode: "dark" }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#0f0f0f", // Dark background color
            },
            headerTintColor: "#ffffff", // Text color
            
          }}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={({ navigation }) => ({
              headerRight: () => (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => navigation.navigate("Home")}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              ),
              headerStyle: {},
              headerShown: false,
              
            })}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={({}) => ({
              headerStyle: {},
              headerShown: false,
            })}
          />

          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false, headerStyle: {} 
            
          }} // Hide the header for the Home screen
          />
          <Stack.Screen name="Add" component={Add} />
          {/* <Stack.Screen name="Borrow" component={Borrow} options={{ headerShown: false }} /> */}

          <Stack.Screen
            name="Borrow"
            component={Borrow}
            options={{ title: "My profile" }}
          />
          <Stack.Screen
            name="My Profile"
            component={MyProfile}
            options={{
              headerTitle: "My Profile",
              headerTitleStyle: {
                fontWeight: "600",
                justifyContent: "center",
                bottom: 2,
                fontSize: 20,
              },
              headerStyle: {
                backgroundColor: "#AAD4E1",
              },
              headerTintColor: "black",
              headerBackTitleVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const TabNavigator = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />} // Use CustomTabBar component as tabBar
      screenOptions={() => ({
        // Show header only for the Dashboard screen
        headerStyle: {
          backgroundColor: isDarkMode ? "#0f0f0f" : "#fff",// Dark mode header background color
        },
        headerTintColor: isDarkMode ? "#fff" : "#000", // Dark mode header text color
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.goBack()}>
        //     {/* You can customize the back arrow icon here */}
        //     {/* <Icon name="arrow-back" size={24} color="#000" />   */}
        //     <Text>Back</Text> 
        //   </TouchableOpacity>
        // ),
      })}>
      <Tab.Screen
        name="Dashboard"
        component={Home}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="Borrowers"
        component={Borrow}
        options={{ tabBarLabel: "Borrowers", headerShown: true }}
      />
      <Tab.Screen
        name="Add Borrowers Details"
        component={Add}
        options={{ tabBarLabel: "Add", headerShown: true }}
      />
      <Tab.Screen
        name="My Profile"
        component={MyProfile}
        options={{ tabBarLabel: "Account", headerShown: true }}
      />
    </Tab.Navigator>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECF9FF",
  },
  skipButton: {
    marginRight: 10,
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#4285F4",
  },
});
