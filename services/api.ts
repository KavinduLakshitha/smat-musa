// api.ts - API service functions
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://192.168.8.162:5000'; // Server running on local network

// Interfaces
export interface PredictionRequest {
  location: string;
  banana_type: string;
  quantity?: number;
  month?: number;
  week_of_month?: number;
  day_of_week?: number;
  day_of_month?: number;
  location_code?: number;
}

export interface PredictionResponse {
  predicted_price: number;
  currency: string;
  date: string;
  features_used?: Record<string, any>;
}

export interface ChatMessage {
  message: string;
  language?: string;
}

export interface ChatResponse {
  text: string;
  data: any;
}

/**
 * Get price prediction from the API
 */
export const getPricePredictor = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/predict`, data);
    return response.data;
  } catch (error) {
    console.error('Error predicting price:', error);
    throw error;
  }
};

/**
 * Get market recommendation from the API
 */
export const getMarketRecommendation = async (data: PredictionRequest): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommend`, data);
    return response.data;
  } catch (error) {
    console.error('Error getting recommendation:', error);
    throw error;
  }
};

/**
 * Send a message to the chatbot API
 */
export const sendChatMessage = async (data: ChatMessage): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chatbot`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get the health status of the API
 */
export const getApiHealth = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/supported-languages`);
    return response.data;
  } catch (error) {
    console.error('Error getting supported languages:', error);
    throw error;
  }
};

/**
 * Get available markets
 */
export const getMarkets = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/markets`);
    return response.data;
  } catch (error) {
    console.error('Error getting markets list:', error);
    throw error;
  }
};

/**
 * Test API connection
 * This is a helper function to test the base URL connectivity
 */
export const testApiConnection = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error('Error connecting to API:', error);
    throw error;
  }
};