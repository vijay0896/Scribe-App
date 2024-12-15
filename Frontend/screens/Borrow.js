import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Button,
  StatusBar
} from "react-native";
import { AuthContext } from "../context/authcontext";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BASE_URLS} from "../Utils/config"
const BorrowScreen = () => {
  const {state} = useContext(AuthContext);

  const [loanDetails, setLoanDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState(null);
  const [showEditDeleteButtons, setShowEditDeleteButtons] = useState(false);
  const navigation = useNavigation();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dq0nttryr/image/upload/";
  const getImageUrl = (imagePath) => {
    const fullUrl =
      typeof imagePath === "string"
        ? imagePath.startsWith("http")
          ? imagePath
          : `${cloudinaryBaseUrl}${imagePath}`
        : `${cloudinaryBaseUrl}default.jpg`;
    // console.log("Generated Image URL:", fullUrl); // Add this line
    return fullUrl;
  };

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "20%"], []);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editDetails, setEditDetails] = useState({
    borrowerName: "",
    borrowerAddress: "",
    borrowerMobile: "",
  });
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`,
  });

  const fetchLoanDetails = async () => {
    setLoading(true);
    try {
      // Make the API call using fetchWithFallback
      const response = await fetch(`${BASE_URLS}/api/loan/getBorrowers`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Set loan details
        setLoanDetails(data.borrowers);
  
        // Calculate and set total loan amount
        const totalLoanAmount = calculateTotalLoanAmountForBorrower(
          data.borrowers
        );
        setTotalLoanAmount(totalLoanAmount);
      } else {
        throw new Error("Failed to fetch loan details");
      }
    } catch (error) {
      console.error("Error fetching loan details:", error.message);
      setError("Unable to fetch loan details.");
    } finally {
      setLoading(false); // Ensure loading state is updated
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (state.token) {
        fetchLoanDetails();
      }
    }, [state.token])
  );
  const handleLongPress = useCallback(
    (borrowerId) => {
      if (showEditDeleteButtons && selectedBorrowerId === borrowerId) {
        // If the sheet is open for the same borrower, close it
        sheetRef.current?.close();
        setShowEditDeleteButtons(false);
        setSelectedBorrowerId(null);
        setIsBottomSheetOpen(false);
      } else {
        // Otherwise, open the sheet and set the selected borrower
        setSelectedBorrowerId(borrowerId);
        setShowEditDeleteButtons(true);
        setIsBottomSheetOpen(true);
        sheetRef.current?.snapToIndex(0); // Open bottom sheet at first snap point
      }
    },
    [showEditDeleteButtons, selectedBorrowerId]
  );

  const confirmDeleteBorrower = (borrowerId) => {
    Alert.alert("Delete Borrower", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteBorrower(borrowerId),
        style: "destructive",
      },
    ]);
  };

  const deleteBorrower = async (borrowerId) => {
    try {
      // Use fetchWithFallback to attempt deletion across multiple base URLs
      await fetch(`${BASE_URLS}/api/loan/deleteBorrower/${borrowerId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
  
      // Update state to remove the deleted borrower
      setLoanDetails((prev) =>
        prev.filter((borrower) => borrower._id !== borrowerId)
      );
      Alert.alert("Success", "Borrower deleted successfully.");
  
      // Close the bottom sheet and reset states
      sheetRef.current?.close();
      setShowEditDeleteButtons(false);
      setSelectedBorrowerId(null);
    } catch (error) {
      console.error("Error deleting borrower:", error.message);
      Alert.alert("Error", "Unable to delete borrower.");
    }
  };

  const handleUpdateBorrower = async (borrowerId) => {
    if (!borrowerId) {
      Alert.alert("Error", "Borrower ID is missing. Please try again.");
      return;
    }
  
    try {
      // Use fetchWithFallback to attempt updating across multiple base URLs
      await fetch(`${BASE_URLS}/api/loan/UpdateBorrower/${borrowerId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(editDetails),
      });
  
      Alert.alert("Success", "Borrower updated successfully.");
      setEditModalVisible(false);
  
      // Optionally, update only the edited borrower in `loanDetails`
      setLoanDetails((prevDetails) =>
        prevDetails.map((borrower) =>
          borrower._id === borrowerId
            ? { ...borrower, ...editDetails }
            : borrower
        )
      );
  
      // Close the bottom sheet and reset states
      sheetRef.current?.close();
      setShowEditDeleteButtons(false);
      setSelectedBorrowerId(null);
    } catch (error) {
      console.error("Error updating borrower:", error.message);
      Alert.alert("Error", "Unable to update borrower.");
    }
  };
  

  // Change openEditModal to find the correct borrower and set edit details
  const openEditModal = (borrowerId) => {
    const borrower = loanDetails.find((b) => b._id === borrowerId);
    if (borrower) {
      setEditDetails({
        borrowerName: borrower.borrowerName,
        borrowerAddress: borrower.borrowerAddress,
        borrowerMobile: borrower.borrowerMobile,
      });
      setEditModalVisible(true);
    } else {
      Alert.alert("Error", "Borrower details not found.");
    }
  };
  // Function to calculate total loan amount for a single borrower
  const calculateTotalLoanAmountForBorrower = (loans) => {
    const totalAmount = loans.reduce(
      (loanSum, loan) => loanSum + loan.loanAmount,
      0
    );
    return totalAmount;
  };

  const loandata = (borrower) => {
    if (borrower) {
      navigation.navigate("LoanDetails", { borrower }); // Ensure you're using the correct route name
    } else {
      console.error("Borrower data is undefined");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

 
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
      <StatusBar animated={true} hidden={true} />
      
        <ScrollView style={styles.scrollView}>
          
          {loanDetails && loanDetails.length > 0 ? (
            loanDetails.map((borrower) => {
              const totalLoanAmount = calculateTotalLoanAmountForBorrower(
                borrower.loans
              );

              // Construct the image URL using the helper function
              const imageUrl = getImageUrl(borrower.imageUrl);

              return (
                <React.Fragment key={borrower._id}>
                  <TouchableOpacity
                    style={styles.borrowerContainer}
                    onPress={() => loandata(borrower)}
                    onLongPress={() => handleLongPress(borrower._id)}
                  >
                    <View style={styles.borrowerView}>
                      <Text style={styles.borrowerName}>
                        {borrower.borrowerName}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        ₹{totalLoanAmount.toLocaleString("en-IN")}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        Ph.no. {borrower.borrowerMobile}
                      </Text>
                    </View>
                    <View style={styles.ImgCon}>
                      {borrower.imageUrl && borrower.imageUrl.url ? (
                        <Image
                          source={{ uri: borrower.imageUrl.url }}
                          style={styles.borrowerImage}
                          resizeMode="cover"
                          onError={(error) =>
                            console.error(
                              "Image load error:",
                              error.nativeEvent.error
                            )
                          }
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No loan data available.</Text>
          )}

          <Modal
            visible={isEditModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TextInput
                style={styles.input}
                placeholder="Borrower Name"
                value={editDetails.borrowerName}
                onChangeText={(text) =>
                  setEditDetails((prev) => ({ ...prev, borrowerName: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Borrower Address"
                value={editDetails.borrowerAddress}
                onChangeText={(text) =>
                  setEditDetails((prev) => ({ ...prev, borrowerAddress: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={
                  editDetails.borrowerMobile
                    ? editDetails.borrowerMobile.toString()
                    : ""
                }
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setEditDetails((prev) => ({ ...prev, borrowerMobile: text }))
                }
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  handleUpdateBorrower(selectedBorrowerId);
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </View>

      {isBottomSheetOpen && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => {
              sheetRef.current?.close();
              setIsBottomSheetOpen(false);
            }}
          />
        )}
      {showEditDeleteButtons && (
        <BottomSheet
          ref={sheetRef}
          snapPoints={["25%", "30%"]}
          enablePanDownToClose={true}
          onChange={(index) => {
            if (index === -1 || index === snapPoints.length - 1) {
              setShowEditDeleteButtons(false); // Hide buttons when bottom sheet is closed
              setSelectedBorrowerId(null);
              setIsBottomSheetOpen(false);
            }
          }}
          backgroundStyle={styles.bottomSheetBackground} // Style for background overlay
          handleStyle={styles.handleStyle} // Style for the drag handle
          handleIndicatorStyle={styles.handleIndicatorStyle}
        >
          <BottomSheetView style={styles.contentContainer}>
            {loanDetails
              .filter((borrower) => borrower._id === selectedBorrowerId)
              .map((borrower) => (
                <React.Fragment key={borrower._id}>
                  <Text style={styles.borrowerNameInSheet}>
                    {borrower.borrowerName}
                  </Text>
                  <View
                    style={{
                      borderBottomWidth: 0.7,
                      borderBottomColor: "#CFCFCF",
                      marginTop: 5,
                      marginBottom: 15,
                      opacity: 1,
                    }}
                  />
                  <TouchableOpacity
                    style={styles.BottomSheetButton}
                    onPress={() => openEditModal(selectedBorrowerId)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.BottomSheetButton}
                    onPress={() => confirmDeleteBorrower(selectedBorrowerId)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
          </BottomSheetView>
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
};
export default BorrowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 0, 
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
 
  borrowerContainer: {
    backgroundColor: "#EDEDF4",
    padding: 8,
    paddingLeft: 16,
    borderRadius: 6,
    marginBottom: 16,

    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "row",
  },

  borrowerName: {
    fontSize: 16,
    fontWeight: "600",

    color: "#656565",
    opacity: 0.9,
    fontFamily: "Rubik-Regular",
  },
  borrowerDetail: {
    fontSize: 13,
    color: "#656565",
    paddingVertical: 1,
    fontWeight: "600",
    opacity: 0.9,
    fontFamily: "Rubik-Regular",
  },

  noDataText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8FF",
  },
  loadingText: {
    fontSize: 16,
    color: "#000",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
  },

  input: {
    width: "100%", 
    height: 50,
    borderColor: "rgba(138, 141, 147, 0.2)",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15, // Spacing between inputs
    backgroundColor: "rgba(138, 141, 147, 0.08)",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "red", // You can choose a different color
    padding: 10,
    paddingHorizontal: 32,
    alignItems: "center",
    borderRadius: 4,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: "#F8F8FF",
    borderRadius: 10,
    padding: 20, // Add some padding to the content
    height: "45%",
    justifyContent: "center",
    alignSelf: "center",
    width: "92%",
    marginTop: "40%",
  },
  borrowerView: {
    width: "70%",

    justifyContent: "center",
  },
  ImgCon: {
    width: "30%",
    borderRadius: 6,
  },
  borrowerImage: {
    height: 106,

    borderRadius: 53,
  },

  contentContainer: {
    flex: 1,
    padding: 20,
     backgroundColor: "#F8F8FF",
  },
  bottomSheetBackground: {
    backgroundColor: "#F8F8FF",
  },
  handleStyle: {
    paddingVertical: 8,
    
  },
  handleIndicatorStyle: {
    // backgroundColor: "#ccc", 
  },
  borrowerNameInSheet: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Rubik-Regular",
    marginBottom: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Rubik-Regular",
  },

  editButtonText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Rubik-Regular",
    marginBottom: 12,
  },
  BottomSheetButton: {
    width: "20%",
  },
});
