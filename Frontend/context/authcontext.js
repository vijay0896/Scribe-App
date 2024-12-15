import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
//context
const AuthContext = createContext();

//provider
const AuthProvider = ({ children }) => {
  //golbal state
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState({
    user: null,
    token: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  // Helper function to update login state
  const setIsLoggedIn = async (value) => {
    if (!value) {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("@auth");
      setState({ user: null, token: "" });
    } else {
      const data = await AsyncStorage.getItem("@auth");
      const parsed = JSON.parse(data);
      setState(parsed || { user: null, token: "" });
    }
  };
  // initial local storage data
  // useEffect(() => {
  //   const loadLoaclStorageData = async () => {
  //     let data = await AsyncStorage.getItem("@auth");
  //     let loginData = JSON.parse(data);

  //     setState({ ...state, user: loginData?.user, token: loginData?.token });
  //   };
  //   loadLoaclStorageData();
  // }, []);
  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem("@auth");
      const parsed = JSON.parse(data);
      if (parsed) {
        setState(parsed);
      }
    };
    loadData();
  }, []);

  let token = state && state.token;

  //default axios setting
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.baseURL =
    "https://react-native-server-4tfd.onrender.com/api/v1";

  const globalValues = {};

  return (
    <AuthContext.Provider
      value={{
        state,
        setState,
        forgotEmail,
        setForgotEmail,
        // isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
