import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Animated,
  FlatList,
  Image,
  useColorScheme,
} from "react-native";
import { StatusBar } from "react-native";

import { useTheme } from "../screens/ThemeContext";

import moment from "moment";
import { getDatabase, ref, update, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { TouchableWithoutFeedback } from "react-native";
import { Alert } from "react-native";

export default function Borrowers() {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [editedBorrowerName, setEditedBorrowerName] = useState("");
  const [editedLoanAmount, setEditedLoanAmount] = useState("");
  const [editedInterestRate, setEditedInterestRate] = useState("");
  const [editedborrowDate, setEditedborrowDate] = useState("");
  const [showButtons, setShowButtons] = useState(false); // State to track button visibility
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [darkTheme, setDarkTheme] = useState(false);
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme()
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(null);;

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setIsLoggedIn(true);
      const uid = currentUser.uid;
      const database = getDatabase();
      const journalRef = ref(database, `users/${uid}/loan`);

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          onValue(
            journalRef,
            (snapshot) => {
              const data = snapshot.val();
              if (data) {
                const dataArray = Object.entries(data).map(([key, value]) => ({
                  id: key,
                  borrowerName: value.borrowerName,
                  borrowerMobile: value.borrowerMobile,
                  borrowerAddress: value.borrowerAddress,
                  lenderName: value.lenderName,
                  borrowDate: value.borrowDate,
                  loanAmount: value.loanAmount,
                  interestRate: value.interestRate,
                  timeElapsed: calculateTimeElapsed(value.borrowDate),
                  compoundInterest: calculateCompoundInterest(
                    value.loanAmount,
                    value.interestRate,
                    calculateTimeElapsedInYears(value.borrowDate)
                  ),
                }));
                dataArray.sort(
                  (b, a) => new Date(a.borrowDate) - new Date(b.borrowDate)
                );
                setData(dataArray);
              } else {
                setData([]);
              }
              setLoading(false);
            },
            (error) => {
              setError(error.message);
              setLoading(false);
            }
          );
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // Add a state to manage the height of the selected card
  const [selectedCardHeight, setSelectedCardHeight] = useState(
    new Animated.Value(115)
  );

  const calculateTimeElapsed = (borrowDate) => {
    const now = moment();
    const borrowMoment = moment(borrowDate, "DD-MMMM-YYYY");
    const diff = moment.duration(now.diff(borrowMoment));

    const years = diff.years();
    const months = diff.months();
    const days = diff.days();

    let timeElapsed = "";
    if (years !== 0) {
      timeElapsed += `${years} y${years > 1 ? "" : ""} `;
    }
    if (months !== 0) {
      timeElapsed += `${months} m${months > 1 ? " " : ""} `;
    }
    if (days !== 0) {
      timeElapsed += `${days} d${days > 1 ? " " : ""}`;
    }

    return timeElapsed.trim();
  };

  const calculateTimeElapsedInYears = (borrowDate) => {
    const now = moment();
    const borrowMoment = moment(borrowDate, "DD-MMMM-YYYY");
    return now.diff(borrowMoment, "years", true);
  };

  const calculateCompoundInterest = (principal, rate, timeElapsed) => {
    const amount = principal * Math.pow(1 + (12 * rate) / 100, timeElapsed);
    const compoundInterest = amount - principal;
    return compoundInterest;
  };

  const handleEdit = (borrower) => {
    setSelectedBorrower(borrower);
    setEditedBorrowerName(borrower.borrowerName);
    setEditedLoanAmount(borrower.loanAmount.toString());
    setEditedInterestRate(borrower.interestRate.toString());
    setEditedborrowDate(borrower.borrowDate);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const database = getDatabase();
    const uid = currentUser.uid;
    const borrowerRef = ref(
      database,
      `users/${uid}/loan/${selectedBorrower.id}`
    );

    update(borrowerRef, {
      borrowerName: editedBorrowerName,
      loanAmount: parseFloat(editedLoanAmount),
      interestRate: parseFloat(editedInterestRate),
      borrowDate: editedborrowDate,
    })
      .then(() => {
        console.log("Borrower details updated successfully");
        setEditModalVisible(false);
      })
      .catch((error) => {
        console.error("Error updating borrower details: ", error);
        // Handle error, show message to the user, etc.
      });
  };
  const confirmDelete = (userRef) => {
    remove(userRef)
      .then(() => {
        // Show alert when data is deleted successfully
        Alert.alert(
          "Success",
          "Data deleted successfully!",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      })
      .catch((error) => {
        // Show alert if deletion failed
        Alert.alert(
          "Error",
          "The deletion failed...",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      });
  };

  const handleDelete = () => {
    // Implement the logic to delete the current borrower from the database
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const database = getDatabase();
    const uid = currentUser.uid;
    const userRef = ref(database, `users/${uid}/loan/${selectedBorrower.id}`);

    // Show confirmation dialog before deleting
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete this data?",
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        { text: "OK", onPress: () => confirmDelete(userRef) },
      ],
      { cancelable: false }
    );
  };

  const handleCardPress = (borrower) => {
    setSelectedBorrower(borrower);
    setEditedBorrowerName(borrower.borrowerName);
    setEditedLoanAmount(borrower.loanAmount.toString());
    setEditedInterestRate(borrower.interestRate.toString());
    setEditedborrowDate(borrower.borrowDate);
    setShowButtons(!showButtons); // Toggle the visibility of buttons
    Animated.timing(selectedCardHeight, {
      toValue: showButtons ? 164 : 115,
      duration: 10,
      useNativeDriver: true, // Add this line for Android support
    }).start();
  };


  

  const handleSort = (type) => {
    setSortBy(type);
    setShowFilters(false); // Close filters after selecting a sorting option
  };

  const sortedData = () => {
    let filteredData = data.filter((item) => {
      const searchText = search.toLowerCase();
      return (
        item.borrowerName.toLowerCase().includes(searchText) ||
        item.borrowerAddress.toLowerCase().includes(searchText) ||
        item.borrowDate.toLowerCase().includes(searchText) ||
        item.loanAmount.toString().includes(searchText) ||
        item.interestRate.toString().includes(searchText)
      );
    });

    if (sortBy === 'date') {
      filteredData.sort((a, b) => new Date(a.borrowDate) - new Date(b.borrowDate));
    } else if (sortBy === 'amount') {
      filteredData.sort((a, b) => a.loanAmount - b.loanAmount);
    } else if (sortBy === 'alphabet') {
      filteredData.sort((a, b) => a.borrowerName.localeCompare(b.borrowerName));
    }

    return filteredData;
  };
  // Use isDarkMode to conditionally apply styles
  const containerStyle = [styles.container, isDarkMode && styles.darkContainer];
  const rowContainerStyle = [
    styles.rowContainer,
    isDarkMode && styles.darkrowContainer,
  ];

  const renderItem = ({ item }) => (
    <View>
      <View
        style={[
          rowContainerStyle,
          selectedBorrower === item && {
            height: showButtons ? 164 : 115,
          },
        ]}>
        <View
          style={[styles.NAD]}
          key={item.id}
          onTouchStart={() => handleCardPress(item)}>
          <Text
            style={[styles.label1, { color: isDarkMode ? "#FFF" : "#181823" }]}>
            {item.borrowerName}
          </Text>
          <Text
            style={[
              styles.label1,
              {
                color: "#575DFB",
                fontWeight: "bold",
                textAlign: "center",
                alignSelf: "center",
              },
            ]}>
            ₹{item.loanAmount.toLocaleString()}
          </Text>
          <Text
            style={[styles.label1, { color: isDarkMode ? "#FFF" : "#181823" }]}>
            {item.borrowDate}
          </Text>
        </View>
        <View
          style={[
            {
              borderBottomWidth: 0.96,
              borderBottomColor: "#222831",
              marginTop: 2,
              opacity: 0.15,
            },
            { borderBottomColor: isDarkMode ? "#FFF" : "#000" },
          ]}></View>

        <View style={styles.IITText} key={item.id}>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? "#FFF" : "#181823" },
              ]}>
              Interest Rate
            </Text>
            <Text
              style={[styles.text, { color: isDarkMode ? "#FFF" : "#181823" }]}>
              {item.interestRate}%
            </Text>
          </View>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? "#FFF" : "#181823" },
              ]}>
              Total Interest
            </Text>
            <Text
              style={[styles.text, { color: isDarkMode ? "#FFF" : "#181823" }]}>
              ₹{Math.floor(item.compoundInterest).toLocaleString()}
            </Text>
          </View>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? "#FFF" : "#181823" },
              ]}>
              Total Amount
            </Text>
            <Text
              style={[styles.text, { color: isDarkMode ? "#FFF" : "#181823" }]}>
              ₹
              {Math.floor(
                item.loanAmount + item.compoundInterest
              ).toLocaleString()}
            </Text>
          </View>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? "#FFF" : "#181823" },
              ]}>
              Time
            </Text>
            <Text
              style={[styles.text, { color: isDarkMode ? "#FFF" : "#181823" }]}>
              {item.timeElapsed}
            </Text>
          </View>
        </View>
        {selectedBorrower === item && showButtons && (
          <View style={styles.IITText}>
            <View style={styles.labelContainer}>
              <Text
                style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>
                Phone no.{"\n"}
                {item.borrowerMobile}
              </Text>
            </View>
            <View style={styles.labelContainer}>
              <Text
                style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>
                Address{"\n"}
                {item.borrowerAddress}
              </Text>
            </View>

            <TouchableWithoutFeedback onPress={() => handleEdit(item)}>
              <View style={styles.labelContainer}>
                <Text style={{ color: "rgba(14, 96, 255, 1)" }}>Edit</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <View style={styles.labelContainer}>
                <Text style={{ color: "red" }}>Delete</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}>
          <View style={[styles.modalContainer, { justifyContent: "center" }]}>
            <View style={styles.modalContent}>
              <TextInput
                style={[styles.input]}
                value={editedBorrowerName}
                onChangeText={setEditedBorrowerName}
                placeholder="Borrower Name"
              />
              <TextInput
                style={styles.input}
                value={editedLoanAmount}
                onChangeText={setEditedLoanAmount}
                placeholder="Loan Amount"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={editedInterestRate}
                onChangeText={setEditedInterestRate}
                placeholder="Interest Rate"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={editedborrowDate}
                onChangeText={setEditedborrowDate}
                placeholder="Borrow date"
              />
              <View></View>
              <Button title="Save" onPress={handleSaveEdit} />
              <Button
                title="Cancel"
                onPress={() => setEditModalVisible(false)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );

  return (
    <View style={containerStyle}>
      {/* <StatusBar hidden={false} /> */}
      {isLoggedIn && ( // Conditional rendering based on isLoggedIn state
        <View>
        <View style={[
          {
            width: "95%",
            height: 40,
            
            borderRadius: 4,
            borderWidth: 0.2,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
            backgroundColor: "white",
            marginTop: 5,
            shadowColor: "rgba(0, 0, 0, 1)",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            alignSelf: "center",
            justifyContent:"center",
          },
          { backgroundColor: isDarkMode ? "#121212" : "white" },
        ]}>
          <Image
            source={require("../assets/SearchBar.png")}
            style={[
              {
                width: 25,
                height: 25,
                marginRight: 0,
                opacity: 0.6,
                marginLeft: 10,
                justifyContent: "center",
              },
              { tintColor: isDarkMode ? "white" : "#181823" },
            ]}
          />
          <TextInput
            style={[{ color: isDarkMode ? "#FFF" : "#000", flex: 1 }]}
            placeholder="  Search here.."
            placeholderTextColor={colorScheme === "dark" ? "#ffffff" : "#ccc"}
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Image
              source={require("../assets/down.png")} // Replace with your hamburger menu icon
              style={{ width: 25, height: 25, marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>
  
        {showFilters && (
          <View style={styles.filterButtonContainer}>
          <Button title="Sort by Date" onPress={() => handleSort('date')} color="#575DFB" style={{fontSize: 6}} />
          <Button title="Sort by Amount" onPress={() => handleSort('amount')} color="#575DFB" style={{fontSize: 6}} />
          <Button title="Sort Alphabetically" onPress={() => handleSort('alphabet')} color="#575DFB" style={{fontSize: 60}} />
        </View>
        
        )}
  
        <FlatList
          data={sortedData()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
        
      )}
      {!isLoggedIn && (
        <View style={styles.loginMessage}>
          <View style={rowContainerStyle}>
            <View style={[styles.NAD]}>
              <Text
                style={[
                  styles.label1,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Borrower Name
              </Text>
              <Text
                style={[
                  styles.label1,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Amount
              </Text>
              <Text
                style={[
                  styles.label1,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Borrow Date
              </Text>
            </View>
            <View
              style={[
                {
                  borderBottomWidth: 0.96,
                  borderBottomColor: "#222831",
                  marginTop: 8,
                  opacity: 0.15,
                },
                { borderBottomColor: isDarkMode ? "white" : "#181823" },
              ]}></View>
            <View style={styles.IITText}>
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Interest Rate
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Total Interest
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Total Amount
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode ? "#FFF" : "#181823" },
                ]}>
                Time
              </Text>
            </View>
          </View>
          <Text
            style={[
              {
                textAlign: "center",
                fontSize: 16,
                fontWeight: "400",
                marginTop: "50%",
              },
              { color: isDarkMode ? "#FFF" : "#181823" },
            ]}>
            Please log in to view Your Borrowers details.
          </Text>
        </View>
      )}
     <StatusBar 
        hidden={false} 
        backgroundColor={isDarkMode ? "#0f0f0f" : "#fff"}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        //translucent={true}
      />
      <FlatList
        data={data.filter((item) => {
          const searchText = search.toLowerCase();
          return (
            item.borrowerName.toLowerCase().includes(searchText) ||
            item.borrowerAddress.toLowerCase().includes(searchText) ||
            item.borrowDate.toLowerCase().includes(searchText) ||
            item.loanAmount.toString().includes(searchText) ||
            item.interestRate.toString().includes(searchText)
          );
        })}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
      />
      {/* Your modal component */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#F3F8FF",
  },
  darkContainer: {
    // backgroundColor: "rgba(32, 32, 32, 1)",
    backgroundColor: "black", // Dark background color
  },
  flatListContainer: {},
  rowContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 4,
    width: "95%",
    height: 115,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginBottom: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
    justifyContent: "space-around",
  },

  darkrowContainer: {
    backgroundColor: "#121212",
    width: "95%",
  },
  NAD: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  IITText: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    opacity: 0.8,
  },
  label1: {
    fontWeight: "600",
    fontSize: 13,
    color: "#181823",
    opacity: 0.85,
  },
  labelContainer: {
    alignItems: "center",
    marginTop: -10,
    opacity: 0.85,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#181823",
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    color: "#181823",
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 10,
    paddingHorizontal: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    height: 320,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterButtonContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    width: "95%",
  }
});
