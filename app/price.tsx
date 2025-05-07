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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';

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
  const router = useRouter();  
  
  const navigateToPrediction = () => {
    (router as any).push('/prediction');
  };

  const navigateToChatbot = () => {
    (router as any).push('/chatbot');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5E1A" />

      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SMART MUSA</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Main Content Card */}
          <View style={styles.mainCard}>
            <Text style={styles.title}>Banana Price Prediction</Text>
            
            <Text style={styles.subtitle}>
              Get accurate price predictions for your banana harvest in different markets across Sri Lanka.
            </Text>
            
            <Text style={styles.sinhalaSubtitle}>
              ඔබේ කෙසෙල් අස්වැන්න සඳහා ශ්‍රී ලංකාව පුරා විවිධ වෙළඳපොලවල් සඳහා නිවැරදි මිල අනාවැකි ලබා ගන්න.
            </Text>
            
            {/* Feature icons */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="trending-up" size={24} color="#2C5E1A" />
                </View>
                <Text style={styles.featureText}>Market Analysis</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="location" size={24} color="#2C5E1A" />
                </View>
                <Text style={styles.featureText}>Regional Prices</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="calendar" size={24} color="#2C5E1A" />
                </View>
                <Text style={styles.featureText}>Seasonal Trends</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToPrediction}
              activeOpacity={0.8}
            >
              <Ionicons name="bar-chart-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Check Market Prices</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={navigateToChatbot}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Ask Farming Assistant</Text>
            </TouchableOpacity>
          </View>

          {/* Description Card */}
          <View style={styles.descriptionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#2C5E1A" />
              <Text style={styles.descriptionTitle}>Description</Text>
            </View>
            
            <Text style={styles.descriptionText}>
              Our price prediction system uses advanced machine learning algorithms to forecast banana prices 
              in various markets. We analyze historical price trends, seasonal patterns, and market demand 
              to provide farmers with actionable insights. This helps farmers decide when and where to sell 
              their harvest for maximum profit.
            </Text>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#2C5E1A" />
              <Text style={styles.descriptionTitle}>විස්තරය</Text>
            </View>
            
            <Text style={styles.descriptionText}>
              අපගේ මිල අනාවැකි පද්ධතිය විවිධ වෙළඳපොලවල කෙසෙල් මිල පුරෝකථනය කිරීමට උසස් මැෂින් ලර්නිං ඇල්ගොරිතම භාවිතා කරයි. 
              ගොවීන්ට ක්‍රියාත්මක කළ හැකි අන්තර්දෘෂ්ටි සැපයීම සඳහා අපි ඓතිහාසික මිල ප්‍රවණතා, කාලීන රටා සහ වෙළඳපොල 
              ඉල්ලුම විශ්ලේෂණය කරමු. මෙය ගොවීන්ට උපරිම ලාභයක් සඳහා ඔවුන්ගේ අස්වැන්න විකුණන විට සහ කොතැනද යන්න 
              තීරණය කිරීමට උපකාරී වේ.
            </Text>
          </View>
          
          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Benefits for Farmers</Text>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="cash-outline" size={20} color="#fff" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Better Profit Margins</Text>
                <Text style={styles.benefitDescription}>
                  Make informed decisions on when and where to sell for maximum profit
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="time-outline" size={20} color="#fff" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Market Timing</Text>
                <Text style={styles.benefitDescription}>
                  Know the best time to sell based on predicted price trends
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="analytics-outline" size={20} color="#fff" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Data-Driven Decisions</Text>
                <Text style={styles.benefitDescription}>
                  Make farming decisions based on accurate data and predictions
                </Text>
              </View>
            </View>
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
    backgroundColor: '#fff',
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
  sinhalaSubtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 8,
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