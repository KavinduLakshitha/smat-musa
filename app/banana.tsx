import React, { useState } from "react";
import { 
  View, 
  Image, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  ScrollView,
  Platform 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useLanguage } from "../LanguageContext";
import { Stack } from "expo-router";
import { COLORS } from '@/constants/Colors';

export default function BananaRoute() {
  return (
    <>        
      <Stack.Screen 
        options={{
          title: "Banana Classification",
          headerBackTitle: "Home"
        }} 
      />
      <BananaScreen />
    </>
  );
}

const BananaScreen = () => {
  const languageContext = useLanguage();
  const language = (languageContext && languageContext.language) ? languageContext.language : 'en';
  
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    predicted_class: string;
    confidence: string;
    shelf_life: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: "Banana Classification",
      subtitle: "Upload a photo to identify the ripeness level",
      pickImage: "Pick Image from Gallery",
      takePhoto: "Take Photo with Camera",
      classifyImage: "Classify Banana Image",
      noImage: "No Image",
      noImageMsg: "Please select or capture an image first.",
      prediction: "Prediction",
      confidence: "Confidence",
      shelfLife: "Shelf Life",
      success: "Success",
      error: "Error",
      permissionDenied: "Permission Denied",
      permissionGallery: "You need to grant permission to access the gallery.",
      permissionCamera: "You need to grant permission to use the camera.",
      classificationError: "Failed to classify image. Check your server.",
      shelfLifeInfo: {
        unripe: "4-6 days to become ripe.",
        ripe: "3-4 days to become overripe.",
        overripe: "Consume soon or use for baking.",
        rotten: "Not edible.",
        unknown: "Unknown shelf life.",
      },
    },
    si: {
      title: "කෙසෙල් වර්ගීකරණය",
      subtitle: "පරිණත මට්ටම හඳුනා ගැනීමට ඡායාරූපයක් උඩුගත කරන්න",
      pickImage: "ගැලරියෙන් පින්තූරයක් තෝරන්න",
      takePhoto: "කැමරාවෙන් ඡායාරූපයක් ගන්න",
      classifyImage: "කෙසෙල් පින්තූරය වර්ගීකරණය කරන්න",
      noImage: "පින්තූරයක් නැත",
      noImageMsg: "කරුණාකර පින්තූරයක් තෝරන්න හෝ ගන්න.",
      prediction: "ඵල දැක්වීම",
      confidence: "විශ්වාසය",
      shelfLife: "ආයු කාලය",
      success: "සාර්ථකයි",
      error: "දෝෂයකි",
      permissionDenied: "අවසර නෝකළා",
      permissionGallery: "ගැලරියට ප්‍රවේශය ලබාදිය යුතුය.",
      permissionCamera: "කැමරාව භාවිතයට අවසර ලබාදිය යුතුය.",
      classificationError: "පින්තූරය වර්ගීකරණය කළ නොහැක. සේවාදායකය පරීක්ෂා කරන්න.",
      shelfLifeInfo: {
        unripe: "පකුණු වීමට දින 4-6ක්.",
        ripe: "අධික පකුණු වීමට දින 3-4ක්.",
        overripe: "ඉක්මනින් භාවිතා කරන්න හෝ පිසීමට යොදාගන්න.",
        rotten: "භාවිතයට නුසුදුසුයි.",
        unknown: "අදාල ආයු කාලය නොදනී.",
      },
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  
  const pickImage = async () => {
    console.log("Picking image...");
    
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.permissionDenied, t.permissionGallery);
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log("Image picker result:", result.canceled ? "Canceled" : "Image selected");
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      console.log("Image URI set:", result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    console.log("Taking photo...");
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.permissionDenied, t.permissionCamera);
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    console.log("Camera result:", result.canceled ? "Canceled" : "Photo taken");
    
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      setResult(null);
      console.log("Image URI set:", imageUri);
      classifyImage(imageUri);
    }
  };

  const getShelfLife = (classification: string) => {
    const key = classification.toLowerCase() as keyof typeof t.shelfLifeInfo;
    return t.shelfLifeInfo[key] || t.shelfLifeInfo.unknown;
  };

  const classifyImage = async (imageUri = image) => {
    if (!imageUri) {
      Alert.alert(t.noImage, t.noImageMsg);
      return;
    }

    console.log("Classifying image:", imageUri);
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: "banana.jpg",
      type: "image/jpeg",
    } as any);

    console.log("Sending request to API...");
    
    try {
      const response = await axios.post(
        "https://kavinduLM98-banana-classification.hf.space/predict", 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" }}
      );

      console.log("API response received:", response.data);
      
      const predictedClass = response.data.predicted_class;
      const confidence = response.data.confidence;

      const formattedClass = predictedClass.charAt(0).toUpperCase() + predictedClass.slice(1);

      setResult({
        predicted_class: formattedClass,
        confidence: (confidence * 100).toFixed(2) + "%",
        shelf_life: getShelfLife(predictedClass),
      });
      
      console.log("Result set successfully");
    } catch (error) {
      console.error("API request failed:", error);
      Alert.alert(t.error, t.classificationError);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (resultClass: string) => {
    const lowerClass = resultClass.toLowerCase();
    switch (lowerClass) {
      case 'unripe':
        return '#77cc66'; // Green
      case 'ripe':
        return '#ffcc44'; // Yellow
      case 'overripe':
        return '#ee8833'; // Orange
      case 'rotten':
        return '#cc4433'; // Red
      default:
        return '#888888'; // Gray
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
            
            {image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>🍌</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.galleryButton]} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{t.pickImage}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cameraButton]} 
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{t.takePhoto}</Text>
              </TouchableOpacity>
              
              {loading ? (
                <View style={[styles.button, styles.classifyButton, styles.loadingButton]}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.buttonText, styles.loadingText]}>Analyzing...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.classifyButton,
                    !image && styles.disabledButton
                  ]}
                  onPress={() => classifyImage()}
                  disabled={!image}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{t.classifyImage}</Text>
                </TouchableOpacity>
              )}
            </View>

            {result && (
              <View style={styles.resultContainer}>
                <View style={[
                  styles.resultHeader,
                  { backgroundColor: getClassificationColor(result.predicted_class) }
                ]}>
                  <Text style={styles.resultHeaderText}>{result.predicted_class}</Text>
                </View>
                
                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{t.confidence}:</Text>
                    <Text style={styles.resultValue}>{result.confidence}</Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{t.shelfLife}:</Text>
                    <Text style={styles.resultValue}>{result.shelf_life}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary || '#3a86ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 64,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  galleryButton: {
    backgroundColor: '#6c5ce7',
  },
  cameraButton: {
    backgroundColor: '#00b894',
  },
  classifyButton: {
    backgroundColor: COLORS.primary || '#3a86ff',
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  loadingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultHeader: {
    padding: 12,
    alignItems: 'center',
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultDetails: {
    padding: 16,
    backgroundColor: '#fff',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
});