import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { getPricePredictor, testApiConnection } from '@/services/api';
import { useAppColorScheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';

interface PredictionResult {
  predicted_price: number;
  currency: string;
  date: string;
  features_used?: Record<string, any>;
}

export default function PredictionRoute() {
  const { language } = useLanguage();
  
  // Get translations based on current language
  const translations = {
    en: {
      screenTitle: "Price Predictor",
      headerBackTitle: "Price"
    },
    si: {
      screenTitle: "මිල පුරෝකථනය",
      headerBackTitle: "මිල"
    }
  };
  
  // Get the current language text
  const t = language === 'si' ? translations.si : translations.en;

  return (
    <>
      <Stack.Screen
        options={{
          title: t.screenTitle,
          headerBackTitle: t.headerBackTitle
        }}
      />
      <PredictionScreen />
    </>
  );
}

const PredictionScreen = () => {
  const [location, setLocation] = useState<string>('');
  const [bananaType, setBananaType] = useState<string>('ambul');
  const [quantity, setQuantity] = useState<string>('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [checkingApi, setCheckingApi] = useState<boolean>(true);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const { language } = useLanguage();

  // Define translations for the component
  const translations = {
    en: {
      cardTitle: "Banana Price Predictor",
      locationLabel: "Location",
      locationPlaceholder: "e.g., Colombo, Kandy, Galle",
      bananaTypeLabel: "Banana Type",
      bananaTypePlaceholder: "e.g., ambul, kolikuttu, anamalu, seeni, rathkesel",
      quantityLabel: "Quantity (kg, optional)",
      quantityPlaceholder: "Enter quantity in kg",
      predictButton: "Predict Price",
      predictingButton: "Predicting...",
      resultsTitle: "Price Prediction Results",
      predictedPrice: "Predicted Price:",
      totalValue: "Total Value:",
      date: "Date:",
      featuresUsed: "Features Used for Prediction:",
      errorConnecting: "Cannot connect to the API server",
      errorHelpText: "Please ensure the server is running and your device is on the same network.",
      retryButton: "Retry Connection",
      locationError: "Please enter your location",
      errorPrefix: "Error predicting price: ",
      snackbarAction: "OK"
    },
    si: {
      cardTitle: "කෙසෙල් මිල පුරෝකථනය",
      locationLabel: "ස්ථානය",
      locationPlaceholder: "උදා., කොළඹ, මහනුවර, ගාල්ල",
      bananaTypeLabel: "කෙසෙල් වර්ගය",
      bananaTypePlaceholder: "උදා., අඹුල්, කොලිකුට්ටු, අනමාලු, සීනි, රත්කෙසෙල්",
      quantityLabel: "ප්‍රමාණය (කි.ග්‍රෑ., විකල්ප)",
      quantityPlaceholder: "ප්‍රමාණය කි.ග්‍රෑම් වලින් ඇතුළත් කරන්න",
      predictButton: "මිල පුරෝකථනය කරන්න",
      predictingButton: "පුරෝකථනය කරමින්...",
      resultsTitle: "මිල පුරෝකථන ප්‍රතිඵල",
      predictedPrice: "පුරෝකථිත මිල:",
      totalValue: "මුළු වටිනාකම:",
      date: "දිනය:",
      featuresUsed: "පුරෝකථනය සඳහා භාවිතා කළ විශේෂාංග:",
      errorConnecting: "API සේවාදායකයට සම්බන්ධ විය නොහැක",
      errorHelpText: "කරුණාකර සේවාදායකය ක්‍රියාත්මක වන බවත්, ඔබේ උපකරණය එකම ජාලයේ ඇති බවත් තහවුරු කරගන්න.",
      retryButton: "නැවත සම්බන්ධ වීමට උත්සාහ කරන්න",
      locationError: "කරුණාකර ඔබේ ස්ථානය ඇතුලත් කරන්න",
      errorPrefix: "මිල පුරෝකථනයේ දෝෂයක්: ",
      snackbarAction: "හරි"
    }
  };
  
  // Get the current language text
  const t = language === 'si' ? translations.si : translations.en;

  const themedStyles = {
    safeArea: {
      ...styles.safeArea,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    container: {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    formCard: {
      ...styles.formCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      borderColor: isDark ? '#333333' : '#e1e4e8',
    },
    cardTitle: {
      ...styles.cardTitle,
      color: isDark ? '#e0e0e0' : COLORS.text || '#333',
    },
    inputContainer: {
      ...styles.inputContainer,
    },
    inputLabel: {
      ...styles.inputLabel,
      color: isDark ? '#b0b0b0' : '#555',
    },
    input: {
      ...styles.input,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderColor: isDark ? '#444444' : '#e1e4e8',
      color: isDark ? '#e0e0e0' : '#000000',
    },
    resultCard: {
      ...styles.resultCard,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    resultLabel: {
      ...styles.resultLabel,
      color: isDark ? '#e0e0e0' : COLORS.text || '#333',
    },
    resultValue: {
      ...styles.resultValue,
      color: isDark ? '#7cb9ff' : COLORS.primary || '#3a86ff',
    },
    featuresContainer: {
      ...styles.featuresContainer,
      backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
    },
    featuresTitle: {
      ...styles.featuresTitle,
      color: isDark ? '#cccccc' : '#555',
    },
    featureLabel: {
      ...styles.featureLabel,
      color: isDark ? '#b0b0b0' : '#555',
    },
    featureValue: {
      ...styles.featureValue,
      color: isDark ? '#e0e0e0' : '#333',
    },
    featureRow: {
      ...styles.featureRow,
      borderBottomColor: isDark ? '#444444' : '#eee',
    },
    errorCard: {
      ...styles.errorCard,
      backgroundColor: isDark ? '#352814' : '#fff8e1',
      borderLeftColor: isDark ? '#ff9800' : '#ff9800',
    },
    errorText: {
      ...styles.errorText,
      color: isDark ? '#ff6b6b' : '#f44336',
    },
    errorHelpText: {
      ...styles.errorHelpText,
      color: isDark ? '#cccccc' : '#555',
    },
    resultContainer: {
      ...styles.resultContainer,
      borderBottomColor: isDark ? '#444444' : '#eee',
    },
  };

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setCheckingApi(true);
        await testApiConnection();
        setApiStatus('connected');
      } catch (error) {
        console.error('API connection error:', error);
        setApiStatus('disconnected');
        setError(t.errorConnecting);
        setSnackbarVisible(true);
      } finally {
        setCheckingApi(false);
      }
    };

    checkApiConnection();
  }, [t.errorConnecting]);

  const predictPrice = async () => {
    if (!location) {
      setError(t.locationError);
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);
      
      // Check current date information for the prediction
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-based
      const week_of_month = Math.ceil(now.getDate() / 7);
      const day_of_week = now.getDay();
      const day_of_month = now.getDate();
      
      // Prepare the data payload according to what your Flask API expects
      const data: {
        location: string;
        banana_type: string;
        month: number;
        week_of_month: number;
        day_of_week: number;
        day_of_month: number;
        quantity?: number;
      } = {
        location: location,
        banana_type: bananaType,
        month: month,
        week_of_month: week_of_month,
        day_of_week: day_of_week,
        day_of_month: day_of_month
      };
      
      if (quantity) {
        data.quantity = parseInt(quantity);
      }

      // Call the API
      const result = await getPricePredictor(data);
      
      setPrediction(result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(t.errorPrefix + (error instanceof Error ? error.message : String(error)));
      setSnackbarVisible(true);
    }
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <KeyboardAvoidingView
        style={themedStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {apiStatus === 'disconnected' && !checkingApi && (
            <View style={themedStyles.errorCard}>
              <Text style={themedStyles.errorText}>
                {t.errorConnecting}
              </Text>
              <Text style={themedStyles.errorHelpText}>
                {t.errorHelpText}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setApiStatus('unknown');
                  setCheckingApi(true);
                  testApiConnection()
                    .then(() => setApiStatus('connected'))
                    .catch(() => {
                      setApiStatus('disconnected');
                      setError(t.errorConnecting);
                      setSnackbarVisible(true);
                    })
                    .finally(() => setCheckingApi(false));
                }}
              >
                <Text style={styles.retryButtonText}>{t.retryButton}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={themedStyles.formCard}>
            <Text style={themedStyles.cardTitle}>{t.cardTitle}</Text>
            <View style={themedStyles.inputContainer}>
              <Text style={themedStyles.inputLabel}>{t.locationLabel}</Text>
              <TextInput
                style={themedStyles.input}
                value={location}
                onChangeText={text => setLocation(text)}
                placeholder={t.locationPlaceholder}
                placeholderTextColor={isDark ? "#777777" : "#888888"}
                editable={!(apiStatus === 'disconnected' || loading)}
              />
            </View>

            <View style={themedStyles.inputContainer}>
              <Text style={themedStyles.inputLabel}>{t.bananaTypeLabel}</Text>
              <TextInput
                style={themedStyles.input}
                value={bananaType}
                onChangeText={text => setBananaType(text)}
                placeholder={t.bananaTypePlaceholder}
                placeholderTextColor={isDark ? "#777777" : "#888888"}
                editable={!(apiStatus === 'disconnected' || loading)}
              />
            </View>

            <View style={themedStyles.inputContainer}>
              <Text style={themedStyles.inputLabel}>{t.quantityLabel}</Text>
              <TextInput
                style={themedStyles.input}
                value={quantity}
                onChangeText={text => setQuantity(text)}
                keyboardType="numeric"
                placeholder={t.quantityPlaceholder}
                placeholderTextColor={isDark ? "#777777" : "#888888"}
                editable={!(apiStatus === 'disconnected' || loading)}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.predictButton,
                (apiStatus === 'disconnected' || loading || checkingApi) && styles.predictButtonDisabled
              ]}
              onPress={predictPrice}
              disabled={apiStatus === 'disconnected' || loading || checkingApi}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.predictButtonText}>{t.predictingButton}</Text>
                </View>
              ) : (
                <Text style={styles.predictButtonText}>{t.predictButton}</Text>
              )}
            </TouchableOpacity>
          </View>

          {prediction && (
            <View style={themedStyles.resultCard}>
              <Text style={themedStyles.cardTitle}>{t.resultsTitle}</Text>
              
              <View style={themedStyles.resultContainer}>
                <View style={styles.resultRow}>
                  <Text style={themedStyles.resultLabel}>{t.predictedPrice}</Text>
                  <Text style={themedStyles.resultValue}>
                    {prediction.predicted_price.toFixed(2)} {prediction.currency}/kg
                  </Text>
                </View>
                
                {quantity && (
                  <View style={styles.resultRow}>
                    <Text style={themedStyles.resultLabel}>{t.totalValue}</Text>
                    <Text style={themedStyles.resultValue}>
                      {(prediction.predicted_price * parseInt(quantity || '0')).toFixed(2)} {prediction.currency}
                    </Text>
                  </View>
                )}
                
                <View style={styles.resultRow}>
                  <Text style={themedStyles.resultLabel}>{t.date}</Text>
                  <Text style={themedStyles.resultValue}>
                    {prediction.date}
                  </Text>
                </View>
              </View>

              {prediction.features_used && (
                <View style={themedStyles.featuresContainer}>
                  <Text style={themedStyles.featuresTitle}>{t.featuresUsed}</Text>
                  {Object.entries(prediction.features_used).map(([key, value]) => (
                    <View key={key} style={themedStyles.featureRow}>
                      <Text style={themedStyles.featureLabel}>{key}:</Text>
                      <Text style={themedStyles.featureValue}>{value.toString()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Custom Snackbar */}
        {snackbarVisible && (
          <View style={styles.snackbar}>
            <Text style={styles.snackbarText}>{error}</Text>
            <TouchableOpacity onPress={dismissSnackbar}>
              <Text style={styles.snackbarAction}>{t.snackbarAction}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorHelpText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text || '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  predictButton: {
    backgroundColor: COLORS.primary || '#3a86ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  predictButtonDisabled: {
    backgroundColor: '#c5c9cc',
  },
  predictButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text || '#333',
  },
  resultValue: {
    fontSize: 16,
    color: COLORS.primary || '#3a86ff',
    fontWeight: 'bold',
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  featureLabel: {
    fontSize: 14,
    color: '#555',
  },
  featureValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  snackbar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  snackbarText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  snackbarAction: {
    color: '#a5d6ff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 16,
  },
});