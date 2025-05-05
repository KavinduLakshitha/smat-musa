import React, { useState } from "react";
import { View, Image, Alert, ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useLanguage } from "@/components/LanguageContext";
import { Stack } from "expo-router";

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
  const { language } = useLanguage() as { language: keyof typeof translations };
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
      pickImage: "Pick Image",
      takePhoto: "Take Photo",
      classifyImage: "Classify Image",
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
      pickImage: "පින්තූරයක් තෝරන්න",
      takePhoto: "ඡායාරූපයක් ගන්න",
      classifyImage: "පින්තූරය වර්ගීකරණය කරන්න",
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

  const t = translations[language as keyof typeof translations];

  const pickImage = async () => {
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

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.permissionDenied, t.permissionCamera);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      setResult(null);
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

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: "banana.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await axios.post("https://kavimdulm98-smat-musa-banana.hf.space/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const predictedClass = response.data.predicted_class;
      const confidence = response.data.confidence;

      const formattedClass = predictedClass.charAt(0).toUpperCase() + predictedClass.slice(1);

      setResult({
        predicted_class: formattedClass,
        confidence: (confidence * 100).toFixed(2) + "%",
        shelf_life: getShelfLife(predictedClass),
      });
    } catch (error) {
      Alert.alert(t.error, t.classificationError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Card style={{ padding: 20, borderRadius: 10, width: '90%' }}>
          <Card.Content>

            {image && (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 250, borderRadius: 10, marginVertical: 20 }}
              />
            )}

            <Button mode="contained" onPress={pickImage} style={{ marginBottom: 10 }}>
              {t.pickImage}
            </Button>
            <Button mode="contained" onPress={takePhoto} style={{ marginBottom: 10 }}>
              {t.takePhoto}
            </Button>

            {loading ? (
              <ActivityIndicator size="large" color="#6200ea" style={{ marginVertical: 10 }} />
            ) : (
              <Button
                mode="contained"
                onPress={() => classifyImage()}
                disabled={!image}
                style={{ marginBottom: 10 }}
              >
                {t.classifyImage}
              </Button>
            )}

            {result && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.notificationTitle}>
                  {t.prediction}: {result.predicted_class}
                </Text>
                <Text style={styles.notificationTime}>
                  {t.confidence}: {result.confidence}
                </Text>
                <Text style={styles.notificationTime}>
                  {t.shelfLife}: {result.shelf_life}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

// export default BananaScreen;
