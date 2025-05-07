import React from 'react';
import { 
  Image, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  StatusBar, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';

export default function DiseaseRoute() {
  return (
    <>        
      <Stack.Screen 
        options={{
          title: "Disease Detection",
          headerBackTitle: "Home"
        }} 
      />
      <DiseaseScreen />
    </>
  );
}

const DiseaseScreen = () => {
  const router = useRouter();  
  const navigateToUpload = () => {
    (router as any).push('/upload');
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
          {/* Banana Leaf Image with Shadow */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('@/assets/images/banana-leaf.jpg')} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
          
          {/* Title & Description Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Banana Leaf Disease</Text>
            <Text style={styles.subtitle}>
              You can upload your image and check whether the banana leaf is infected or not.
            </Text>
            <Text style={styles.sinhalaSubtitle}>
              කෙසෙල් කොළ රෝග හඳුනා ගැනීමේ මාර්ගය - ඔබේ කෙසෙල් කොළ රෝග හඳුනා ගැනීමට මෙම යෙදුම භාවිතා කරන්න.
            </Text>
            
            {/* Upload Image Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToUpload}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Upload the Image</Text>
            </TouchableOpacity>
          </View>
          
          {/* Description Section Card */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              Banana plants are susceptible to several devastating diseases, including "Black Sigatoka" 
              and "Panama Disease". These infections can severely impact crop yield and quality. 
              Early detection and timely intervention using advanced AI-based solutions can help 
              farmers mitigate losses and ensure healthier banana cultivation.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.descriptionTitle}>විස්තරය</Text>
            <Text style={styles.descriptionText}>
              කෙසෙල් ශාක "කළු සිගටෝකා",
              "පැනමා රෝගය" ඇතුළු විනාශකාරී රෝග කිහිපයකට ගොදුරු වේ. මෙම ආසාදන බෝග අස්වැන්න සහ ගුණාත්මක භාවයට දැඩි ලෙස බලපෑ හැකිය. උසස් AI පාදක විසඳුම් භාවිතයෙන් කල්තියා හඳුනා ගැනීම සහ කාලෝචිත මැදිහත්වීම
              ගොවීන්ට පාඩු අවම කර ගැනීමට සහ සෞඛ්‍ය සම්පන්න කෙසෙල් වගාව සහතික කිරීමට උපකාරී වේ.
            </Text>
            
            {/* Benefits Section */}
            <Text style={styles.benefitsTitle}>Benefits of Early Detection</Text>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>🌱</Text>
              </View>
              <Text style={styles.benefitText}>Prevents spread to healthy plants</Text>
            </View>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>💰</Text>
              </View>
              <Text style={styles.benefitText}>Reduces crop losses and economic impact</Text>
            </View>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>🔬</Text>
              </View>
              <Text style={styles.benefitText}>Allows for targeted treatment approaches</Text>
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
  imageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  card: {
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
    alignItems: 'center',
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
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  sinhalaSubtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
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
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'justify',
    marginBottom: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginTop: 8,
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitIconText: {
    fontSize: 18,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
});