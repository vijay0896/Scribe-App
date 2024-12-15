import React, { useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { AuthContext } from "../../context/authcontext";
import Svg, { Path } from "react-native-svg";
import { BASE_URLS}  from "../../Utils/config"
export default function SignupScreen({ navigation }) {
  const [username, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // global state
  const {state, setState} = useContext(AuthContext);
  const UserIcon = (props) => (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      color="#9b9b9b"
      fill="none"
      {...props}
    >
      <Path
        d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Svg>
  );

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
  const SmartPhone01Icon = (props) => (
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
        d="M5 9C5 5.70017 5 4.05025 6.02513 3.02513C7.05025 2 8.70017 2 12 2C15.2998 2 16.9497 2 17.9749 3.02513C19 4.05025 19 5.70017 19 9V15C19 18.2998 19 19.9497 17.9749 20.9749C16.9497 22 15.2998 22 12 22C8.70017 22 7.05025 22 6.02513 20.9749C5 19.9497 5 18.2998 5 15V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M11 19H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 2L9.089 2.53402C9.28188 3.69129 9.37832 4.26993 9.77519 4.62204C10.1892 4.98934 10.7761 5 12 5C13.2239 5 13.8108 4.98934 14.2248 4.62204C14.6217 4.26993 14.7181 3.69129 14.911 2.53402L15 2"
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

  const handleSignup = async () => {
    const urls = [
      //for render
      // "https://loanapp-server.onrender.com/api/auth/register",

      `${BASE_URLS}/api/auth/register`,
      // "http://10.21.12.49:8080/api/auth/register",
    ];

    try {
      setLoading(true);

      // Check if all fields are filled
      if (!username || !email || !phone || !password) {
        Alert.alert("Please fill all fields");
        setLoading(false);
        return;
      }

      let response, data;

      // Attempt to register using each URL
      for (const url of urls) {
        try {
          // Make the POST request using fetch
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              email,
              phone,
              password,
            }),
          });

          // Parse the response
          data = await response.json();

          // If the request was successful
          if (response.ok) {
            // Store the signup data in AsyncStorage
            await AsyncStorage.setItem("@auth", JSON.stringify(data));
            alert(data.message);
            navigation.navigate("Home");
            break; // Exit the loop if successful
          } else {
            throw new Error(data.message || "Registration failed");
          }
        } catch (error) {
          console.error(`Failed to sign up from ${url}:`, error.message);
          // Continue to the next URL if registration fails
        }
      }

      // If data is not set, alert the user
      if (!data) {
        alert("Unable to register with both URLs.");
      }
    } catch (error) {
      // Error handling
      alert(error.message);
    } finally {
      setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.LetsText}>Let’s,</Text>
      <Text style={styles.Text}>Create Account</Text>

      {/* Name Input */}
      <View style={styles.inputWithIcon}>
        <UserIcon color="#9E9E9E" />
        <TextInput
          style={styles.inputIconText}
          placeholder="Enter your name"
          value={username}
          onChangeText={setUserName}
        />
      </View>

      {/* Email Input with Icon */}
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

      {/* Phone Input */}
      <View style={styles.inputWithIcon}>
        <SmartPhone01Icon color="#9E9E9E" />
        <TextInput
          style={styles.inputIconText}
          placeholder="Enter your phone no."
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputWithIcon}>
        <LockIcon color="#9E9E9E" />
        <TextInput
          style={styles.inputIconText}
          secureTextEntry={true}
          autoComplete="password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Custom TouchableOpacity Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Already have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("Login")}
        >
          Log in
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
  LetsText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 7,
    color: "#616161",
  },
  Text: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 30,
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
    fontWeight: "500",
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#2979ff", // Blue button color
    paddingVertical: 14,
    borderRadius: 128,
    alignItems: "center",
    marginTop: 10,
    height: 54,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600", // Bold the button text
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
