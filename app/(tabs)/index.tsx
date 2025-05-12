import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { Text, View as ThemedView } from '@/components/Themed';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAppColorScheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { COLORS } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function TabsHomeScreen() {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const { language } = useLanguage(); // Get current language state
  const [greeting, setGreeting] = useState("");
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(language === "en" ? "Good Morning" : "සුභ උදෑසනක්");
    } else if (hour < 18) {
      setGreeting(language === "en" ? "Good Afternoon" : "සුභ දහවලක්");
    } else {
      setGreeting(language === "en" ? "Good Evening" : "සුභ සැන්දෑවක්");
    }
  }, [language]);

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
        <ActivityIndicator size="large" color="#2C5E1A" />
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
      case 'profile':
        // router.push('/profile');
        break;
    }
  };

  const getFeatureSubtitle = (feature: string) => {
    switch(feature) {
      case 'banana':
        return language === "en" ? "Classify banana ripeness" : "කෙසෙල් පක්වත්වීම වර්ග කරන්න";
      case 'irrigation':
        return language === "en" ? "Monitor & control irrigation" : "ජල පෝෂණය අධීක්ෂණය කරන්න";
      case 'price':
        return language === "en" ? "Predict market prices" : "වෙළඳ මිල පුරෝකථනය";
      case 'disease':
        return language === "en" ? "Detect leaf diseases" : "පත්‍ර රෝග හඳුනා ගන්න";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#121212' : '#f8f9fa' }
    ]}>
      {/* Gradient Header with SVG Wave */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#2C5E1A', '#4CAF50']}
          style={styles.headerGradient}
        >
          {/* Header content */}
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.profileContainer}>
                <Image 
                  source={require("@/assets/images/Profile.jpg")} 
                  style={styles.profileImage} 
                />
                <View>
                  <Text style={styles.greetingText}>{greeting}</Text>
                  <Text style={styles.usernameText}>
                    {userName || (language === "en" ? "User" : "පරිශීලක")}
                  </Text>
                </View>
              </View>              
            </View>
            
            <View style={styles.headerBanner}>
              <Text style={styles.bannerTitle}>
                {language === "en" ? "SMART MUSA" : "ස්මාර්ට් මූසා"}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {language === "en" 
                  ? "Your complete banana farming solution" 
                  : "ඔබේ සම්පූර්ණ කෙසෙල් වගා විසඳුම"}
              </Text>
            </View>
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
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          {language === "en" ? "Smart Farming Features" : "ස්මාර්ට් වගා විශේෂාංග"}
        </Text>
        
        {/* Feature Buttons Section */}
        <View style={styles.featureContainer}>
          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => navigateTo('banana')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4CAF50', '#2C5E1A']}
              style={styles.featureCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureIconContainer}>
                <Image source={require("@/assets/images/banana.png")} style={styles.featureIcon} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>
                  {language === "en" ? "Banana Ripeness" : "කෙසෙල් පක්වත්වීම"}
                </Text>
                <Text style={styles.featureSubtitle}>
                  {getFeatureSubtitle('banana')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.featureArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => navigateTo('irrigation')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#00BCD4', '#006064']}
              style={styles.featureCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureIconContainer}>
                <Image source={require("@/assets/images/irrigation.png")} style={styles.featureIcon} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>
                  {language === "en" ? "Smart Irrigation" : "ස්මාර්ට් ජල පෝෂණය"}
                </Text>
                <Text style={styles.featureSubtitle}>
                  {getFeatureSubtitle('irrigation')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.featureArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => navigateTo('price')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF9800', '#E65100']}
              style={styles.featureCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureIconContainer}>
                <Image source={require("@/assets/images/price.png")} style={styles.featureIcon} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>
                  {language === "en" ? "Price Prediction" : "මිල අනාවැකිය"}
                </Text>
                <Text style={styles.featureSubtitle}>
                  {getFeatureSubtitle('price')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.featureArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => navigateTo('disease')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#F44336', '#B71C1C']}
              style={styles.featureCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureIconContainer}>
                <Image source={require("@/assets/images/disease.png")} style={styles.featureIcon} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>
                  {language === "en" ? "Disease Detection" : "රෝග හඳුනා ගැනීම"}
                </Text>
                <Text style={styles.featureSubtitle}>
                  {getFeatureSubtitle('disease')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.featureArrow} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Quick Tip Section */}
        <View style={[styles.tipContainer, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={24} color="#2C5E1A" />
            <Text style={styles.tipTitle}>
              {language === "en" ? "Farming Tip of the Day" : "අද දිනයේ වගා ඉඟිය"}
            </Text>
          </View>
          <Text style={styles.tipContent}>
            {language === "en" 
              ? "Regular irrigation in the early morning or late evening helps reduce water loss due to evaporation. Adjust your watering schedule based on weather conditions."
              : "උදේ හෝ සවස් කාලයේ නියමිත ජල සම්පාදනය වාෂ්පීකරණය නිසා ජලය අපතේ යාම අඩු කිරීමට උපකාරී වේ. කාලගුණ තත්ත්වයන් මත පදනම්ව ඔබේ ජලය දැමීමේ කාලසටහන සකසන්න."}
          </Text>
        </View>
        
        {/* Weather Card */}        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    height: 220,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    width: '100%',
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
  headerContent: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  greetingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },  
  headerBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureContainer: {
    width: '100%',
  },
  featureCard: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    tintColor: '#fff',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featureArrow: {
    marginLeft: 8,
  },
  tipContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
  },  
});