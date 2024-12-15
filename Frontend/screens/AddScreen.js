import { AuthContext } from "../context/authcontext";
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar
} from "react-native";
import * as ImagePicker from "expo-image-picker";
// Cloudinary upload function
import { BASE_URLS} from "../Utils/config"
const AddScreen = () => {
  const {state} = useContext(AuthContext);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerMobile, setBorrowerMobile] = useState("");
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanDate, setLoanDate] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "borrower_image.jpg",
    });
    data.append("upload_preset", "bhlwqy1f");
    data.append("cloud_name", "dq0nttryr");
    data.append("Borrowers_Profile_Picture", "Borrowers"); // Specify folder here

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dq0nttryr/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();
      console.log("Cloudinary upload result:", result);

      // Check if the image upload was successful
      if (result.secure_url && result.public_id) {
        console.log("Image uploaded successfully:", result.secure_url);
        return {
          public_id: result.public_id,
          url: result.secure_url,
        }; // Return both secure_url and public_id
      } else {
        throw new Error("Failed to get image URL or public_id from Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
      return null;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Permission to access media library is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log("Image picked:", result.assets[0].uri); // Log the picked image URI
    }
  };

  const cancelImage = () => {
    setImage(null);
  };

  const SubmitLoanDetails = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        borrowerName,
        borrowerMobile,
        borrowerAddress,
        loans: [
          {
            loanAmount,
            interestRate,
            loanDate,
          },
        ],
      };

      // If an image is provided, upload it to Cloudinary
      if (image) {
        console.log("Uploading image:", image);
        const cloudinaryResult = await uploadImageToCloudinary(image);

        if (cloudinaryResult) {
          payload.imagePublicId = cloudinaryResult.public_id;
          payload.imageUrl = cloudinaryResult.url;
          console.log("Image details to submit:", cloudinaryResult);
        }
      }

      // Make the API call using fetchWithFallback
      const response = await fetch(`${BASE_URLS}/api/loan/addEntry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", "Loan details added successfully!");
        // setBorrowerName("");
        // setBorrowerMobile("");
        // setBorrowerAddress("");
        // setLoanAmount("");
        // setInterestRate("");
        // setLoanDate("");
        // setImage(null)

      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData.message || "Unknown error");
        Alert.alert("Error", errorData.message || "Something went wrong!");
      }
    } catch (error) {
      console.log("Error submitting loan details:", error);
      Alert.alert("Error", "Failed to submit loan details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar animated={true} hidden={true} />
      <ScrollView style={styles.FormContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Borrower's Name"
          value={borrowerName}
          onChangeText={setBorrowerName}
        />
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Enter Borrower's Phone No."
          value={borrowerMobile}
          onChangeText={setBorrowerMobile}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Borrower's Address"
          value={borrowerAddress}
          onChangeText={setBorrowerAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="eg. 2023-12-20"
          value={loanDate}
          onChangeText={setLoanDate}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter Loan Amount"
          value={loanAmount}
          onChangeText={setLoanAmount}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Interest Rate per Month (%)"
          value={interestRate}
          onChangeText={setInterestRate}
        />

        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>

        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.cancelButton} onPress={cancelImage}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {isSubmitting && (
          <ActivityIndicator
            size="large"
            color="#6183FE"
            style={styles.spinner}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={SubmitLoanDetails}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",

    padding: 16,
    backgroundColor: "#F8F8FF",
  },
  FormContainer: {
    marginTop: 0,
  },
  input: {
    height: 48,
    borderColor: "#6183FE",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#6183FE",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  imagePickerButton: {
    backgroundColor: "#6183FE",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
  },
  cancelButton: {
    backgroundColor: "#ff0000",
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  spinner: {
    marginVertical: 20,
  },
});
