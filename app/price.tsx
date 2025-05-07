// app/price.tsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5E1A" />

      {/* Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SMART MUSA</Text>
      </View>

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Banana Price Prediction</Text>
        <Text style={styles.subtitle}>
          Get accurate price predictions for your banana harvest in different markets across Sri Lanka.
        </Text>
        <Text style={styles.sinhalaSubtitle}>
          ඔබේ කෙසෙල් අස්වැන්න සඳහා ශ්‍රී ලංකාව පුරා විවිධ වෙළඳපොලවල් සඳහා නිවැරදි මිල අනාවැකි ලබා ගන්න.
        </Text>
      </View>

      {/* Price Prediction Button */}
      <TouchableOpacity style={styles.button} onPress={navigateToPrediction}>
        <Text style={styles.buttonText}>Check Market Prices</Text>
      </TouchableOpacity>

      {/* Chatbot Button */}
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={navigateToChatbot}>
        <Text style={styles.buttonText}>Ask Farming Assistant</Text>
      </TouchableOpacity>

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          Our price prediction system uses advanced machine learning algorithms to forecast banana prices 
          in various markets. We analyze historical price trends, seasonal patterns, and market demand 
          to provide farmers with actionable insights. This helps farmers decide when and where to sell 
          their harvest for maximum profit.
        </Text>

        <Text style={styles.descriptionTitle}>විස්තරය</Text>
        <Text style={styles.descriptionText}>
          අපගේ මිල අනාවැකි පද්ධතිය විවිධ වෙළඳපොලවල කෙසෙල් මිල පුරෝකථනය කිරීමට උසස් මැෂින් ලර්නිං ඇල්ගොරිතම භාවිතා කරයි. 
          ගොවීන්ට ක්‍රියාත්මක කළ හැකි අන්තර්දෘෂ්ටි සැපයීම සඳහා අපි ඓතිහාසික මිල ප්‍රවණතා, කාලීන රටා සහ වෙළඳපොල 
          ඉල්ලුම විශ්ලේෂණය කරමු. මෙය ගොවීන්ට උපරිම ලාභයක් සඳහා ඔවුන්ගේ අස්වැන්න විකුණන විට සහ කොතැනද යන්න 
          තීරණය කිරීමට උපකාරී වේ.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#2C5E1A',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  textContainer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 15,
  },
  sinhalaSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
    marginBottom: 15,
  },
});