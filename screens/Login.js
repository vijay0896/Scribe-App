import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Appearance,
  useColorScheme,StatusBar 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../screens/ThemeContext";
import { auth } from "../firebase/firebase.config";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  applyActionCode,
} from "firebase/auth";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [resetEmail, setResetEmail] = useState(null);
  const colorScheme = useColorScheme();
  const { isDarkMode } = useTheme(); // Consume the theme context
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User logged in successfully");
        navigation.replace("Home");
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  const handleSignup = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email to reset password");
      return;
    }

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        Alert.alert(
          "Password Reset Email Sent",
          "Please check your email to reset your password."
        );
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert("Error", errorMessage);
      });
  };
  // Use isDarkMode to conditionally apply styles
  const containerStyle = [styles.container, isDarkMode && styles.darkContainer];
  const formContainerStyle = [
    styles.formContainer,
    isDarkMode && styles.darkFormContainer,
  ];
  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar 
        hidden={false} 
        backgroundColor={isDarkMode ? "#0f0f0f" : "#fff"}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent={true}
      />
      <Text
        style={[styles.title, { color: isDarkMode ? "#575DFB" : "#575DFB" }]}>
        Login
      </Text>
      <Text style={[styles.Lable, { color: isDarkMode ? "#F6F5F5" : "#121212" }]}>
        Login now to track all your {"\n"}Borrowers Details!
      </Text>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDarkMode ? "#F6F5F5" : "#121212" }]}>
          Email
        </Text>
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#F6F5F5" : "#121212" }]}
          onChangeText={(text) => {
            setEmail(text);
            setResetEmail(text);
            // Calculate the sum here if needed
          }}
          placeholder="Ex: abc@example.com"
          placeholderTextColor={colorScheme === "dark" ? "#F6F5F5" : "gray"}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.label, { color: isDarkMode ? "#F6F5F5" : "#121212" }]}>
          Your Password
        </Text>
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#F6F5F5" : "#121212" }]}
          onChangeText={(text) => setPassword(text)}
          placeholder="••••••••"
          placeholderTextColor={colorScheme === "dark" ? "#F6F5F5" : "gray"}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}>
        <Text
          style={[
            styles.forgotPasswordText,
            { color: isDarkMode ? "#F6F5F5" : "#575DFB" },
          ]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.loginButton,
          { backgroundColor: isDarkMode ? "#575DFB" : "#575DFB" },
        ]}
        onPress={handleLogin}>
        <Text style={[styles.buttonText]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSignup}
        style={[
          styles.buttonContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}>
        <Text>
          <Text
            style={[
              styles.haveAccountText,
              { color: isDarkMode ? "#F6F5F5" : "#121212" },
            ]}>
            Don't have an account?
          </Text>

          <Text style={[styles.loginText, { color: "#575DFB" }]}> Register</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("Home")}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#F3F8FF",
    width: "100%",
  },
  darkContainer: {
    backgroundColor: "#0f0f0f",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
   
   paddingLeft: 20,

    marginBottom: 8,
  },
  Lable: {
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 20,
    marginBottom: 15,
  },
  label: {
    marginBottom: 0,
    color: "white",
    // Adjust the color as per your design
  },

  inputContainer: {
    width: "88%",
    marginBottom: 0,
    alignSelf: "center",
    marginTop: 10,
  },
  input: {
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: "#575DFB",
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    paddingLeft: 10,
  },

  loginButton: {
    backgroundColor: "#575DFB",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,

    width: "88%",
    alignSelf: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "#F6F5F5",
    fontSize: 14.5,
    textAlign: "center",
    fontWeight: "bold",
  },

  signupText: {
    color: "#000",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
  },

  forgotPasswordText: {
    color: "#000",
    fontSize: 13,
    marginBottom: 10,
    paddingRight: 25,
    textDecorationLine:"underline",
    fontWeight: "bold",
  },

  forgotPassword: {
    textAlign: "right",
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  skipButton: {
    // Add styles for skip button
    // borderWidth:1,
    // borderColor: "white",
    marginTop: 20,
    width:50,
    alignSelf:"center",
  },
  skipButtonText: {
    fontSize: 16,
    color: "#4285F4",
    textAlign:"center",
    fontWeight: "bold",
    
  },
  haveAccountText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  loginText: {
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Login;
