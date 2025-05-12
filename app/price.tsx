import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  StatusBar, 
  ScrollView,
  SafeAreaView,
  Image
} from 'react-native';
import { Stack, useRouter, Router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { useLanguage } from '@/components/LanguageContext';
import { useAppColorScheme } from '@/components/ThemeContext';

// Define a proper type for the router
type AppRouter = Router & {
  push: (route: string) => void;
  replace: (route: string) => void;
  back: () => void;
};

export default function PriceRoute() {
  return (
    <>        
      <Stack.Screen 
        options={{
          title: "Price Prediction",
          headerBackTitle: "Home"
        }} 
      />
      <PriceScreen />
    </>
  );
}

const PriceScreen = () => {
  const router = useRouter() as AppRouter;
  const { language } = useLanguage();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  
  const translations = {
    en: {
      appName: "SMART MUSA",
      title: "Banana Price Prediction",
      subtitle: "Get accurate price predictions for your banana harvest in different markets across Sri Lanka.",
      checkPricesButton: "Check Market Prices",
      askAssistantButton: "Ask Farming Assistant",
      descriptionTitle: "Description",
      description: "Our price prediction system uses advanced machine learning algorithms to forecast banana prices in various markets. We analyze historical price trends, seasonal patterns, and market demand to provide farmers with actionable insights. This helps farmers decide when and where to sell their harvest for maximum profit.",
      benefitsTitle: "Benefits for Farmers",
      benefits: [
        {
          icon: "cash-outline",
          title: "Better Profit Margins",
          description: "Make informed decisions on when and where to sell for maximum profit"
        },
        {
          icon: "time-outline",
          title: "Market Timing",
          description: "Know the best time to sell based on predicted price trends"
        },
        {
          icon: "analytics-outline",
          title: "Data-Driven Decisions",
          description: "Make farming decisions based on accurate data and predictions"
        }
      ],
      features: [
        { icon: "trending-up", text: "Market Analysis" },
        { icon: "location", text: "Regional Prices" },
        { icon: "calendar", text: "Seasonal Trends" }
      ]
    },
    si: {
      appName: "ස්මාර්ට් මූසා",
      title: "කෙසෙල් මිල පුරෝකථනය",
      subtitle: "ඔබේ කෙසෙල් අස්වැන්න සඳහා ශ්‍රී ලංකාව පුරා විවිධ වෙළඳපොලවල් සඳහා නිවැරදි මිල අනාවැකි ලබා ගන්න.",
      checkPricesButton: "වෙළඳපොල මිල පරීක්ෂා කරන්න",
      askAssistantButton: "ගොවිතැන් සහායකයෙන් අසන්න",
      descriptionTitle: "විස්තරය",
      description: "අපගේ මිල අනාවැකි පද්ධතිය විවිධ වෙළඳපොලවල කෙසෙල් මිල පුරෝකථනය කිරීමට උසස් මැෂින් ලර්නිං ඇල්ගොරිතම භාවිතා කරයි. ගොවීන්ට ක්‍රියාත්මක කළ හැකි අන්තර්දෘෂ්ටි සැපයීම සඳහා අපි ඓතිහාසික මිල ප්‍රවණතා, කාලීන රටා සහ වෙළඳපොල ඉල්ලුම විශ්ලේෂණය කරමු. මෙය ගොවීන්ට උපරිම ලාභයක් සඳහා ඔවුන්ගේ අස්වැන්න විකුණන විට සහ කොතැනද යන්න තීරණය කිරීමට උපකාරී වේ.",
      benefitsTitle: "ගොවීන් සඳහා ප්‍රතිලාභ",
      benefits: [
        {
          icon: "cash-outline",
          title: "වැඩි ලාභ ආන්තික",
          description: "උපරිම ලාභය සඳහා කවදා සහ කොහේද විකුණන්නේ යන්න පිළිබඳ දැනුවත් තීරණ ගන්න"
        },
        {
          icon: "time-outline",
          title: "වෙළඳපොල කාලය",
          description: "පුරෝකථනය කළ මිල ප්‍රවණතා මත පදනම්ව හොඳම විකුණුම් කාලය දැන ගන්න"
        },
        {
          icon: "analytics-outline",
          title: "දත්ත-පදනම් තීරණ",
          description: "නිවැරදි දත්ත සහ පුරෝකථන මත පදනම්ව ගොවිතැන් තීරණ ගන්න"
        }
      ],
      features: [
        { icon: "trending-up", text: "වෙළඳපොල විශ්ලේෂණය" },
        { icon: "location", text: "ප්‍රාදේශීය මිල ගණන්" },
        { icon: "calendar", text: "කාලීන ප්‍රවණතා" }
      ]
    }
  };

  // Get the current language text
  const t = language === 'si' ? translations.si : translations.en;

  const themedStyles = {
    safeArea: {
      ...styles.safeArea,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    scrollView: {
      ...styles.scrollView,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    mainCard: {
      ...styles.mainCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      shadowColor: isDark ? '#000' : '#000',
    },
    title: {
      ...styles.title,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    subtitle: {
      ...styles.subtitle,
      color: isDark ? '#e0e0e0' : '#444',
    },
    featureIcon: {
      ...styles.featureIcon,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f9f0',
      borderColor: isDark ? '#333333' : '#e0f0e0',
    },
    featureText: {
      ...styles.featureText,
      color: isDark ? '#cccccc' : '#444',
    },
    descriptionCard: {
      ...styles.descriptionCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    descriptionTitle: {
      ...styles.descriptionTitle,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    descriptionText: {
      ...styles.descriptionText,
      color: isDark ? '#e0e0e0' : '#444',
    },
    benefitsCard: {
      ...styles.benefitsCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    benefitsTitle: {
      ...styles.benefitsTitle,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    benefitTitle: {
      ...styles.benefitTitle,
      color: isDark ? '#e0e0e0' : '#333',
    },
    benefitDescription: {
      ...styles.benefitDescription,
      color: isDark ? '#cccccc' : '#555',
    },
  };
  
  const navigateToPrediction = () => {
    router.push('/prediction');
  };

  const navigateToChatbot = () => {
    router.push('/chatbot');
  };

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "light-content"} 
        backgroundColor="#2C5E1A" 
      />

      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.appName}</Text>
      </View>
      
      <ScrollView style={themedStyles.scrollView}>
        <View style={styles.container}>
          {/* Main Content Card */}
          <View style={themedStyles.mainCard}>
            <Text style={themedStyles.title}>{t.title}</Text>
            
            <Text style={themedStyles.subtitle}>{t.subtitle}</Text>
            
            {/* Feature icons */}
            <View style={styles.featuresContainer}>
              {t.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={themedStyles.featureIcon}>
                    <Ionicons 
                      name={feature.icon as any} 
                      size={24} 
                      color={isDark ? "#4CAF50" : "#2C5E1A"} 
                    />
                  </View>
                  <Text style={themedStyles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToPrediction}
              activeOpacity={0.8}
            >
              <Ionicons name="bar-chart-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t.checkPricesButton}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={navigateToChatbot}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t.askAssistantButton}</Text>
            </TouchableOpacity>
          </View>

          {/* Description Card */}
          <View style={themedStyles.descriptionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={isDark ? "#4CAF50" : "#2C5E1A"} 
              />
              <Text style={themedStyles.descriptionTitle}>{t.descriptionTitle}</Text>
            </View>
            
            <Text style={themedStyles.descriptionText}>{t.description}</Text>
          </View>
          
          {/* Benefits Card */}
          <View style={themedStyles.benefitsCard}>
            <Text style={themedStyles.benefitsTitle}>{t.benefitsTitle}</Text>
            
            {t.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name={benefit.icon as any} size={20} color="#fff" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={themedStyles.benefitTitle}>{benefit.title}</Text>
                  <Text style={themedStyles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 24,
  },
  header: {
    width: '100%',
    backgroundColor: '#2C5E1A',
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainCard: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
  },
  featureItem: {
    alignItems: 'center',
    width: '30%',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0f0e0',
  },
  featureText: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2C5E1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'justify',
    lineHeight: 22,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 16,
  },
  benefitsCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C5E1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});