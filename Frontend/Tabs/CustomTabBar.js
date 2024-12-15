import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";

const CustomTabBar = ({ state, descriptors, navigation, isKeyboardVisible }) => {
  // Check if state or descriptors are undefined
  if (!state || !descriptors) {
    console.error("State or descriptors are undefined!");
    return null;
  }

  // Check if navigation is undefined or doesn't have expected properties
  if (!navigation || !navigation.emit) {
    console.error("Navigation is invalid!");
    return null;
  }

  // Check if isKeyboardVisible is undefined
  if (isKeyboardVisible) {
    return null; // Hide bottom navigation when keyboard is visible
  }

  return (
    <View
      style={{
        flexDirection: "row",
        height: isKeyboardVisible ? 0 : 58, // Hide navigation bar when keyboard is visible
        overflow: "hidden", // Hide overflow content when height is 0
        backgroundColor: "#EDEDF4",
       
         // Always use light theme background
        borderTopWidth: 0,
        borderTopColor: "rgba(138, 141, 147, 0.5)",
        marginTop: 0,
      
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const renderIcon = () => {
          switch (label) {
            case "Dashboard":
              return isFocused
             
                ? require("../assets/dashboad.png")
                : require("../assets/DashboadOutline.png");
            case "Borrowers":
              return isFocused
                ? require("../assets/Borrowfill.png")
                : require("../assets/BorrowOutline.png");
            case "Add":
              return isFocused
                ? require("../assets/AddFill.png")
                : require("../assets/AddOutline.png");
            case "Account":
              return isFocused
                ? require("../assets/AccountFill.png")
                : require("../assets/AccountOutline.png");
            default:
              return null;
          }
        };
       
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            key={index}
          >
            <Image
              source={renderIcon()}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: isFocused ? "#6183FE" : "#393939ee",
              }}
            />
            <Text
              style={{
                color: isFocused ? "#6183FE" : "#393939ee",
                fontSize: 12,
                textAlign: "justify",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
