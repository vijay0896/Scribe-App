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
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  StatusBar,
  Image
} from "react-native";
import { AuthContext } from "../context/authcontext";
import { BASE_URLS } from "../Utils/config";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const LoanDetails = ({ route }) => {
  const { state } = useContext(AuthContext);

  const { borrower } = route.params; // Retrieve borrower data from navigation
  const [loanDetails, setLoanDetails] = useState(borrower ? [borrower] : []); // Use borrower if passed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [isLoanDeleted, setIsLoanDeleted] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null); // Add this line
  const sheetRef = useRef(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false); // New state for overlay visibility

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
  const [editDetails, setEditDetails] = useState({
    loanAmount: "",
    interestRate: "",
    loanDate: "",
  });
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`,
  });
  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Invalid Date"; // or use an empty string if preferred
    }

    date = new Date(date); // Convert to a Date object if it’s a valid date string
    const day = String(date.getDate()).padStart(2, "0");

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const openBottomSheet = (loan) => {
    setSelectedLoan(loan); // Store full loan object instead of just ID
    setSelectedLoanId(loan._id);
    sheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  };

  const closeBottomSheet = () => {
    setSelectedLoanId(null);
    sheetRef.current?.close();
    setOverlayVisible(false);
    setIsBottomSheetOpen(false);
  };

  const handleBottomSheetChange = (index) => {
    if (index === -1) {
      setOverlayVisible(false);
      setIsBottomSheetOpen(false); // Hide overlay when the bottom sheet is closed
    } else {
      setOverlayVisible(true);
      // Show overlay when the bottom sheet is open
    }
  };
  // Function to parse 'dd-mmm-yyyy' format to a Date object
  const openEditModal = (loan) => {
    setSelectedLoan(loan); // Store full loan object
    setSelectedLoanId(loan._id); // Set the loan ID

    // Populate editDetails with loan data directly from 'loan' parameter, not from 'selectedLoan'
    setEditDetails({
      loanAmount: loan.loanAmount ? loan.loanAmount.toString() : "0",
      interestRate: loan.interestRate ? loan.interestRate.toString() : "0",
      loanDate: loan.loanDate ? formatDate(loan.loanDate) : "Not specified",
    });

    setEditModalVisible(true);

    closeBottomSheet(); // Close bottom sheet when edit modal is opened
  };

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");

    const monthIndex = monthNames.indexOf(month);
    return new Date(year, monthIndex, day);
  };
  const handleEditSave = async () => {
    if (!selectedLoan?._id) {
      console.error("No loan selected for editing.");
      return;
    }

    // Parse and validate the loan details
    const parsedDate = parseDate(editDetails.loanDate);
    if (!parsedDate || isNaN(parsedDate)) {
      console.error("Invalid loan date format.");
      return;
    }

    const updatedLoan = {
      loanAmount: parseFloat(editDetails.loanAmount),
      interestRate: parseFloat(editDetails.interestRate),
      loanDate: parsedDate.toISOString(),
    };

    try {
      // Build the endpoint

      // Use fetchWithFallback to handle multiple base URLs
      await fetch(
        `${BASE_URLS}/api/loan/UpdateBorrowerLoan/${borrower._id}/loans/${selectedLoan._id}`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedLoan),
        }
      );

      // Update loan details locally if the request was successful
      setLoanDetails((prevLoans) => {
        const updatedLoans = prevLoans[0].loans.map((loan) =>
          loan._id === selectedLoan._id ? { ...loan, ...updatedLoan } : loan
        );
        return [{ ...prevLoans[0], loans: updatedLoans }];
      });

      setEditModalVisible(false);
      Alert.alert("Success", "Loan details updated successfully.");
    } catch (error) {
      console.error("Error updating loan details:", error.message);
      Alert.alert("Error", "Failed to update loan details.");
    }
  };

  // Function to calculate total loan amount for a borrower
  const calculateTotalLoanAmountForBorrower = (loans) => {
    return loans.reduce((total, loan) => total + loan.loanAmount, 0);
  };

  // Function to calculate total interest for a borrower
  const calculateTotalInterestForBorrower = (loans) => {
    return loans.reduce((total, loan) => {
      const loanDate = new Date(loan.loanDate);
      const today = new Date();

      let monthsElapsed =
        (today.getFullYear() - loanDate.getFullYear()) * 12 +
        (today.getMonth() - loanDate.getMonth());

      // Handle case for days in the current month
      if (monthsElapsed === 0 && loanDate.getMonth() === today.getMonth()) {
        const daysElapsed = (today - loanDate) / (1000 * 60 * 60 * 24);
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        monthsElapsed = daysElapsed / daysInMonth;
      }

      if (monthsElapsed > 0) {
        let principal = loan.loanAmount;
        const interestRate = loan.interestRate / 100;

        // Simple interest for the first 12 months
        let simpleInterest = 0;

        // If more than 12 months, calculate compound interest
        if (monthsElapsed <= 12) {
          simpleInterest = principal * interestRate * monthsElapsed;
        } else {
          simpleInterest = principal * interestRate * 12;

          // Calculate the amount after 12 months
          let amountAfterFirstYear = principal + simpleInterest;
          let org = amountAfterFirstYear;
          let compoundInterest = 0;
          for (let i = 1; i <= monthsElapsed - 12; i++) {
            compoundInterest = org * interestRate;
            amountAfterFirstYear += compoundInterest;
          }

          simpleInterest += amountAfterFirstYear - principal - simpleInterest;
        }

        return total + simpleInterest;
      }

      return total;
    }, 0);
  };

  const fetchLoanDetails = async () => {
    try {
      // Use fetchWithFallback to handle multiple URLs
      const data = await fetch(`${BASE_URLS}/api/loan/getBorrowers`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      setLoanDetails(data.borrowers);

      // Calculate and set total loan amount and interest
      const totalLoanAmount = calculateTotalLoanAmountForBorrower(
        data.borrowers
      );
      const totalInterest = calculateTotalInterestForBorrower(data.borrowers);
      setTotalLoanAmount(totalLoanAmount);
      setTotalInterest(totalInterest);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan details:", error.message);
      setError("Unable to fetch loan details from all URLs.");
      setLoading(false);
    }
  };

  // Delete Borrower Loan with retry mechanism
  const deleteBorrowerLoan = async (borrowerId, loanId) => {
    try {
      await fetch(
        `${BASE_URLS}/api/loan/deleteBorrowerLoan/${borrowerId}/loans/${loanId}`,

        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      // Update loan details locally
      setLoanDetails((prevLoans) => {
        const updatedLoans = prevLoans[0].loans.filter(
          (loan) => loan._id !== loanId
        );
        return [{ ...prevLoans[0], loans: updatedLoans }];
      });
    } catch (error) {
      setError("Unable to delete loan from all URLs.");
    }
  };

  useEffect(() => {
    // Fetch loan details only if there's no borrower data passed
    if (!borrower && state.token) {
      fetchLoanDetails();
    } else if (borrower) {
      // If borrower is passed, calculate the total loan amount and interest directly
      const totalLoanAmount = calculateTotalLoanAmountForBorrower(
        borrower.loans || []
      );
      const totalInterest = calculateTotalInterestForBorrower(
        borrower.loans || []
      );

      setTotalLoanAmount(totalLoanAmount);
      setTotalInterest(totalInterest);
      setLoading(false);
    }
  }, [borrower, state.token, isLoanDeleted]);

  const handleDeleteLoan = async (loanId) => {
    if (!loanId) {
      // Console log can be added for debugging, but we'll return early if no loanId
      return;
    }

    // Alert before the deletion
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this loan?",
      [
        {
          text: "Cancel",
          style: "cancel", // Cancel button that just closes the alert
        },
        {
          text: "OK",
          onPress: async () => {
            closeBottomSheet(); // Close the bottom sheet or modal

            const borrowerId = borrower._id;

            try {
              // Call the delete function
              await deleteBorrowerLoan(borrowerId, loanId);

              // Filter out the deleted loan directly for the current borrower
              setLoanDetails((prevLoans) => {
                const updatedBorrowerLoans = prevLoans[0].loans.filter(
                  (loan) => loan._id !== loanId
                );
                return [{ ...prevLoans[0], loans: updatedBorrowerLoans }];
              });

              // Alert after successful deletion
              Alert.alert("Success", "Loan deleted successfully.");
            } catch (error) {
              console.error("Error deleting loan:", error);
              Alert.alert("Error", "Failed to delete loan. Please try again.");
            }
          },
        },
      ],
      { cancelable: false } // Prevent closing the alert by tapping outside
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
      <StatusBar animated={true} hidden={true} />
        <View>
          {loanDetails && loanDetails.length > 0 ? (
            loanDetails.map((borrower) => {
              const totalLoanAmount = calculateTotalLoanAmountForBorrower(
                borrower.loans
              );
              const totalInterest = calculateTotalInterestForBorrower(
                borrower.loans
              );
              const imageUrl = getImageUrl(borrower.imageUrl);
              return (
                <ScrollView key={borrower._id} style={styles.borrowerContainer}>
                  <View style={styles.borrowerData}>
                    <View style={styles.borrowerView}>
                      <Text style={styles.borrowerName}>
                        {borrower.borrowerName}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        Ph.no. {borrower.borrowerMobile}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        Addr. {borrower.borrowerAddress}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        Total Loan: ₹{totalLoanAmount.toLocaleString("en-IN")}
                      </Text>
                      <Text style={styles.borrowerDetail}>
                        Total Interest: ₹{totalInterest.toLocaleString("en-IN")}
                      </Text>

                      <Text style={styles.borrowerDetail}>
                        Total Amount: ₹
                        {(totalLoanAmount + totalInterest).toLocaleString(
                          "en-IN"
                        )}{" "}
                      </Text>
                    </View>
                    <View style={styles.ImgCon}>
                      {borrower.imageUrl && borrower.imageUrl.url ? (
                        <Image
                          source={{ uri: borrower.imageUrl.url }}
                          style={styles.borrowerImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.error(
                              "Image load error:",
                              error.nativeEvent.error
                            );
                          }}
                        />
                      ) : (
                        <Image style={styles.borrowerImage} />
                      )}
                    </View>
                  </View>

                  <View
                    style={[
                      {
                        borderBottomWidth: 0.96,
                        borderBottomColor: "#CFCFCF",
                        marginTop: 8,

                        opacity: 1,
                      },
                    ]}
                  ></View>

                  {borrower.loans && borrower.loans.length > 0 ? (
                    borrower.loans.map((loan, index) => {
                      const loanDate = new Date(loan.loanDate);
                      const today = new Date();

                      // Function to format the loan date as "DD-MMM-YYYY"

                      // Calculate the difference in total months
                      let totalMonthsElapsed =
                        (today.getFullYear() - loanDate.getFullYear()) * 12 +
                        (today.getMonth() - loanDate.getMonth());

                      // Calculate years and months
                      let yearsElapsed = Math.floor(totalMonthsElapsed / 12);
                      let monthsElapsed = totalMonthsElapsed % 12;

                      // Calculate the days difference
                      let daysElapsed = today.getDate() - loanDate.getDate();

                      // Adjust for negative day difference
                      if (daysElapsed < 0) {
                        monthsElapsed -= 1;
                        if (monthsElapsed < 0) {
                          yearsElapsed -= 1;
                          monthsElapsed += 12;
                        }
                        daysElapsed += new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          0
                        ).getDate();
                      }

                      // Formatting the elapsed time based on years, months, and days
                      // Formatting the elapsed time
                      let timeElapsedText = "";
                      if (
                        yearsElapsed > 0 ||
                        monthsElapsed > 0 ||
                        daysElapsed >= 0
                      ) {
                        timeElapsedText = `${
                          yearsElapsed > 0
                            ? `${yearsElapsed} y${yearsElapsed > 1 ? "s" : ""}`
                            : ""
                        }${
                          yearsElapsed > 0 &&
                          (monthsElapsed > 0 || daysElapsed > 0)
                            ? ", "
                            : ""
                        }${
                          monthsElapsed > 0
                            ? `${monthsElapsed} m${monthsElapsed > 1 ? "" : ""}`
                            : "0"
                        }${
                          (yearsElapsed > 0 || monthsElapsed > 0) &&
                          daysElapsed > 0
                            ? ", "
                            : ""
                        }${
                          daysElapsed > 0
                            ? `${daysElapsed} d${daysElapsed > 1 ? "" : ""}`
                            : ""
                        }`;
                      } else {
                        timeElapsedText = `${daysElapsed} d${
                          daysElapsed > 1 ? "" : ""
                        }`;
                      }
                      

                      return (
                        <TouchableOpacity
                          // key={index}
                          style={styles.loanContainer}
                          // onPress={() => handleLoanClick(loan._id)}
                          key={loan._id}
                          onLongPress={() => openBottomSheet(loan)} // Pass full loan object
                        >
                          <View style={styles.loanDetailsContainer}>
                            <Text style={styles.loanDetail}>
                              ₹{loan.loanAmount.toLocaleString("en-IN")}
                            </Text>
                            <Text style={styles.loanDetail}>
                              Int. {loan.interestRate}%
                            </Text>
                            <Text style={styles.loanDetail}>
                              {loanDate
                                ? formatDate(new Date(loanDate))
                                : "Not specified"}
                            </Text>
                          </View>

                          <View
                            style={{
                              borderBottomWidth: 0.96,
                              borderBottomColor: "#CFCFCF",
                              marginTop: 8,
                              opacity: 1,
                              marginBottom: 10,
                            }}
                          />

                          <View style={styles.loanSummaryContainer}>
                            <Text style={styles.loanDetail}>
                              Total Interest
                            </Text>
                            <Text style={styles.loanDetail}>Total Amount</Text>
                            <Text style={styles.loanDetail}>Time Elapsed</Text>
                          </View>

                          <View style={styles.loanSummaryContainer}>
                            <Text style={styles.loanValue}>
                              ₹
                              {calculateTotalInterestForBorrower([
                                loan,
                              ]).toLocaleString("en-IN")}
                            </Text>
                            <Text style={styles.loanValue}>
                              ₹
                              {(
                                loan.loanAmount +
                                calculateTotalInterestForBorrower([loan])
                              ).toLocaleString("en-IN")}
                            </Text>
                            <Text style={styles.loanValue}>
                              {timeElapsedText}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.noLoansText}>
                      No loans available for this borrower.
                    </Text>
                  )}
                </ScrollView>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No loan data available.</Text>
          )}
          {/* Bottom Sheet */}

          <Modal
            visible={isEditModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Loan Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Loan Amount"
                  value={editDetails.loanAmount}
                  onChangeText={(text) =>
                    setEditDetails({ ...editDetails, loanAmount: text })
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Interest Rate"
                  value={editDetails.interestRate}
                  onChangeText={(text) =>
                    setEditDetails({ ...editDetails, interestRate: text })
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Loan Date"
                  value={editDetails.loanDate}
                  onChangeText={(text) =>
                    setEditDetails({ ...editDetails, loanDate: text })
                  }
                />
                <Button title="Save" onPress={handleEditSave} />
                <Button
                  title="Cancel"
                  onPress={() => setEditModalVisible(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
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
      <BottomSheet
        ref={sheetRef}
        index={-1} // Initially closed
        snapPoints={["20%"]}
        enablePanDownToClose
        onChange={handleBottomSheetChange}
        onClose={() => setOverlayVisible(false)}
        backgroundStyle={styles.bottomSheetBackground} // Style for background overlay
        handleStyle={styles.handleStyle} // Style for the drag handle
        handleIndicatorStyle={styles.handleIndicatorStyle}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View
            style={[
              {
                borderBottomWidth: 0.7,
                borderBottomColor: "#CFCFCF",
                marginTop: 5,
                marginBottom: 15,
                opacity: 1,
              },
            ]}
          ></View>
          <TouchableOpacity
            onPress={() => openEditModal(selectedLoan)}
            style={styles.bottomSheetButton}
          >
            <Text style={styles.bottomSheetButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteLoan(selectedLoanId)}
            style={styles.bottomSheetButton}
          >
            <Text style={styles.bottomSheetButtonText}>Delete</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F8FF",
  },
  // Bottom Sheet Styles
  bottomSheetContent: { padding: 20, flex: 1, zIndex: 2 },
  bottomSheetButton: {
    width: "20%",
  },

  bottomSheetButtonText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Rubik-Regular",
    marginBottom: 12,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    zIndex: 0,
  },
  borrowerContainer: {
    padding: 16,
    backgroundColor: "#EDEDF4",
    borderRadius: 6,
    height: 740,
  },
  borrowerData: {
    display: "flex",
    flexDirection: "row",
  },
  borrowerView: {
    width: "60%",

    justifyContent: "center",
  },
  ImgCon: {
    width: "40%",
    borderRadius: 6,

    justifyContent: "center",
  },
  borrowerImage: {
    height: 125,
    width: 140,
    borderRadius: 5,
    alignSelf: "center",
  },

  borrowerName: {
    fontSize: 15,

    marginVertical: 3,
    color: "#656565",
    opacity: 1,
    fontFamily: "Rubik-Regular",
  },
  borrowerDetail: {
    fontSize: 12,
    color: "#656565",
    marginVertical: 1,
    fontWeight: "600",
    opacity: 1,
    fontFamily: "Rubik-Regular",
  },
  loanContainer: {
    padding: 12,
    marginTop: 8,
    borderRadius: 7,
    backgroundColor: "#F5F5FF",

    // iOS shadow
    shadowColor: "#555555",
    shadowOffset: {
      width: 0, // x position
      height: 4, // y position
    },
    shadowOpacity: 0.1, // 10% opacity
    shadowRadius: 69, // blur

    // Android elevation (as Android doesn't support all iOS shadow properties)
    elevation: 0.3, // spread 1
  },

  loanDetail: {
    fontSize: 12,

    color: "#656565",
    fontWeight: "600",
    fontFamily: "Rubik-Regular",
  },

  loanDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loanSummaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  loanValue: { color: "#656565", fontSize: 11.6, fontFamily: "Rubik-Regular" },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  noLoansText: {
    fontSize: 14,
    color: "red",
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
  },
});

export default LoanDetails;
