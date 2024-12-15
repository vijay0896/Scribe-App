import React, { useState, useContext, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/authcontext";
import { BASE_URLS } from "../Utils/config";
const HomeScreen = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [loanDetails, setLoanDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowersCount, setBorrowersCount] = useState(0);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`,
  });
  // Function to calculate the total interest
  const calculateTotalInterest = (borrowers) => {
    const totalInterest = borrowers.reduce((sum, borrower) => {
      return (
        sum +
        borrower.loans.reduce((loanSum, loan) => {
          const loanDate = new Date(loan.loanDate);
          const today = new Date();

          let monthsElapsed =
            (today.getFullYear() - loanDate.getFullYear()) * 12 +
            (today.getMonth() - loanDate.getMonth());

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

            // For the first 12 months, calculate simple interest
            let simpleInterest = 0;
            if (monthsElapsed <= 12) {
              simpleInterest = principal * interestRate * monthsElapsed;
            } else {
              // First calculate simple interest for 12 months
              simpleInterest = principal * interestRate * 12;

              // Calculate the amount after 12 months
              let amountAfterFirstYear = principal + simpleInterest;
              let org = amountAfterFirstYear;
              let compoundInterest = 0;

              // Compound interest for the remaining months
              for (let i = 1; i <= monthsElapsed - 12; i++) {
                compoundInterest = org * interestRate; // Calculate interest on the total amount
                amountAfterFirstYear += compoundInterest; // Add interest to the principal amount
              }

              // Total interest is simple interest for the first year + compound interest for remaining months
              simpleInterest +=
                amountAfterFirstYear - principal - simpleInterest;
            }

            return loanSum + simpleInterest;
          } else {
            return loanSum;
          }
        }, 0)
      );
    }, 0);

    return totalInterest;
  };
  // Function to calculate the total loan amount
  const calculateTotalLoanAmount = (borrowers) => {
    const totalAmount = borrowers.reduce((sum, borrower) => {
      const loansSum = borrower.loans.reduce(
        (loanSum, loan) => loanSum + loan.loanAmount,
        0
      );
      return sum + loansSum;
    }, 0);

    return totalAmount;
  };
  const fetchDetails = async () => {
    try {
      // Fetch user details
      const userDetailsResponse = await fetch(`${BASE_URLS}/api/auth/user`, {
        method: "GET",
        headers: getAuthHeaders(state.token),
      });
      const userDetails = await userDetailsResponse.json();
      setUserDetails(userDetails);

      // Fetch loan details
      const loanDetailsResponse = await fetch(
        `${BASE_URLS}/api/loan/getBorrowers`,
        {
          method: "GET",
          headers: getAuthHeaders(state.token),
        }
      );
      const loanDetails = await loanDetailsResponse.json();

      // Update state with fetched data
      setLoanDetails(loanDetails.borrowers);
      setBorrowersCount(loanDetails.borrowers.length);
      setTotalLoanAmount(calculateTotalLoanAmount(loanDetails.borrowers));
      setTotalInterest(calculateTotalInterest(loanDetails.borrowers));
    } catch (error) {
      console.error("Failed to fetch details:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (state.token) {
        fetchDetails();
      }
    }, [state.token])
  );

  return (
    <View style={styles.container}>
      <StatusBar animated={true} hidden={true} />
      <View style={styles.Rect1}>
        {userDetails ? (
          <>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.title}>{userDetails.username}</Text>
            <Text style={styles.TotalBorAum}>Total borrow amount </Text>
            <Text style={styles.titleData}>
              ₹{totalLoanAmount.toLocaleString("en-IN")}
            </Text>
            <Image
              source={require("../assets/HomeScreenIcons/MoneyBag.png")}
              style={styles.imageMoneyBag}
            />
          </>
        ) : (
          <Text style={styles.noDataText}>No user.</Text>
        )}
      </View>
      <View style={styles.TwoRectsCon}>
        <View style={styles.TwoRect1}>
          <Text style={styles.title}>Total interest</Text>
          <Text style={styles.titleData}>
            ₹
            {totalInterest.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.TwoRect2}>
          <Text style={styles.title}>Total Amount</Text>
          <Text style={styles.titleData}>
            ₹
            {(totalLoanAmount + totalInterest).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
      <View style={styles.Rect3}>
        <Text style={styles.title}>Number</Text>
        <Text style={styles.title}>of borrowers </Text>
        <Text style={styles.titleData}>{borrowersCount}</Text>
        <Image
          source={require("../assets/HomeScreenIcons/LoanPerson.png")}
          style={styles.imageLoanPerson}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F8FF" },
  Rect1: {
    height: 140,
    backgroundColor: "#264653",
    borderRadius: 5,
    padding: 20,
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  titleData: { fontSize: 20, fontWeight: "600", color: "#FFFFFF" },
  TotalBorAum: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 5,
    fontWeight: "600",
  },
  TwoRectsCon: {
    height: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  TwoRect1: {
    width: "48.5%",
    borderRadius: 5,
    backgroundColor: "#496989",
    padding: 20,
    justifyContent: "center",
  },
  TwoRect2: {
    width: "48.5%",
    borderRadius: 5,
    backgroundColor: "#538392",
    padding: 20,
    justifyContent: "center",
  },
  Rect3: {
    height: 140,
    backgroundColor: "#7A88BC",
    borderRadius: 5,
    marginTop: 10,
    padding: 20,
    justifyContent: "center",
  },
  imageMoneyBag: {
    position: "absolute",
    right: -10,
    height: 100,
    width: 150,
  },
  imageLoanPerson: {
    position: "absolute",
    right: 7,
    height: 110,
    width: 110,
  },
});

export default HomeScreen;
