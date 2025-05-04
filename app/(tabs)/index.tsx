import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';

import { useLanguage } from '@/components/LanguageContext';

export default function TabsHomeScreen() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const { language } = useLanguage(); // Get current language state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Fetch user data if logged in
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
      
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserName(userDoc.data().fullName);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const navigateTo = (screen: 'banana' | 'irrigation' | 'price' | 'disease' | 'profile') => {
    switch(screen) {
      case 'banana':
        router.push('/banana');
        break;
      case 'irrigation':
        router.push('/irrigation');
        break;
      case 'price':
        router.push('/price');
        break;
      case 'disease':
        router.push('/disease');
        break;
      // case 'profile':
      //   router.push('/profile');
      //   break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile & Welcome Section */}
      <Card style={styles.welcomeCard}>
        <View style={styles.welcomeCardInner}>
          <View style={styles.profileContainer}>
            <Image 
              source={require("@/assets/images/Profile.jpg")} 
              style={styles.profileImage} 
            />
            <Text 
              variant="titleMedium" 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              style={styles.welcomeText}
            >
              {language === "en" ? "Welcome" : "සාදරයෙන් පිළිගනිමු"}, {userName || (language === "en" ? "User" : "පරිශීලක")}!
            </Text>
          </View>          
        </View>
      </Card>

      {/* Feature Buttons Section */}
      <View style={styles.featureContainer}>
        {/* Feature Cards */}
        <TouchableOpacity style={styles.card} onPress={() => navigateTo('banana')}>
          <Image source={require("@/assets/images/banana.png")} style={styles.featureIcon} />
          <Text variant="titleSmall" style={styles.featureText}>
            {language === "en" ? "Banana Ripeness Prediction" : "කෙසෙල් පක්වත්වීම අනාවැකිය"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateTo('irrigation')}>
          <Image source={require("@/assets/images/irrigation.png")} style={styles.featureIcon} />
          <Text variant="titleSmall" style={styles.featureText}>
            {language === "en" ? "Smart Irrigation System" : "ස්මාර්ට් ජල පෝෂණ පද්ධතිය"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateTo('price')}>
          <Image source={require("@/assets/images/price.png")} style={styles.featureIcon} />
          <Text variant="titleSmall" style={styles.featureText}>
            {language === "en" ? "Price Prediction" : "මිල අනාවැකිය"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateTo('disease')}>
          <Image source={require("@/assets/images/disease.png")} style={styles.featureIcon} />
          <Text variant="titleSmall" style={styles.featureText}>
            {language === "en" ? "Disease Detection" : "රෝග හඳුනා ගැනීම"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20
  },
  welcomeCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  welcomeCardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  welcomeText: {
    flexWrap: "wrap",
    maxWidth: 250
  },
  settingsIcon: {
    width: 30,
    height: 30,
    tintColor: "#666"
  },
  featureContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    height: 150,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3
  },
  featureIcon: {
    width: 50,
    height: 50,
    marginTop: 20
  },
  featureText: {
    textAlign: "center",
    marginTop: 20
  }
});