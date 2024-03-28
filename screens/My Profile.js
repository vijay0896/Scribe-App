import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Switch,StatusBar
} from "react-native";
import { useTheme } from "./ThemeContext";
import { auth, db } from "../firebase/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function Account({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
          .then((doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setName(userData.name);
              setEmail(userData.email);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () =>
            signOut(auth)
              .then(() => navigation.replace("Login"))
              .catch(console.log),
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditProfile = () => setShowForm(true);

  const handleSaveProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(docRef, { name, email })
      .then(() => {
        alert("Your profile is updated");
        setShowForm(false);
      })
      .catch(console.log);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#0f0f0f" : "#F3F8FF" },
      ]}>
        <StatusBar 
        hidden={false} 
        backgroundColor={isDarkMode ? "#0f0f0f" : "#fff"}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent={true}
      />
      {loggedIn ? (
        <View>
          {showForm ? (
            <View>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <TextInput
                style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
                placeholder="Name"
                value={name}
                onChangeText={(value) => setName(value)}
              />
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.saveButton, { backgroundColor: "#575DFB" }]}>
                <Text style={[styles.buttonText, { color: "#FFF" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <View style={styles.infoContainer}>
                  <Text
                    style={[
                      styles.name,
                      { color: isDarkMode ? "#FFF" : "#000" },
                    ]}>
                    {name}
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text
                    style={[
                      styles.email,
                      { color: isDarkMode ? "#FFF" : "#000" },
                    ]}>
                    {email}
                  </Text>
                </View>
                <View style={styles.buttonContainer1}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditProfile}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}>
                    <Text style={styles.buttonText}>Log Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text
            style={[styles.loginText, { color: isDarkMode ? "#FFF" : "#000" }]}>
            Please login or sign up{"\n"}to view your account information.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.darkModeContainer}>
        <Text
          style={[
            styles.darkModeText,
            { color: isDarkMode ? "#FFF" : "#000" },
          ]}>
           Dark Mode  
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  darkModeContainer: {
    flexDirection:"row",
    alignItems: "center",
    
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
    paddingVertical: 20,
    
  },
  darkModeText: {
    fontSize: 16,
   marginEnd: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "500",
  },
  email: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.7,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "gray",
    justifyContent: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  iconText: {
    fontSize: 50,
    fontWeight: "600",
    color: "grey",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  buttonContainer1: {
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 10,
    padding: 10,
    width: 120,
    alignItems: "center",
    backgroundColor: "#575DFB",
  },
  signupButton: {
    backgroundColor: "#34A853",
    borderRadius: 10,
    padding: 10,
    width: 120,
    alignItems: "center",
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: "red",
    borderRadius: 5,
    padding: 10,
    width: width * 0.88,
    alignItems: "center",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#575DFB",
    borderRadius: 5,
    padding: 10,
    width: width * 0.88,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#575DFB",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
    width: 100,
    alignItems: "center",
  },
  loginText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    justifyContent: "center",
  },
});
