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

interface PredictionResult {
  predicted_price: number;
  currency: string;
  date: string;
  features_used?: Record<string, any>;
}

export default function PredictionRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Price Predictor",
          headerBackTitle: "Price"
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
        setError('Cannot connect to API server. Please check your network connection.');
        setSnackbarVisible(true);
      } finally {
        setCheckingApi(false);
      }
    };

    checkApiConnection();
  }, []);

  const predictPrice = async () => {
    if (!location) {
      setError('Please enter your location');
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
      setError('Error predicting price: ' + (error instanceof Error ? error.message : String(error)));
      setSnackbarVisible(true);
    }
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {apiStatus === 'disconnected' && !checkingApi && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                Cannot connect to the API server
              </Text>
              <Text style={styles.errorHelpText}>
                Please ensure the server is running and your device is on the same network.
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
                      setError('Still cannot connect to API server.');
                      setSnackbarVisible(true);
                    })
                    .finally(() => setCheckingApi(false));
                }}
              >
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Banana Price Predictor</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={text => setLocation(text)}
                placeholder="e.g., Colombo, Kandy, Galle"
                placeholderTextColor="#888"
                editable={!(apiStatus === 'disconnected' || loading)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Banana Type</Text>
              <TextInput
                style={styles.input}
                value={bananaType}
                onChangeText={text => setBananaType(text)}
                placeholder="e.g., ambul, kolikuttu, anamalu, seeni, rathkesel"
                placeholderTextColor="#888"
                editable={!(apiStatus === 'disconnected' || loading)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity (kg, optional)</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={text => setQuantity(text)}
                keyboardType="numeric"
                placeholder="Enter quantity in kg"
                placeholderTextColor="#888"
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
                  <Text style={styles.predictButtonText}>Predicting...</Text>
                </View>
              ) : (
                <Text style={styles.predictButtonText}>Predict Price</Text>
              )}
            </TouchableOpacity>
          </View>

          {prediction && (
            <View style={styles.resultCard}>
              <Text style={styles.cardTitle}>Price Prediction Results</Text>
              
              <View style={styles.resultContainer}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Predicted Price:</Text>
                  <Text style={styles.resultValue}>
                    {prediction.predicted_price.toFixed(2)} {prediction.currency}/kg
                  </Text>
                </View>
                
                {quantity && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Total Value:</Text>
                    <Text style={styles.resultValue}>
                      {(prediction.predicted_price * parseInt(quantity || '0')).toFixed(2)} {prediction.currency}
                    </Text>
                  </View>
                )}
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Date:</Text>
                  <Text style={styles.resultValue}>
                    {prediction.date}
                  </Text>
                </View>
              </View>

              {prediction.features_used && (
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>Features Used for Prediction:</Text>
                  {Object.entries(prediction.features_used).map(([key, value]) => (
                    <View key={key} style={styles.featureRow}>
                      <Text style={styles.featureLabel}>{key}:</Text>
                      <Text style={styles.featureValue}>{value.toString()}</Text>
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
              <Text style={styles.snackbarAction}>OK</Text>
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