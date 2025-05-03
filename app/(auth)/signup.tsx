import { useState } from "react";
import { View, Alert, Keyboard } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Link, router } from "expo-router";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !age || !phone || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        age: Number(age),
        phone,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Signup successful!", "You can now log in.");
      router.replace("/login")
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      Alert.alert("Signup failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f4f4f4" }}>
      <Card style={{ padding: 20, borderRadius: 10 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom: 10 }}>Signup</Text>
          
          <TextInput 
            label="Full Name" 
            value={fullName} 
            onChangeText={setFullName} 
            mode="outlined" 
            style={{ marginBottom: 10 }}
            disabled={loading}
          />
          <TextInput 
            label="Age" 
            value={age} 
            onChangeText={setAge} 
            keyboardType="numeric" 
            mode="outlined" 
            style={{ marginBottom: 10 }}
            disabled={loading}
          />
          <TextInput 
            label="Phone Number" 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
            mode="outlined" 
            style={{ marginBottom: 10 }}
            disabled={loading}
          />
          <TextInput 
            label="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            mode="outlined" 
            style={{ marginBottom: 10 }}
            disabled={loading}
          />
          <TextInput 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            mode="outlined" 
            style={{ marginBottom: 10 }}
            disabled={loading}
          />
          
          <Button 
            mode="contained" 
            onPress={handleSignup} 
            style={{ marginBottom: 10 }}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Signup'}
          </Button>
          
          <Link href="/(auth)/login" asChild>
            <Button mode="text" disabled={loading}>
              Already have an account? Login
            </Button>
          </Link>
        </Card.Content>
      </Card>
    </View>
  );
}