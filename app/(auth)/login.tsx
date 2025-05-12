import { useState, useEffect } from "react";
import { 
  View, 
  Alert, 
  Keyboard, 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import { Text } from "react-native";
import { TextInput } from "react-native";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { Link, router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

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
        router.replace("/");
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
      router.replace("/");
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C5E1A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with wave */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#2C5E1A', '#4CAF50']}
          style={styles.headerGradient}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SMART MUSA</Text>
          </View>
        </LinearGradient>
        
        {/* SVG Wave */}
        <View style={styles.svgContainer}>
          <Svg height="60" width={width} viewBox={`0 0 ${width} 60`} style={styles.svg}>
            <Path
              d={`M0 0 
                 C ${width * 0.3} 30, ${width * 0.7} 25, ${width} 0 
                 L ${width} 60 
                 L 0 60 
                 Z`}
              fill="#4CAF50"
            />
          </Svg>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue to Smart Musa</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={22} color="#666" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#666" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                autoComplete="password"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              >
                <Ionicons 
                  name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    height: 180,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  welcomeContainer: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 56,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#2C5E1A',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C5E1A',
  },
});