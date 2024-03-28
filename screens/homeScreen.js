import {
  StyleSheet,
  View,
  Text,
  Alert,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { StatusBar } from 'react-native';
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { getAuth } from "firebase/auth";
import moment from "moment";
import { SvgXml } from "react-native-svg";
import { useTheme } from "../screens/ThemeContext";
import {Appearance} from 'react-native';


// Define your SVG icon
const svgIcon = `
<svg  id="icon" xmlns="http://www.w3.org/2000/svg" width="138" height="147" viewBox="0 20 1 100" fill="none">
<path d="M86.8773 65.98L88.9692 60.1308C89.4052 58.9236 88.5333 57.5312 87.3131 57.5312H61.8629L56.3718 72.2002L55.2386 61.8948H55.9365C56.3725 61.8948 56.8084 61.5237 56.8084 60.9661V58.1806C56.8084 57.7163 56.46 57.252 55.9365 57.252H51.6656C51.2297 57.252 50.7938 57.623 50.7938 58.1806V60.9661C50.7938 61.4304 51.1422 61.8948 51.6656 61.8948H52.4505L51.3173 72.2002L45.9137 57.8095C40.9453 59.0167 37.0234 63.3804 36.5006 68.9504L34.9321 84.6409C34.7576 86.2191 35.7163 87.6122 37.198 87.8907C38.7665 88.2618 40.9455 88.5409 43.1244 88.8194L44.5191 113.794C44.6061 115.929 46.2621 117.507 48.2666 117.507H59.5973C61.6018 117.507 63.1709 115.836 63.3448 113.794L65.2623 70.9937C65.2623 68.8585 66.9184 67.187 68.9229 67.187H85.3086C86.0059 67.187 86.6163 66.7227 86.8778 65.9799L86.8773 65.98Z" fill="#202020"/>
<path d="M65.7849 42.1193C65.7849 49.144 60.4384 54.8392 53.8438 54.8392C47.2492 54.8392 41.9033 49.144 41.9033 42.1193C41.9033 35.0947 47.2492 29.4001 53.8438 29.4001C60.4384 29.4001 65.7849 35.0947 65.7849 42.1193Z" fill="#202020"/>
<path d="M81.9093 73.5931C80.4277 71.3647 77.9873 72.7577 77.9873 74.4285C77.9873 76.0994 79.033 78.8848 80.1663 81.4843C82.1707 81.7628 84.2627 81.9487 86.5287 81.9487C88.7076 81.9487 90.7121 81.7628 92.6296 81.5776C93.8498 78.7922 94.983 75.8216 94.983 74.5218C94.983 72.5718 92.7171 71.6438 91.3224 73.6863C89.4917 76.3784 88.7951 72.4792 86.703 72.4792C84.611 72.4792 83.4783 76.0074 81.9091 73.5931L81.9093 73.5931Z" fill="#202020"/>
<path d="M92.9786 84.2698C90.9741 84.5483 88.7077 84.7341 86.4417 84.7341C84.1758 84.7341 81.9094 84.5483 79.9049 84.2698C75.1111 88.6333 69.7944 95.875 69.7944 102.374C69.7944 112.679 77.2032 117.6 86.4416 117.6C95.5933 117.6 103.089 112.772 103.089 102.374C103.089 95.8752 97.7721 88.6335 92.9783 84.2698H92.9786ZM87.662 108.594V110.544C87.662 110.73 87.4875 110.915 87.3136 110.915H85.5706C85.3961 110.915 85.2222 110.73 85.2222 110.544V108.688C83.3916 108.595 81.9975 107.109 81.8231 105.16C81.8231 104.974 81.9976 104.788 82.1714 104.788H84.0021C84.1765 104.788 84.3504 104.881 84.3504 105.067C84.4374 105.624 84.9608 106.088 85.5706 106.088H87.1391C88.0979 106.088 88.8821 105.345 88.9698 104.417C89.0567 103.303 88.2724 102.375 87.2268 102.375H86.0935C83.9146 102.375 81.9101 100.611 81.7356 98.2897C81.4742 95.8759 83.2172 93.7402 85.3963 93.369V91.419C85.3963 91.2332 85.5707 91.0479 85.7446 91.0479H87.4876C87.6621 91.0479 87.836 91.2338 87.836 91.419V93.2757C89.6666 93.3683 91.0607 94.8539 91.2351 96.8039C91.2351 96.9897 91.0607 97.1749 90.8868 97.1749H89.1438C88.9693 97.1749 88.7954 97.0823 88.7954 96.8965C88.7085 96.3395 88.185 95.8752 87.5752 95.8752H86.0067C85.0479 95.8752 84.2637 96.618 84.1761 97.546C84.0891 98.6599 84.8734 99.6812 85.9191 99.6812H87.2262C89.6666 99.6812 91.6711 101.91 91.4096 104.602C91.1482 106.645 89.5796 108.223 87.6621 108.594H87.662Z" fill="#202020"/>
</svg>
`;
const svgIcon2 = `
<svg id="icon2" xmlns="http://www.w3.org/2000/svg" width="138" height="147" viewBox="0 0 1 100" fill="none">
<path d="M83 41.5C83 64.4198 64.4198 83 41.5 83C18.5802 83 0 64.4198 0 41.5C0 18.5802 18.5802 0 41.5 0C64.4198 0 83 18.5802 83 41.5Z" fill="#202020" fill-opacity="0.18"/>
<path d="M34.5247 27.4013L31.6987 19.9136C33.7945 20.1331 35.8937 19.5339 37.5555 18.2419C38.0053 17.7011 38.5959 17.2937 39.2628 17.0659C39.9301 16.8381 40.6472 16.7977 41.3357 16.95C42.0752 17.1423 42.6699 17.6888 42.9218 18.4079C43.0372 19.0642 43.4358 19.6371 44.0119 19.975C45.2368 20.4355 46.6019 20.3429 47.7533 19.7217C48.3131 19.5299 49.3614 19.1669 49.4984 19.342C49.3478 22.2692 48.5233 25.1217 47.0887 27.68C45.1925 28.2612 43.2218 28.5654 41.2379 28.5843L41.2353 28.5839C38.9489 28.5549 36.6826 28.1554 34.5247 27.4013H34.5247ZM59.5426 57.4627C59.2986 59.5263 58.4216 61.4644 57.0319 63.0132C55.6418 64.5619 53.8064 65.6454 51.7758 66.1159C44.6002 67.878 37.1036 67.878 29.9276 66.1159C27.897 65.6453 26.0616 64.5619 24.6715 63.0132C23.2815 61.4646 22.4049 59.5265 22.1609 57.4627C20.8664 43.1456 30.9697 32.8876 33.6533 30.4333H33.6528C36.0846 31.2564 38.6309 31.6918 41.1989 31.7234H41.2306C43.6087 31.7041 45.9709 31.3331 48.2397 30.622C51.1759 33.3283 60.8056 43.3973 59.5427 57.4626L59.5426 57.4627ZM41.5146 47.2362C41.4516 47.2362 41.4199 47.2046 41.3565 47.2046C39.0833 46.0721 39.2727 45.4425 39.462 44.8762C39.5893 44.5268 39.821 44.2248 40.1258 44.011C40.4306 43.7972 40.794 43.6818 41.1671 43.6804H41.1988C41.5666 43.6633 41.9313 43.7599 42.2418 43.957C42.5528 44.1541 42.795 44.4421 42.9351 44.7818C43.2637 45.5843 44.1768 45.9763 44.9872 45.6629C45.3784 45.5105 45.6915 45.2085 45.8576 44.824C46.0236 44.4399 46.0285 44.0053 45.8712 43.6177C45.3308 42.2385 44.1745 41.1905 42.7457 40.7859V39.5585C42.743 38.6906 42.0378 37.9877 41.167 37.9851C40.7468 37.9812 40.3429 38.1454 40.046 38.4417C39.7492 38.7376 39.584 39.1401 39.5884 39.5585V40.817C38.1177 41.2977 36.9598 42.4399 36.4624 43.9008C35.1996 47.7081 38.8934 49.5018 40.0931 50.068C40.1561 50.0997 40.1878 50.1308 40.2508 50.1308C42.5557 51.2634 43.0922 51.7985 42.8711 52.7423C42.7134 53.403 41.8924 53.6861 41.2294 53.7493H41.0083L41.0088 53.7497C40.5419 53.7941 40.0719 53.7015 39.657 53.4833C39.2421 53.2655 38.8998 52.9315 38.6726 52.5224C38.3338 51.7256 37.4155 51.3485 36.6121 51.6755C35.8083 52.003 35.418 52.9131 35.7365 53.7182C36.4249 55.3099 37.874 56.4464 39.5883 56.7388V57.3683C39.5839 57.7867 39.7491 58.1892 40.046 58.4855C40.3428 58.7814 40.7467 58.9456 41.167 58.9416C42.0378 58.939 42.743 58.2362 42.7456 57.3683V56.6132C43.5107 56.4311 44.2115 56.0452 44.7734 55.4965C45.335 54.9478 45.7363 54.2568 45.9341 53.4978C46.8185 49.8165 43.5036 48.2116 41.5145 47.2362L41.5146 47.2362Z" fill="white"/>
</svg>
`;
const svgIcon3 = `
<svg id="icon2" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 10 100" fill="none">
    <path d="M83 41.5C83 64.4198 64.4198 83 41.5 83C18.5802 83 0 64.4198 0 41.5C0 18.5802 18.5802 0 41.5 0C64.4198 0 83 18.5802 83 41.5Z" fill="#202020" fill-opacity="0.18"/>
    <g transform="translate(7, 7) scale(1.4)"> 
        <path d="M14.2588 12.7523V22.3216C14.2588 24.076 15.6942 25.5114 17.4486 25.5114H33.3974C35.1518 25.5114 36.5872 24.076 36.5872 22.3216V12.7523C36.5872 10.9979 35.1518 9.5625 33.3974 9.5625H17.4486C15.6942 9.5625 14.2588 10.9979 14.2588 12.7523ZM30.2077 14.3472H20.6383V12.7523H30.2077V14.3472Z" fill="#FF4F79"/>
        <path d="M41.0531 28.8605C40.7341 28.5416 40.2556 28.2226 39.2987 28.0631C38.3417 27.9036 33.2381 27.2656 32.6002 27.1062C31.6432 26.9467 30.5268 27.4251 29.0914 28.3821C28.1345 29.02 26.2206 30.1365 26.0611 30.1365C26.2206 30.2959 27.0181 30.2959 27.0181 30.2959H27.1775C28.9319 30.2959 30.2078 31.7314 30.2078 33.3263V33.6452C30.2078 35.3996 28.7724 36.6755 27.1775 36.6755H23.8283C20.9575 36.6755 18.2462 33.8047 18.2462 33.8047C18.2462 33.8047 21.5954 35.0806 23.8283 35.0806H27.0181C27.975 35.0806 28.6129 34.2832 28.6129 33.4857C28.6129 32.6883 27.975 31.8908 27.1775 31.8908C24.1473 31.5719 22.8713 30.2959 22.8713 30.2959C22.8713 30.2959 20.16 28.2226 19.2031 27.7441C15.8538 25.8302 9.63379 29.8175 9.63379 29.8175L13.7805 38.9084C13.7805 38.9084 15.8538 37.6325 18.7246 38.7489C20.6385 39.5464 21.7549 40.1843 23.6688 40.8223C26.3801 41.7792 27.337 41.6197 29.0914 40.3438C30.6863 39.2274 38.3417 33.1668 39.4582 32.3693C41.0531 30.9339 41.8505 29.8175 41.0531 28.8605Z" fill="#FF4F79"/>
    </g>
</svg>

`;
const svgIcon4 = `
<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 512 512" id="interest"><path fill="#fdd8ae" d="M115.9,453l55.43-12.87a39.17,39.17,0,0,1,17.27-.1l133.87,29.51A57.06,57.06,0,0,0,368,460.18l126.81-91a23.75,23.75,0,0,0,9.87-20.68h0A23.73,23.73,0,0,0,474.1,327.2l-177,53.87L139.6,329.8Z"></path><path fill="#fbbf7d" d="M158.6,440a39.17,39.17,0,0,0-17.27.1l-24,5.58L115.9,453l49.44-11.48Z"></path><path fill="#fdd8ae" d="M104.89,325.28l78.8-23.72A110.65,110.65,0,0,1,259.63,306l75.14,32.66a25,25,0,0,1,14.31,29h0a25,25,0,0,1-29.78,18.35l-42.68-9.63Z"></path><path fill="#fbbf7d" d="M319.3,371.08l-42.68-9.63h0a18.76,18.76,0,0,0,14.64,18.3l33.37,7.53c13.45,3,24.45-5.76,24.45-19.55h0a24.92,24.92,0,0,0-.41-13.56A25,25,0,0,1,319.3,371.08Z"></path><path fill="#2370b5" d="M151.36,479,91.2,489.38,0,505.15V308.91l58.41-8.79,60.16-10.43a17,17,0,0,1,19.7,13.89l27,155.66A17,17,0,0,1,151.36,479Z"></path><path fill="#0a56a4" d="M163.49,449.16A17,17,0,0,1,151.36,458L91.2,468.42,0,484.19v21l91.2-15.77L151.36,479a17,17,0,0,0,13.88-19.71Z"></path><path fill="#0a56a4" d="M151.36,479,91.2,489.38,58.41,300.12l60.16-10.43a17,17,0,0,1,19.7,13.89l27,155.66A17,17,0,0,1,151.36,479Z"></path><path fill="#144e92" d="M165.24,459.24l-27-155.66a17,17,0,0,0-19.7-13.89l-9.81,1.7,26.48,152.85A17,17,0,0,1,121.36,464L87.8,469.77l3.4,19.61L151.36,479A17,17,0,0,0,165.24,459.24Z"></path><path fill="#eb304a" d="M394.24,11.39h0a24.56,24.56,0,0,1,35.08,9.4h0a24.56,24.56,0,0,0,23,13.25h0A24.57,24.57,0,0,1,478,59.72h0a24.56,24.56,0,0,0,13.25,23h0a24.56,24.56,0,0,1,9.4,35.08h0a24.55,24.55,0,0,0,0,26.51h0a24.55,24.55,0,0,1-9.4,35.07h0a24.57,24.57,0,0,0-13.25,23h0A24.57,24.57,0,0,1,452.28,228h0a24.55,24.55,0,0,0-23,13.26h0a24.57,24.57,0,0,1-35.08,9.4h0a24.55,24.55,0,0,0-26.51,0h0a24.56,24.56,0,0,1-35.07-9.4h0a24.56,24.56,0,0,0-23-13.26h0A24.57,24.57,0,0,1,284,202.3h0a24.56,24.56,0,0,0-13.26-23h0a24.56,24.56,0,0,1-9.4-35.07h0a24.55,24.55,0,0,0,0-26.51h0a24.57,24.57,0,0,1,9.4-35.08h0a24.55,24.55,0,0,0,13.26-23h0A24.57,24.57,0,0,1,309.7,34h0a24.57,24.57,0,0,0,23-13.25h0a24.55,24.55,0,0,1,35.07-9.4h0A24.55,24.55,0,0,0,394.24,11.39Z"></path><path fill="#e4222e" d="M500.61 117.76h0a24.56 24.56 0 0 0-9.4-35.08h0a24.56 24.56 0 0 1-13.25-23h0A24.57 24.57 0 0 0 452.28 34h0a24.56 24.56 0 0 1-23-13.25h0A24.55 24.55 0 0 0 395 10.93a24.44 24.44 0 0 1 9.31 9.86h0a24.56 24.56 0 0 0 23 13.25h0A24.57 24.57 0 0 1 453 59.72h0a24.56 24.56 0 0 0 13.25 23h0a24.56 24.56 0 0 1 9.4 35.08h0a24.55 24.55 0 0 0 0 26.51 24.55 24.55 0 0 1-9.4 35.07h0a24.57 24.57 0 0 0-13.25 23h0A24.57 24.57 0 0 1 427.28 228h0a24.55 24.55 0 0 0-23 13.26A24.44 24.44 0 0 1 395 251.1a24.56 24.56 0 0 0 34.31-9.86 24.55 24.55 0 0 1 23-13.26h0A24.57 24.57 0 0 0 478 202.3h0a24.57 24.57 0 0 1 13.25-23h0a24.55 24.55 0 0 0 9.4-35.07A24.55 24.55 0 0 1 500.61 117.76zM342.73 11.39h0a24.56 24.56 0 0 0 25.76.45c-.25-.15-.51-.29-.76-.45h0A24.54 24.54 0 0 0 342 10.93zM342.73 250.64h0l-.76.46a24.56 24.56 0 0 0 25.76-.46h0c.25-.16.51-.3.76-.45A24.56 24.56 0 0 0 342.73 250.64z"></path><path fill="#fff" d="M341.77 125.7a33.87 33.87 0 1 1 24-9.91A33.79 33.79 0 0 1 341.77 125.7zm0-52.79a18.91 18.91 0 1 0 13.37 5.54A18.77 18.77 0 0 0 341.77 72.91zM420.19 204.11a33.87 33.87 0 1 1 24-9.91h0A33.79 33.79 0 0 1 420.19 204.11zm0-52.78a18.9 18.9 0 1 0 13.36 32.26h0a18.9 18.9 0 0 0-13.36-32.26zM330.29 189.21a7.5 7.5 0 0 1-5.3-12.8L426.38 75A7.5 7.5 0 1 1 437 85.62L335.59 187A7.44 7.44 0 0 1 330.29 189.21z"></path></svg>

`;


const HomeScreen = ({ navigation }) => {
  const [borrowersCount, setBorrowersCount] = useState(0);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [Total_interestRate, setinterestRate] = useState(0);
  const [darkTheme, setDarkTheme] = useState(false);
  const { isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const colorScheme = Appearance.getColorScheme();
  console.log(colorScheme);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setIsLoggedIn(true);
      const uid = currentUser.uid;
      const database = getDatabase();
      const userLoanRef = ref(database, `users/${uid}/loan`);

      const fetchBorrowersCount = () => {
        onValue(userLoanRef, (snapshot) => {
          const loanData = snapshot.val();
          if (loanData) {
            const borrowers = Object.keys(loanData);
            const count = borrowers.length;
            let totalAmount = 0;
            let totalInterest = 0;
            let Total_interestRate = 0;
            borrowers.forEach((borrower) => {
              totalAmount += loanData[borrower].loanAmount || 0;
              Total_interestRate += loanData[borrower].interestRate || 0;
              const borrowDate = loanData[borrower].borrowDate;
              const timeElapsedInYears =
                calculateTimeElapsedInYears(borrowDate);
              const interest = calculateCompoundInterest(
                loanData[borrower].loanAmount,
                loanData[borrower].interestRate,
                timeElapsedInYears
              );
              totalInterest += interest;
            });
            setBorrowersCount(count);
            setTotalLoanAmount(totalAmount);
            setTotalInterest(totalInterest);
            setinterestRate(Total_interestRate);
          } else {
            setBorrowersCount(0);
            setTotalLoanAmount(0);
            setTotalInterest(0);
          }
        });
      };

      fetchBorrowersCount();

      return () => {
        off(userLoanRef);
      };
    }
  }, []);

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

  const onPressHandler = () => {
    Alert.alert("Button Pressed");
  };
  // Add this useEffect to toggle dark theme based on the isDarkMode value
  useEffect(() => {
    setDarkTheme(isDarkMode);
  }, [isDarkMode]);
  

  return (
    
    <ScrollView
    contentContainerStyle={[
        styles.container,
        darkTheme ? styles.darkContainer : null // Apply dark theme styles if darkTheme is true
      ]}
    >
      <StatusBar 
        hidden={false} 
        backgroundColor={isDarkMode ? "#0f0f0f" : "#fff"}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent={true}
      />
   
      {isLoggedIn ? (
        
        <View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.card]}>
              <Text style={styles.text}>No. of Borrowers </Text>
              <Text style={styles.textl}>
                {borrowersCount.toLocaleString()}
              </Text>
              <SvgXml
                xml={svgIcon}
                width="90%"
                height="90%"
                style={{
                  position: "absolute",
                  top: 10,
                  left: 85,
                  opacity: 0.97,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              />
            </View>

            <View style={[styles.card2,{ backgroundColor: isDarkMode? "#00FFDD" : "#0BF4C8" }]}>
              <Text style={styles.text}>Total Borrow Amount</Text>
              <Text style={styles.textl}>
                ₹ {totalLoanAmount.toLocaleString()}
              </Text>
              <SvgXml
                xml={svgIcon2}
                width="90%"
                height="90%"
                style={{
                  position: "absolute",
                  top: 26,
                  left: 105,
                  opacity: 0.97,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              />
            </View>
            <View style={[styles.card3,{ backgroundColor: isDarkMode? "#378CE7" : "#378CE7" }]}>
              <Text style={styles.text}>Total Interest</Text>
              <Text style={styles.textl}>
                ₹ {Math.floor(totalInterest).toLocaleString()}
              </Text>
              <Image
                source={require("../assets/tax.png")}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 25,
                  opacity: 0.97,
                  height: 90,
                  width: 90,
                }}
              />
            </View>
            <View style={styles.card4}>
              <Text style={styles.text}>Total Amount:</Text>
              <Text style={styles.textl}>
                ₹ {Math.floor(totalInterest + totalLoanAmount).toLocaleString()}
              </Text>
              <SvgXml
                xml={svgIcon3}
                width="90%"
                height="90%"
                style={{
                  position: "absolute",
                  top: 26,
                  left: 105,
                  opacity: 0.97,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              />
            </View>
            
          </View>
        </View>
      ) : (
        <Text style={[styles.textSign,{ color: isDarkMode ? "#FFF" : "#181823" }]}>You need to sign in</Text>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F8FF",
    paddingHorizontal: 10,
    width: "100%",
    height: "100%",
  },
  darkContainer: {
    backgroundColor: '#0f0f0f', // Dark background color
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
    color: "#131215",
    marginLeft: 10,
    marginTop: 12,
  },
  textSign: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
    color: "#131215",
    textAlign: "center",
    paddingVertical:"90%"
   
  },
  textl: {
    fontSize: 20,

    fontWeight: "600",
    color: "#131215",
    marginLeft: 10,
    marginTop: 10,
  },
  rowContainer: {
    height: "85%",
  },
  card: {
    flex: 1,
    borderRadius: 10,
   backgroundColor: "background-image: linear-gradient( 112.7deg,  rgba(253,185,83,1) 11.4%, rgba(255,138,0,1) 70.2% );",
   
   marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginBottom: 8,
    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card2: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#0BF4C8",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
  card3: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "linear-gradient(90deg, rgba(134,227,255,1) 0%, rgba(255,255,255,1) 100%);",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginBottom: 8,
    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card4: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#F6F5F5",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    shadowColor: "rgba(0, 0, 0, 0.4)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
  card5: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#ffff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    shadowColor: "rgba(0, 0, 0, 0.4)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 12,
  },
});
