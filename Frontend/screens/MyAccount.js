import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/authcontext";
import { BASE_URLS } from "../Utils/config";
//Vijaychoudhary6059@gmail.com
const AccountScreen = () => {
  const { state, dispatch, setIsLoggedIn } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["isLoggedIn", "@auth"]);
      setIsLoggedIn(false);
      navigation.navigate("LoginNav");
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${BASE_URLS}/api/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      setError("Unable to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.token) fetchUserDetails();
  }, [state.token]);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar animated={true} hidden={true} />
      {userDetails ? (
        <>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userDetails.username?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.username}>{userDetails.username}</Text>
          <Text style={styles.email}>{userDetails.email}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noDataText}>No user data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.6,
    borderColor: "#6183FE",
  },
  avatarText: {
    fontSize: 50,
    color: "#6183FE",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#888",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#6183FE",
    width: "80%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#000",
    marginTop: 10,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    marginTop: 20,
  },
});

export default AccountScreen;
