import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ResetPasswordConfrim({ navigation }) {
  const [VerificationCode, setVerificationCode] = useState("");
  const [newPassword, setnewPassword] = useState("");

  const [confirmPassword, setconfirmPassword] = useState("");

  const handleResetPassword = () => {
    // Add your reset password logic here (e.g., API call to reset password)
    console.log("Reset password for email:", email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password Confirmation</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={VerificationCode}
        onChangeText={setVerificationCode}
      />
       <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setnewPassword}
      />
       <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setconfirmPassword}
      />

      {/* Reset Password Button */}
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <Text style={styles.backToLoginText}>
        Back to{" "}
        <Text
          style={styles.backToLoginLink}
          onPress={() => navigation.navigate("Login")}
        >
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5", // Light background color
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333", // Darker text color for contrast
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8, // Rounded corners for the input
    backgroundColor: "#fff", // White background for the input
  },
  button: {
    backgroundColor: "#6200ee", // Purple button color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600", // Bold the button text
  },
  backToLoginText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666", // Softer text color for secondary text
  },
  backToLoginLink: {
    color: "#6200ee",
    fontWeight: "600", // Bold the "Login" link
  },
});
