import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Irrigation-specific Firebase configuration
export const irrigationFirebaseConfig = {
  apiKey: "AIzaSyD2RHVqqdwo7pUc2mPFtZoQmN6sIaX3KB8",
  authDomain: "smart-agriculture-2.firebaseapp.com",
  databaseURL: "https://smart-agriculture-2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-agriculture-2",
  storageBucket: "smart-agriculture-2.firebasestorage.app",
  messagingSenderId: "268809839687",
  appId: "1:268809839687:web:4463c1e9eeffbc17d2fd62",
};

// Initialize Firebase app with a unique name
export const irrigationApp = initializeApp(irrigationFirebaseConfig, "irrigationApp");

// For React Native, we'll just use standard auth for now
// The warning about AsyncStorage is not critical for development
export const irrigationAuth = initializeAuth(irrigationApp);

// Note: If you want to add persistence later, you'll need to:
// 1. Add @react-native-async-storage/async-storage to your project
// 2. Import the specific persistence method from firebase/auth/react-native
// We're skipping this for now to get the basic functionality working

export const irrigationDb = getDatabase(irrigationApp);