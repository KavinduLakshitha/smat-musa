import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
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

  return (
    <ScrollView style={styles.container}>
      {apiStatus === 'disconnected' && !checkingApi && (
        <Card style={[styles.card, styles.errorCard]}>
          <Card.Content>
            <Text style={styles.errorText}>
              Cannot connect to the API server at http://192.168.8.162:5000
            </Text>
            <Text style={styles.errorHelpText}>
              Please ensure the server is running and your device is on the same network.
            </Text>
            <Button 
              mode="outlined" 
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
              style={styles.retryButton}
            >
              Retry Connection
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Title title="Banana Price Predictor" />
        <Card.Content>
          <TextInput
            label="Location"
            value={location}
            onChangeText={text => setLocation(text)}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Colombo, Kandy, Galle"
            disabled={apiStatus === 'disconnected' || loading}
          />

          <TextInput
            label="Banana Type"
            value={bananaType}
            onChangeText={text => setBananaType(text)}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., ambul, kolikuttu, anamalu, seeni, rathkesel"
            disabled={apiStatus === 'disconnected' || loading}
          />

          <TextInput
            label="Quantity (kg, optional)"
            value={quantity}
            onChangeText={text => setQuantity(text)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            disabled={apiStatus === 'disconnected' || loading}
          />

          <Button 
            mode="contained" 
            onPress={predictPrice} 
            style={styles.button}
            loading={loading}
            disabled={apiStatus === 'disconnected' || loading || checkingApi}
          >
            {loading ? 'Predicting...' : 'Predict Price'}
          </Button>
        </Card.Content>
      </Card>

      {prediction && (
        <Card style={styles.resultCard}>
          <Card.Title title="Price Prediction Results" />
          <Card.Content>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Predicted Price:</Text>
              <Text style={styles.resultValue}>
                {prediction.predicted_price.toFixed(2)} {prediction.currency}/kg
              </Text>
            </View>
            
            {quantity && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Value:</Text>
                <Text style={styles.resultValue}>
                  {(prediction.predicted_price * parseInt(quantity || '0')).toFixed(2)} {prediction.currency}
                </Text>
              </View>
            )}
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Date:</Text>
              <Text style={styles.resultValue}>
                {prediction.date}
              </Text>
            </View>

            {prediction.features_used && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Features Used for Prediction:</Text>
                {Object.entries(prediction.features_used).map(([key, value]) => (
                  <View key={key} style={styles.featureItem}>
                    <Text style={styles.featureLabel}>{key}:</Text>
                    <Text style={styles.featureValue}>{value.toString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={5000}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  card: {
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorHelpText: {
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  resultCard: {
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  featureLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  featureValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});