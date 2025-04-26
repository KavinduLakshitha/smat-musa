import { useState, useEffect } from "react";
import { View, Alert, Keyboard, ActivityIndicator } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { Link, router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to tabs
        router.replace("/(tabs)");
      }
      // Finished checking, hide loading state
      setInitialLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Account temporarily locked.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while checking authentication state
  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f4f4f4" }}>
      <Card style={{ padding: 20, borderRadius: 10 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom: 20, textAlign: 'center' }}>
            Welcome Back
          </Text>

          <TextInput 
            label="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined" 
            style={{ marginBottom: 15 }}
            disabled={loading}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={secureTextEntry}
            autoComplete="password"
            mode="outlined" 
            style={{ marginBottom: 15 }}
            disabled={loading}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={secureTextEntry ? "eye-off" : "eye"} 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />          

          {loading ? (
            <ActivityIndicator size="large" color="#6200ea" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                style={{ marginBottom: 10 }}
                loading={loading}
                disabled={loading}
                icon="login"
              >
                Login
              </Button>
              
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <Text style={{ marginRight: 5 }}>Don't have an account?</Text>
                <Link href="/(auth)/signup" asChild>
                  <Button mode="text" compact disabled={loading}>
                    Sign Up
                  </Button>
                </Link>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}