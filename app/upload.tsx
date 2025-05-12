import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Modal,
  SafeAreaView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useLanguage } from '@/components/LanguageContext';
import { useAppColorScheme } from '@/components/ThemeContext';

const API_URL = "https://kavindulm98-smat-musa.hf.space/predict";

export default function UploadRoute() {
  const { language } = useLanguage();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: language === 'si' ? "කොළ රෝග විශ්ලේෂණය" : "Leaf Disease Analysis",
          headerBackTitle: language === 'si' ? "රෝග" : "Disease"
        }}
      />
      <UploadScreen />
    </>
  );
}

// Define the prediction type
interface Treatment {
  english?: string[];
  sinhala?: string[];
}

interface PredictionResult {
  class: string;
  confidence: number;
  gradcam_image?: string;
  treatment?: Treatment;
}

// Translation interface
interface ModalTranslations {
  title: string;
  description: string;
  descriptionSinhala: string;
  listenButton: string;
  closeButton: string;
}

interface AlertTranslations {
  sourceTitle: string;
  sourceMessage: string;
  cameraOption: string;
  galleryOption: string;
  cancelOption: string;
  noImageTitle: string;
  noImageMessage: string;
  errorTitle: string;
  noTreatmentTitle: string;
  noTreatmentMessage: string;
}

interface ActionTranslations {
  listen: string;
  contact: string;
  heatmap: string;
}

interface ContentTranslations {
  title: string;
  subtitle: string;
  placeholderText: string;
  selectImageButton: string;
  analyzeButton: string;
  analyzingText: string;
  resultTitle: string;
  confidenceText: string;
  treatmentTitle: string;
  actions: ActionTranslations;
  alert: AlertTranslations;
  whatsAppMessage: string;
  modal: ModalTranslations;
}

interface Translations {
  en: ContentTranslations;
  si: ContentTranslations;
}

