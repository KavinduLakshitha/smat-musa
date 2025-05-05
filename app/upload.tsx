import React, { useState , useEffect} from 'react';


import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';

const API_URL = "http://192.168.8.174:8000/predict"; // Change to your local API URL

export default function UploadScreen() {
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
  //const [showTreatment, setShowTreatment] = useState(false);
// ✅ Load last saved prediction when app starts
useEffect(() => {
  const fetchLastPrediction = async () => {
    const lastPrediction = await loadPrediction();
    if (lastPrediction) {
      setPrediction(lastPrediction);
    }
  };
  fetchLastPrediction();
}, []);

// ✅ Save the last prediction to AsyncStorage
const savePrediction = async (prediction: any) => {
  await AsyncStorage.setItem('lastPrediction', JSON.stringify(prediction));
};

// ✅ Load last prediction from AsyncStorage
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
      //setShowTreatment(false); // Reset previous predictions
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      setPrediction(result);
      savePrediction(result); // ✅ Save the prediction for offline use
    } catch (error) {
      Alert.alert("Prediction Error", "Something went wrong with the API.");
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
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>🍌 Banana Leaf Disease Diagnosis</Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
      ) : (
        <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.previewImage} />
      )}

<TouchableOpacity style={styles.button} onPress={() => selectImageSource()}>

        <Text style={styles.buttonText}>📷 Select an Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity style={styles.predictButton} onPress={predictImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🔍 Analyze Disease</Text>}
        </TouchableOpacity>
      )}

{prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🔬 Prediction Result</Text>
          <Text style={styles.diseaseName}>{prediction.class}</Text>
          <Text style={styles.confidence}>Confidence: {(prediction.confidence * 100).toFixed(2)}%</Text>

          <Text style={styles.treatmentTitle}> Treatment Plan</Text>

          {prediction?.treatment?.english?.map((step: string, index: number) => (
            <Text key={index} style={styles.treatmentText}>• {step}</Text>

            
          ))}
         <Text style={styles.treatmentTitle}> චිකිත්සා පියවර</Text>
          {prediction?.treatment?.sinhala?.map((step: string, index: number) => (
            <Text key={index} style={styles.treatmentText}>• {step}</Text>
          ))}
        {/* Stylish Buttons */}
        <TouchableOpacity style={styles.outlineButtonBlue} onPress={() => speakSinhala(prediction?.treatment?.sinhala)}>
            <View style={styles.buttonContent}>
              <Ionicons name="volume-high-outline" size={22} color="#007AFF" style={styles.icon} />
              <Text style={styles.outlineTextBlue}>Listen to Sinhala Treatment</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButtonGreen} onPress={() => openWhatsApp(prediction.class)}>
            <View style={styles.buttonContent}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#28A745" style={styles.icon} />
              <Text style={styles.outlineTextGreen}>Contact an Expert</Text>
            </View>
          </TouchableOpacity>

          {prediction.gradcam_image && (
            <TouchableOpacity style={styles.outlineButtonRed} onPress={() => setModalVisible(true)}>
              <View style={styles.buttonContent}>
                <Ionicons name="map-outline" size={22} color="#D32F2F" style={styles.icon} />
                <Text style={styles.outlineTextRed}>View Leaf Disease Heatmap</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.heatmapTitle}>🌡️ Leaf Disease Heatmap</Text>
            <Text style={styles.heatmapDescription}>රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි.</Text>
            <TouchableOpacity onPress={() => Speech.speak("රෝගය ව්‍යාප්ත වී ඇති කොටස් මෙහි රතු පාටින් පෙන්වයි", { language: 'si-LK' })}>
              <Text style={styles.speakButtonText}>🔊 සිංහලෙන් ඇසෙන්න</Text>
            </TouchableOpacity>
            <Image source={{ uri: prediction?.gradcam_image + '?t=' + new Date().getTime() }} style={styles.heatmapImage} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>❌ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
 
  heatmapButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  heatmapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  icon: { marginRight: 8 },
  outlineButtonBlue: { borderWidth: 1.5, borderColor: '#007AFF', borderRadius: 10, marginVertical: 6 },
  outlineButtonGreen: { borderWidth: 1.5, borderColor: '#28A745', borderRadius: 10, marginVertical: 6 },
  outlineButtonRed: { borderWidth: 1.5, borderColor: '#D32F2F', borderRadius: 10, marginVertical: 6 },
  outlineTextBlue: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  outlineTextGreen: { color: '#28A745', fontSize: 16, fontWeight: '600' },
  outlineTextRed: { color: '#D32F2F', fontSize: 16, fontWeight: '600' },
  speakButtonText: { color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  heatmapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  heatmapDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heatmapImage: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#888',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 240,
    marginVertical: 12,
    borderRadius: 10,
  },
  predictButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    marginVertical: 5,
  },
  confidence: {
    fontSize: 18,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
  },
  treatmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    marginTop: 12,
  },
  treatmentText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    lineHeight: 24, // ✅ Increased readability
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 26,  // ✅ Increased size
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#228B22',
    marginVertical: 15,
  },
  speakButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
 
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  speakText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  whatsappText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
