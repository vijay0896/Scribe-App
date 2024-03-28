import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  Keyboard,
  useColorScheme,TouchableOpacity,StatusBar
} from "react-native";
import "firebase/database";
import { auth, database, ref, push } from "../firebase/firebase.config";
import CustomTabBar from "./CustomTabBar";
import { useTheme } from "../screens/ThemeContext";
const ConfirmationMessage = ({ setIsDataSaved }) => {
  return (
    <View style={styles.confirmationContainer}>
      <Text style={styles.confirmationText}>Data saved successfully!</Text>
      <Button title="OK" onPress={() => setIsDataSaved(false)} />
    </View>
  );
};

const Add = ({ navigation }) => {
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerMobile, setBorrowerMobile] = useState("");
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isDataSaved, setIsDataSaved] = useState(false);
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme();
  const [darkTheme, setDarkTheme] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Function to check if the form is empty
  const isFormEmpty = () => {
    return (
      borrowerName === "" ||
      borrowerMobile === "" ||
      borrowerAddress === "" ||
      borrowDate === "" ||
      loanAmount === "" ||
      interestRate === ""
    );
  };

  // Function to convert date format from MM/DD/YYYY to DD-MMM-YYYY
  const formatDate = (inputDate) => {
    const dateParts = inputDate.split("/");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[parseInt(dateParts[0]) - 1];
    const day = dateParts[1];
    const year = dateParts[2];
    return `${day}-${month}-${year}`;
  };

  const handleSaveData = () => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage("Please login to continue.");
      return;
    }

    const userId = user.uid;
    const userLoanRef = ref(database, `users/${userId}/loan`);
    const formattedDate = formatDate(borrowDate);
    // Parse interest rate as a float
    const parsedInterestRate = parseFloat(interestRate);
    // Parse loan amount as a float
    const parsedLoanAmount = parseFloat(loanAmount);

    if (
      borrowerName === "" ||
      borrowerMobile === "" ||
      borrowerAddress === "" ||
      borrowDate === "" ||
      loanAmount === "" ||
      interestRate === ""
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // Push the new data to the user's loan reference
    push(userLoanRef, {
      borrowerName,
      borrowerMobile,
      borrowerAddress,
      lenderName,
      borrowDate: formattedDate, // Use the formatted date
      loanAmount: parsedLoanAmount,
      interestRate: parsedInterestRate,
    })
      .then(() => {
        console.log("Data saved successfully!");
        setIsDataSaved(true);
        // Reset form fields
        setBorrowerName("");
        setBorrowerMobile("");
        setBorrowerAddress("");
        setBorrowDate("");
        setLoanAmount("");
        setInterestRate("");
        setErrorMessage("");
        setErrorMsg("");
      })
      .catch((error) => {
        console.error("Error saving data: ", error);
      });
  };
  useEffect(() => {
    // Function to show confirmation message when data is saved successfully
    const showConfirmation = () => {
      Alert.alert(
        "Success",
        "Data saved successfully!",
        [
          { text: "OK", onPress: () => setIsDataSaved(false) }, // Reset isDataSaved state upon pressing OK
        ],
        { cancelable: false }
      );
    };

    // Render confirmation message if data is saved successfully
    if (isDataSaved) {
      showConfirmation();
    }
  }, [isDataSaved]); // useEffect will run when isDataSaved changes

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to get the current date in MM/DD/YYYY format
  const getCurrentDate = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
  };
  // Function to validate the entered date
  const isValidDate = (dateString) => {
    const dateParts = dateString.split("/");
    const month = parseInt(dateParts[0]);
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;

    if (month < 1 || month > 12 || day < 1 || day > 31) return false;

    return true;
  };

  const handleTextChange = (text) => {
    setBorrowDate(text);
    if (!isValidDate(text)) {
      setErrorMsg("Invalid date. Please enter a valid date (MM/DD/YYYY)");
    } else {
      setErrorMsg("");
    }
  };
  // Add this useEffect to toggle dark theme based on the isDarkMode value
  // Use isDarkMode to conditionally apply styles
  const containerStyle = [styles.container, isDarkMode && styles.darkContainer];
  const formContainerStyle = [
    styles.FormContainer,
    isDarkMode && styles.darkFormContainer,
  ];
  return (
    <View style={containerStyle}>
      <StatusBar 
        hidden={false} 
        backgroundColor={isDarkMode ? "#0f0f0f" : "#fff"}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent={true}
      />
      <View style={formContainerStyle}>
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholder="Enter Borrower's Name"
          placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "gray"}
          value={borrowerName}
          onChangeText={setBorrowerName}
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "gray"}
          placeholder="Enter Borrower's Mobile Number"
          keyboardType="numeric"
          value={borrowerMobile}
          onChangeText={setBorrowerMobile}
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholder="Enter Borrower's Address"
          placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "gray"}
          value={borrowerAddress}
          onChangeText={setBorrowerAddress}
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholder="Borrow Date (e.g., MM/DD/YYYY)"
          placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "gray"}
          value={borrowDate}
          onChangeText={handleTextChange}
        />
        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "gray"}
          placeholder="Enter Loan Amount"
          value={loanAmount}
          keyboardType="numeric"
          onChangeText={setLoanAmount}
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
          placeholderTextColor={colorScheme === "dark" ? "white" : "gray"}
          placeholder="Interest Rate Per Month (%)"
          value={interestRate}
          keyboardType="numeric"
          onChangeText={setInterestRate}
        />

        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#575DFB", marginTop: 10 }]}
          onPress={handleSaveData}>
          <Text style={styles.buttonText}>Save Data</Text>
        </TouchableOpacity>

        {isDataSaved && <ConfirmationMessage setIsDataSaved={setIsDataSaved} />}
      </View>
      {/* <CustomTabBar isKeyboardVisible={isKeyboardVisible} /> */}
    </View>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically

     backgroundColor: "#F3F8FF",
  },

  darkContainer: {
    backgroundColor: "rgba(32, 32, 32, 1)",
    backgroundColor: "#0f0f0f", // Dark background color
  },
  FormContainer: {
    width: "95%",
    height: 455, // Set height to 50%
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F8FF",
    alignSelf: "center",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 3,
    borderRadius: 8,
    
  },
  darkFormContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    backgroundColor: "#121212",
   
   

    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  input: {
    width: "90%",
    height: 45,
    borderColor: "#575DFB",
    borderWidth: 1.4,
    marginBottom: 12,
    paddingLeft: 10,
    borderRadius: 8,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
  confirmationContainer: {
    backgroundColor: "lightgreen",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    opacity: 0,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMsg: {
    color: "red",
    marginTop: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width:"90%"
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