const UploadScreen = () => {
  // Use router directly without type casting
  const router = useRouter();
  const { language } = useLanguage();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Text content based on language
  const text: Translations = {
    en: {
      title: "🍌 Banana Leaf Disease Diagnosis",
      subtitle: "Upload a clear image of a banana leaf to diagnose diseases",
      placeholderText: "Tap \"Select an Image\" below",
      selectImageButton: "Select an Image",
      analyzeButton: "Analyze Disease",
      analyzingText: "Analyzing...",
      resultTitle: "Prediction Result",
      confidenceText: "Confidence",
      treatmentTitle: "Treatment Plan",
      actions: {
        listen: "Listen in Sinhala",
        contact: "Contact Expert",
        heatmap: "View Heatmap"
      },
      alert: {
        sourceTitle: "Select Image Source",
        sourceMessage: "Choose an option",
        cameraOption: "Camera",
        galleryOption: "Gallery",
        cancelOption: "Cancel",
        noImageTitle: "No Image Selected",
        noImageMessage: "Please select an image first.",
        errorTitle: "Error",
        noTreatmentTitle: "No Sinhala Treatment Available",
        noTreatmentMessage: "There is no treatment information to read."
      },
      whatsAppMessage: "Hello, I detected {disease} on my banana plant. What should I do?",
      modal: {
        title: "Disease Heatmap Analysis",
        description: "Red areas indicate parts of the leaf most affected by the disease.",
        descriptionSinhala: "රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි.",
        listenButton: "සිංහලෙන් ඇසෙන්න",
        closeButton: "Close"
      }
    },
    si: {
      title: "🍌 කෙසෙල් කොළ රෝග නිර්ණය",
      subtitle: "රෝග නිර්ණය කිරීමට කෙසෙල් කොළයක පැහැදිලි රූපයක් උඩුගත කරන්න",
      placeholderText: "පහත \"රූපයක් තෝරන්න\" ක්ලික් කරන්න",
      selectImageButton: "රූපයක් තෝරන්න",
      analyzeButton: "රෝගය විශ්ලේෂණය කරන්න",
      analyzingText: "විශ්ලේෂණය කරමින්...",
      resultTitle: "ප්‍රතිඵල",
      confidenceText: "විශ්වාසනීයත්වය",
      treatmentTitle: "චිකිත්සා පියවර",
      actions: {
        listen: "සිංහලෙන් අසන්න",
        contact: "විශේෂඥයෙකු අමතන්න",
        heatmap: "හීට්මැප් බලන්න"
      },
      alert: {
        sourceTitle: "රූප මූලාශ්‍රය තෝරන්න",
        sourceMessage: "විකල්පයක් තෝරන්න",
        cameraOption: "කැමරාව",
        galleryOption: "ගැලරිය",
        cancelOption: "අවලංගු කරන්න",
        noImageTitle: "රූපයක් තෝරා නැත",
        noImageMessage: "කරුණාකර පළමුව රූපයක් තෝරන්න.",
        errorTitle: "දෝෂයකි",
        noTreatmentTitle: "සිංහල ප්‍රතිකාර නොමැත",
        noTreatmentMessage: "කියවීමට ප්‍රතිකාර තොරතුරු නොමැත."
      },
      whatsAppMessage: "ආයුබෝවන්, මගේ කෙසෙල් පැළයේ {disease} හඳුනාගෙන ඇත. මම කුමක් කළ යුතුද?",
      modal: {
        title: "රෝග හීට්මැප් විශ්ලේෂණය",
        description: "රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි.",
        descriptionSinhala: "රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි.",
        listenButton: "සිංහලෙන් ඇසෙන්න",
        closeButton: "වසන්න"
      }
    }
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
    mainTitle: {
      ...styles.mainTitle,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    subtitle: {
      ...styles.subtitle,
      color: isDark ? '#b0b0b0' : '#666',
    },
    imageCard: {
      ...styles.imageCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    resultContainer: {
      ...styles.resultContainer,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    resultTitle: {
      ...styles.resultTitle,
      color: isDark ? '#e0e0e0' : '#333',
    },
    treatmentTitle: {
      ...styles.treatmentTitle,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    treatmentText: {
      ...styles.treatmentText,
      color: isDark ? '#e0e0e0' : '#444',
    },
    actionButton: {
      ...styles.actionButton,
      backgroundColor: isDark ? '#282828' : '#f8f9fa',
      borderColor: isDark ? '#444444' : '#e0e0e0',
    },
    modalContent: {
      ...styles.modalContent,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    heatmapTitle: {
      ...styles.heatmapTitle,
      color: isDark ? '#ff6b6b' : '#D32F2F',
    },
    heatmapDescription: {
      ...styles.heatmapDescription,
      color: isDark ? '#e0e0e0' : '#333',
    },
    heatmapDescriptionSinhala: {
      ...styles.heatmapDescriptionSinhala,
      color: isDark ? '#e0e0e0' : '#333',
    },
    heatmapImageContainer: {
      ...styles.heatmapImageContainer,
      borderColor: isDark ? '#444444' : '#e0e0e0',
    },
    stepNumber: {
      ...styles.stepNumber,
      backgroundColor: isDark ? '#263328' : '#e8f5e9',
    },
    diseaseNameContainer: {
      ...styles.diseaseNameContainer,
      backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.1)',
    },
  };

  // Get current language content
  const t = language === 'si' ? text.si : text.en;

  // Load last saved prediction when app starts
  useEffect(() => {
    const fetchLastPrediction = async () => {
      const lastPrediction = await loadPrediction();
      if (lastPrediction) {
        setPrediction(lastPrediction);
      }
    };
    fetchLastPrediction();
  }, []);

  // Save the last prediction to AsyncStorage
  const savePrediction = async (prediction: PredictionResult) => {
    await AsyncStorage.setItem('lastPrediction', JSON.stringify(prediction));
  };

  // Load last prediction from AsyncStorage
  const loadPrediction = async (): Promise<PredictionResult | null> => {
    const storedPrediction = await AsyncStorage.getItem('lastPrediction');
    return storedPrediction ? JSON.parse(storedPrediction) : null;
  };

  // Function to choose between Gallery or Camera
  const selectImageSource = () => {
    Alert.alert(
      t.alert.sourceTitle,
      t.alert.sourceMessage,
      [
        { text: t.alert.cameraOption, onPress: () => pickImage("camera") },
        { text: t.alert.galleryOption, onPress: () => pickImage("gallery") },
        { text: t.alert.cancelOption, style: "cancel" }
      ]
    );
  };

  // Function to pick an image from Camera or Gallery
  const pickImage = async (source: "camera" | "gallery") => {
    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  // Function to send the image to the backend for prediction
  const predictImage = async () => {
    if (!selectedImage) {
      Alert.alert(t.alert.noImageTitle, t.alert.noImageMessage);
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    // Add image to form data - TypeScript needs this type assertion
    formData.append("file", {
      uri: selectedImage,
      name: "image.jpg",
      type: "image/jpeg",
    } as unknown as Blob);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      
      // Log raw response for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let result: PredictionResult;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid response format");
      }
      
      if (result.gradcam_image) {
        result.gradcam_image = `https://kavindulm98-smat-musa.hf.space${result.gradcam_image}`;
      }
      
      setPrediction(result);
      savePrediction(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert(t.alert.errorTitle, `API Error: ${errorMessage}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function for Sinhala Text-to-Speech
  const speakSinhala = (textArray?: string[]) => {
    if (textArray && textArray.length > 0) {
      const fullText = textArray.join(". "); // Join array into a single sentence
      Speech.stop();
      Speech.speak(fullText, { language: 'si-LK' });
    } else {
      Alert.alert(t.alert.noTreatmentTitle, t.alert.noTreatmentMessage);
    }
  };

  // Open WhatsApp with the disease information
  const openWhatsApp = (disease: string) => {
    const phoneNumber = "+94771234567"; // Example agricultural officer
    const message = t.whatsAppMessage.replace("{disease}", disease);
    Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  // Get color based on disease confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return '#00c853'; // High confidence - green
    if (confidence > 0.7) return '#ffd600'; // Medium confidence - yellow
    return '#ff6d00'; // Low confidence - orange
  };

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <ScrollView style={themedStyles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={themedStyles.mainTitle}>{t.title}</Text>
            <Text style={themedStyles.subtitle}>{t.subtitle}</Text>
          </View>

          <View style={themedStyles.imageCard}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.placeholderImage} />
                <View style={styles.overlayText}>
                  <Text style={styles.overlayTextContent}>{t.placeholderText}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={selectImageSource}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t.selectImageButton}</Text>
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity 
                style={[styles.analyzeButton, loading && styles.loadingButton]} 
                onPress={predictImage} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>{t.analyzingText}</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="search-outline" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t.analyzeButton}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {prediction && (
            <View style={themedStyles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={themedStyles.resultTitle}>{t.resultTitle}</Text>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence) }]}>
                  <Text style={styles.confidenceBadgeText}>
                    {(prediction.confidence * 100).toFixed(0)}% {t.confidenceText}
                  </Text>
                </View>
              </View>

              <View style={themedStyles.diseaseNameContainer}>
                <Text style={styles.diseaseName}>{prediction.class}</Text>
              </View>

              <View style={styles.treatmentSection}>
                <Text style={themedStyles.treatmentTitle}>
                  {language === 'en' ? 'Treatment Plan' : 'චිකිත්සා පියවර'}
                </Text>
                
                {/* Display appropriate treatment based on language */}
                {language === 'en' && prediction?.treatment?.english?.map((step: string, index: number) => (
                  <View key={`english-${index}`} style={styles.treatmentStep}>
                    <View style={themedStyles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={themedStyles.treatmentText}>{step}</Text>
                  </View>
                ))}
                
                {language === 'si' && prediction?.treatment?.sinhala?.map((step: string, index: number) => (
                  <View key={`sinhala-${index}`} style={styles.treatmentStep}>
                    <View style={themedStyles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={themedStyles.treatmentText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={themedStyles.actionButton} 
                  onPress={() => speakSinhala(prediction?.treatment?.sinhala)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-high-outline" size={24} color="#007AFF" style={styles.actionIcon} />
                  <Text style={[styles.actionText, styles.blueText]}>{t.actions.listen}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={themedStyles.actionButton} 
                  onPress={() => openWhatsApp(prediction.class)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#28A745" style={styles.actionIcon} />
                  <Text style={[styles.actionText, styles.greenText]}>{t.actions.contact}</Text>
                </TouchableOpacity>

                {prediction.gradcam_image && (
                  <TouchableOpacity 
                    style={themedStyles.actionButton} 
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="map-outline" size={24} color="#D32F2F" style={styles.actionIcon} />
                    <Text style={[styles.actionText, styles.redText]}>{t.actions.heatmap}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Heatmap Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={themedStyles.heatmapTitle}>{t.modal.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIcon}>
                <Ionicons name="close-circle" size={28} color={isDark ? "#aaaaaa" : "#666"} />
              </TouchableOpacity>
            </View>
            
            <Text style={themedStyles.heatmapDescription}>
              {t.modal.description}
            </Text>
            
            {language === 'en' && (
              <Text style={themedStyles.heatmapDescriptionSinhala}>
                {t.modal.descriptionSinhala}
              </Text>
            )}
            
            <TouchableOpacity 
              style={styles.speakButton} 
              onPress={() => Speech.speak(t.modal.descriptionSinhala, { language: 'si-LK' })}
            >
              <Ionicons name="volume-high" size={20} color="#007AFF" />
              <Text style={styles.speakButtonText}>{t.modal.listenButton}</Text>
            </TouchableOpacity>
            
            <View style={themedStyles.heatmapImageContainer}>
              <Image 
                source={{ uri: prediction?.gradcam_image + '?t=' + new Date().getTime() }} 
                style={styles.heatmapImage} 
                resizeMode="contain"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t.modal.closeButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5E1A',
    textAlign: 'center',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholderContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  overlayText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTextContent: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: '#2C5E1A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  analyzeButton: {
    backgroundColor: '#FF8C00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingButton: {
    backgroundColor: '#F0A04B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  diseaseNameContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
  },
  treatmentSection: {
    marginBottom: 16,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginBottom: 12,
  },
  treatmentStep: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#2C5E1A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  treatmentText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
    flex: 1,
    maxWidth: '30%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  blueText: {
    color: '#007AFF',
  },
  greenText: {
    color: '#28A745',
  },
  redText: {
    color: '#D32F2F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heatmapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  closeIcon: {
    padding: 4,
  },
  heatmapDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  heatmapDescriptionSinhala: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 6,
    marginBottom: 16,
  },
  speakButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 6,
  },
  heatmapImageContainer: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  heatmapImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});