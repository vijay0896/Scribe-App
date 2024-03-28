import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  useColorScheme,StatusBar
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import Material Icons
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase.config";
import { useTheme } from "../screens/ThemeContext";
import { setDoc, doc } from "firebase/firestore";

const Signup = ({ navigation }) => {
  const [name, setName] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme();
  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(db, "users", user.uid);

        // Save user's name and email to Firestore
        setDoc(userRef, {
          name: name,
          email: email,
        })
          .then(() => {
            alert("User SignUp successfully");
            navigation.replace("Home");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  const handleLoginNavigation = () => {
    // Navigate to the Login screen
    navigation.navigate("Login");
  };
  // Use isDarkMode to conditionally apply styles
  const containerStyle = [styles.container, isDarkMode && styles.darkContainer];

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
        Register
      </Text>
      <Text style={[styles.Lable, { color: isDarkMode ? "white" : "#121212" }]}>
        Create an account to access all the {"\n"}features of Sahukar Scribe!
      </Text>
      <View style={styles.inputContainer}>
        <Text style={[styles.label,{ color: isDarkMode ? "#F6F5F5" : "#121212" }]}>Your Name</Text>

        <TextInput
          style={[styles.input, colorScheme === "dark" && styles.darkInput]}
          onChangeText={setName}
          placeholderTextColor={colorScheme === "dark" ? "#F6F5F5" : "gray"}
          value={name}
          placeholder="Ex. Vijay"
        />
        <Text style={[styles.label,{ color: isDarkMode ? "#F6F5F5" : "#121212" }]}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Ex: abc@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colorScheme === "dark" ? "#F6F5F5" : "gray"}
        />
        <Text style={[styles.label,{ color: isDarkMode ? "#F6F5F5" : "#121212" }]}>Your Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={colorScheme === "dark" ? "#F6F5F5" : "gray"}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.signupButton,
          { backgroundColor: isDarkMode ? "#575DFB" : "#575DFB" },
        ]}
        onPress={() => handleSignup()}>
        <Text style={[styles.buttonText]}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLoginNavigation} style={[styles.buttonContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>
          <Text
            style={[
              styles.haveAccountText,
              { color: isDarkMode ? "white" : "#121212" },
            ]}>
            Already have an account?
          </Text>
          <Text style={[styles.loginText, { color: "#575DFB" }]}> Login</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FF",
    justifyContent: "center",
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
  label: {
    marginBottom: 0,
    color: "white",
    // Adjust the color as per your design
  },
  signupButton: {
    backgroundColor: "#575DFB",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
   
    width: "88%",
    alignSelf: "center",
    marginBottom: 20,
  },
  inputContainer: {
    width: "88%",
    marginBottom: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#F6F5F5",
    fontSize: 14.5,
    textAlign: "center",
    fontWeight: "bold",
    
  },
  haveAccountText: {
    color: "#121212",
    fontSize: 16,
    textAlign: "center",
   
   
    
  },
  loginText:{ textDecorationLine:"underline",
  fontSize: 16,
  fontWeight: "bold",},
});

export default Signup;
