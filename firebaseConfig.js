import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBW-X0xarVmTr4UksbyBIgv78XhGjZddAw",
    authDomain: "banana-b6a45.firebaseapp.com",
    projectId: "banana-b6a45",
    storageBucket: "banana-b6a45.firebasestorage.app",
    messagingSenderId: "997409513790",
    appId: "1:997409513790:web:d543aa8a2644429ad40c6f"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
