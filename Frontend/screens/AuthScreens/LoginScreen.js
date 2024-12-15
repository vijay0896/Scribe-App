import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/authcontext";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import axios from "axios";
import Svg, { Path } from "react-native-svg";
import { BASE_URLS}  from "../../Utils/config"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  //global state
  const {state, setState} = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {setIsLoggedIn} = useContext(AuthContext);
  const Mail01Icon = (props) => (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      color={"#9E9E9E"}
      fill={"none"}
      {...props}
    >
      <Path
        d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
  const LockIcon = (props) => (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      color={"#9b9b9b"}
      fill={"none"}
      {...props}
    >
      <Path
        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <Path
        d="M12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 13L12 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
  const handleLogin = async () => {
    try {
      setLoading(true);
  
      // Validate input
      if (!email || !password) {
        Alert.alert("Please fill all fields");
        setLoading(false);
        return;
      }
  
      // Make the login request using fetchWithFallback
      const response = await fetch(`${BASE_URLS}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Save login data to AsyncStorage
        await AsyncStorage.setItem("@auth", JSON.stringify(data));
        await AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
  
        Alert.alert("Login successful");
        navigation.navigate("Home");
      } else {
        const errorData = await response.json();
        
        // If username or password is incorrect, show an alert
        if (errorData.message === "Invalid credentials") {
          Alert.alert("Invalid credentials", "Please check your username and password.");
        } else {
          throw new Error(errorData.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  

  // Function to check local storage data
  const getLocalStorageData = async () => {
    let data = await AsyncStorage.getItem("@auth");
    console.log("Local Storage ==> ", data);
  };

  getLocalStorageData();

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hey,</Text>
      <Text style={styles.welcomeSubText}>Welcome Back</Text>
      <View style={styles.inputWithIcon}>
        <Mail01Icon color="#9E9E9E" />
        <TextInput
          style={styles.inputIconText}
          keyboardType="email-address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWithIcon}>
        <LockIcon color="#9E9E9E" />
        <TextInput
          style={styles.inputIconText}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Custom TouchableOpacity Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.continueText}>Or Continue with</Text>

      <Text style={styles.signupText}>
        Don’t have an Account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("Signup")}
        >
          Sign-Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F8FF", // Light background color
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 6,
    color: "#616161", // Darker text color
  },
  welcomeSubText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 50,
    color: "#616161",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "rgba(138, 141, 147, 0.08)",
    borderWidth: 1,
    paddingHorizontal: 30,
    borderRadius: 128,
    backgroundColor: "rgba(138, 141, 147, 0.08)",
    marginBottom: 25,
    height: 56,
  },
  inputIconText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    paddingLeft: 10,
    color: "#9E9E9E",
  },

  forgotPasswordText: {
    color: "#666",
    fontWeight: "600",
    textAlign: "right",
    marginTop: 0,
  },
  loginButton: {
    backgroundColor: "#2979ff", // Blue button color
    paddingVertical: 14,
    borderRadius: 128,
    alignItems: "center",
    marginTop: 40,
    height: 54,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  continueText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 20,
    fontWeight: "600",
  },
  signupText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,

    fontWeight: "600",
  },
  signupLink: {
    color: "#2979ff",
  },
});
