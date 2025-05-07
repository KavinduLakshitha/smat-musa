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
import { Stack } from 'expo-router';

const API_URL = "https://kavindulm98-smat-musa.hf.space/predict";

export default function UploadRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Leaf Disease Analysis",
          headerBackTitle: "Disease"
        }}
      />
      <UploadScreen />
    </>
  );
}

const UploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [prediction, setPrediction] = useState<
    | {
        class: string;
        confidence: number;
        gradcam_image?: string;
        treatment?: {
          english?: string[];
          sinhala?: string[];
        };
      }
    | null
  >(null);

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
  const savePrediction = async (prediction: any) => {
    await AsyncStorage.setItem('lastPrediction', JSON.stringify(prediction));
  };

  // Load last prediction from AsyncStorage
  const loadPrediction = async () => {
    const storedPrediction = await AsyncStorage.getItem('lastPrediction');
    return storedPrediction ? JSON.parse(storedPrediction) : null;
  };

  // Function to choose between Gallery or Camera
  const selectImageSource = () => {
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        { text: "Camera", onPress: () => pickImage("camera") },
        { text: "Gallery", onPress: () => pickImage("gallery") },
        { text: "Cancel", style: "cancel" }
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
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    setLoading(true);
    
    let formData = new FormData();
    formData.append("file", {
      uri: selectedImage,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      
      // Log raw response for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let result;
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
      Alert.alert("Error", `API Error: ${errorMessage}`);
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
      Alert.alert("No Sinhala Treatment Available", "There is no treatment information to read.");
    }
  };

  // Open WhatsApp with the disease information
  const openWhatsApp = (disease: string) => {
    const phoneNumber = "+94771234567"; // Example agricultural officer
    const message = `Hello, I detected ${disease} on my banana plant. What should I do?`;
    Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  // Get color based on disease confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return '#00c853'; // High confidence - green
    if (confidence > 0.7) return '#ffd600'; // Medium confidence - yellow
    return '#ff6d00'; // Low confidence - orange
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>🍌 Banana Leaf Disease Diagnosis</Text>
            <Text style={styles.subtitle}>Upload a clear image of a banana leaf to diagnose diseases</Text>
          </View>

          <View style={styles.imageCard}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.placeholderImage} />
                <View style={styles.overlayText}>
                  <Text style={styles.overlayTextContent}>Tap "Select an Image" below</Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={selectImageSource}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Select an Image</Text>
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
                    <Text style={styles.buttonText}>Analyzing...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="search-outline" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Analyze Disease</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {prediction && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Prediction Result</Text>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence) }]}>
                  <Text style={styles.confidenceBadgeText}>
                    {(prediction.confidence * 100).toFixed(0)}% Confidence
                  </Text>
                </View>
              </View>

              <View style={styles.diseaseNameContainer}>
                <Text style={styles.diseaseName}>{prediction.class}</Text>
              </View>

              <View style={styles.treatmentSection}>
                <Text style={styles.treatmentTitle}>Treatment Plan</Text>
                
                {prediction?.treatment?.english?.map((step: string, index: number) => (
                  <View key={`english-${index}`} style={styles.treatmentStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.treatmentText}>{step}</Text>
                  </View>
                ))}
                
                <View style={styles.divider} />
                
                <Text style={styles.treatmentTitle}>චිකිත්සා පියවර</Text>
                
                {prediction?.treatment?.sinhala?.map((step: string, index: number) => (
                  <View key={`sinhala-${index}`} style={styles.treatmentStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.treatmentText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => speakSinhala(prediction?.treatment?.sinhala)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-high-outline" size={24} color="#007AFF" style={styles.actionIcon} />
                  <Text style={[styles.actionText, styles.blueText]}>Listen in Sinhala</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => openWhatsApp(prediction.class)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#28A745" style={styles.actionIcon} />
                  <Text style={[styles.actionText, styles.greenText]}>Contact Expert</Text>
                </TouchableOpacity>

                {prediction.gradcam_image && (
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="map-outline" size={24} color="#D32F2F" style={styles.actionIcon} />
                    <Text style={[styles.actionText, styles.redText]}>View Heatmap</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.heatmapTitle}>Disease Heatmap Analysis</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIcon}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.heatmapDescription}>
              Red areas indicate parts of the leaf most affected by the disease.
            </Text>
            
            <Text style={styles.heatmapDescriptionSinhala}>
              රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි.
            </Text>
            
            <TouchableOpacity 
              style={styles.speakButton} 
              onPress={() => Speech.speak("රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි", { language: 'si-LK' })}
            >
              <Ionicons name="volume-high" size={20} color="#007AFF" />
              <Text style={styles.speakButtonText}>සිංහලෙන් ඇසෙන්න</Text>
            </TouchableOpacity>
            
            <View style={styles.heatmapImageContainer}>
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
              <Text style={styles.closeButtonText}>Close</Text>
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