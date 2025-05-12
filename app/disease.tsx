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
import { useLanguage } from '@/components/LanguageContext';
import { useAppColorScheme } from '@/components/ThemeContext';

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
  const { language } = useLanguage();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const navigateToUpload = () => {
    (router as any).push('/upload');
  };

  const themedStyles = {
    safeArea: {
      ...styles.safeArea,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    scrollView: {
      ...styles.scrollView,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    card: {
      ...styles.card,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    title: {
      ...styles.title,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    subtitle: {
      ...styles.subtitle,
      color: isDark ? '#e0e0e0' : '#555',
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
    benefitsTitle: {
      ...styles.benefitsTitle,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    benefitIcon: {
      ...styles.benefitIcon,
      backgroundColor: isDark ? '#263328' : '#e8f5e9',
    },
    benefitText: {
      ...styles.benefitText,
      color: isDark ? '#e0e0e0' : '#444',
    },
  };

  // Define the interface for the text structure
  interface TextContent {
    appName: string;
    title: string;
    subtitle: string;
    uploadButton: string;
    description: {
      title: string;
      content: string;
    };
    benefits: {
      title: string;
      items: string[];
    };
  }

  // Define the interface for the languages object
  interface LanguageText {
    en: TextContent;
    si: TextContent;
  }

  // Text content based on language
  const text: LanguageText = {
    en: {
      appName: "SMART MUSA",
      title: "Banana Leaf Disease",
      subtitle: "You can upload your image and check whether the banana leaf is infected or not.",
      uploadButton: "Upload the Image",
      description: {
        title: "Description",
        content: "Banana plants are susceptible to several devastating diseases, including \"Black Sigatoka\" and \"Panama Disease\". These infections can severely impact crop yield and quality. Early detection and timely intervention using advanced AI-based solutions can help farmers mitigate losses and ensure healthier banana cultivation."
      },
      benefits: {
        title: "Benefits of Early Detection",
        items: [
          "Prevents spread to healthy plants",
          "Reduces crop losses and economic impact",
          "Allows for targeted treatment approaches"
        ]
      }
    },
    si: {
      appName: "ස්මාර්ට් මූසා",
      title: "කෙසෙල් කොළ රෝග",
      subtitle: "කෙසෙල් කොළ රෝග හඳුනා ගැනීමේ මාර්ගය - ඔබේ කෙසෙල් කොළ රෝග හඳුනා ගැනීමට මෙම යෙදුම භාවිතා කරන්න.",
      uploadButton: "රූපය උඩුගත කරන්න",
      description: {
        title: "විස්තරය",
        content: "කෙසෙල් ශාක \"කළු සිගටෝකා\", \"පැනමා රෝගය\" ඇතුළු විනාශකාරී රෝග කිහිපයකට ගොදුරු වේ. මෙම ආසාදන බෝග අස්වැන්න සහ ගුණාත්මක භාවයට දැඩි ලෙස බලපෑ හැකිය. උසස් AI පාදක විසඳුම් භාවිතයෙන් කල්තියා හඳුනා ගැනීම සහ කාලෝචිත මැදිහත්වීම ගොවීන්ට පාඩු අවම කර ගැනීමට සහ සෞඛ්‍ය සම්පන්න කෙසෙල් වගාව සහතික කිරීමට උපකාරී වේ."
      },
      benefits: {
        title: "කල්තියා හඳුනාගැනීමේ ප්‍රතිලාභ",
        items: [
          "සෞඛ්‍ය සම්පන්න ශාක වලට පැතිරීම වළක්වයි",
          "බෝග හානි සහ ආර්ථික බලපෑම අඩු කරයි",
          "ඉලක්කගත ප්‍රතිකාර ක්‍රමවේද සඳහා ඉඩ සලසයි"
        ]
      }
    }
  };

  // Get current language content
  const t: TextContent = text[language as keyof LanguageText] || text.en;

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#2C5E1A" 
      />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.appName}</Text>
      </View>
      
      <ScrollView style={themedStyles.scrollView}>
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
          <View style={themedStyles.card}>
            <Text style={themedStyles.title}>{t.title}</Text>
            <Text style={themedStyles.subtitle}>{t.subtitle}</Text>
            
            {/* Upload Image Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToUpload}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t.uploadButton}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Description Section Card */}
          <View style={themedStyles.descriptionCard}>
            <Text style={themedStyles.descriptionTitle}>{t.description.title}</Text>
            <Text style={themedStyles.descriptionText}>{t.description.content}</Text>
            
            {/* Benefits Section */}
            <Text style={themedStyles.benefitsTitle}>{t.benefits.title}</Text>
            
            {t.benefits.items.map((benefit: string, index: number) => (
              <View key={index} style={styles.benefitRow}>
                <View style={themedStyles.benefitIcon}>
                  <Text style={styles.benefitIconText}>{['🌱', '💰', '🔬'][index]}</Text>
                </View>
                <Text style={themedStyles.benefitText}>{benefit}</Text>
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