<ThemeProvider theme={{ mode: "dark" }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#0f0f0f", // Dark background color
            },
            headerTintColor: "#ffffff", // Text color
            
          }}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={({ navigation }) => ({
              headerRight: () => (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => navigation.navigate("Home")}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              ),
              headerStyle: {},
              headerShown: false,
              
            })}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={({}) => ({
              headerStyle: {},
              headerShown: false,
            })}
          />

          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false, headerStyle: {} 
            
          }} 
          />
          <Stack.Screen name="Add" component={Add} />
         
          <Stack.Screen
            name="Borrow"
            component={Borrow}
            options={{ title: "My profile" }}
          />
          <Stack.Screen
            name="My Profile"
            component={MyProfile}
            
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>