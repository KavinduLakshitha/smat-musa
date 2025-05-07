import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { TextInput, Button, Chip, Menu, Divider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { sendChatMessage, testApiConnection, getSupportedLanguages } from '@/services/api';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  data?: any;
}

export default function ChatbotRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "AI Farming Assistant",
          headerBackTitle: "Chat"
        }}
      />
      <ChatBotScreen />
    </>
  );
}

const ChatBotScreen = () => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 1, text: 'Hello! I\'m your banana farming assistant. How can I help you?', isBot: true }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('english');
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['english', 'sinhala']);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [checkingApi, setCheckingApi] = useState<boolean>(true);
  const [locationContext, setLocationContext] = useState<string>('');
  const [bananaTypeContext, setBananaTypeContext] = useState<string>('');
  const [quantityContext, setQuantityContext] = useState<number | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setCheckingApi(true);
        await testApiConnection();
        setApiStatus('connected');
        
        // Also fetch supported languages
        try {
          const { supported_languages } = await getSupportedLanguages();
          if (supported_languages && supported_languages.length > 0) {
            setSupportedLanguages(supported_languages);
          }
        } catch (error) {
          console.warn('Could not fetch supported languages:', error);
        }
      } catch (error) {
        console.error('API connection error:', error);
        setApiStatus('disconnected');
        addBotMessage("I'm having trouble connecting to the server. Please check your network connection and try again.");
      } finally {
        setCheckingApi(false);
      }
    };

    checkApiConnection();
  }, []);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  // Helper to add bot messages
  const addBotMessage = (text: string, data?: any) => {
    setChatHistory(prev => [
      ...prev, 
      { id: Date.now(), text, isBot: true, data }
    ]);
  };

  // Extract context from user message
  const extractContext = (text: string) => {
    // Extract location
    const locationRegex = /location(?:\s+is)?\s+([a-zA-Z\s]+)/i;
    const locationMatch = text.match(locationRegex);
    if (locationMatch && locationMatch[1]) {
      setLocationContext(locationMatch[1].trim());
    }

    // Extract banana type
    const typeRegex = /type(?:\s+is)?\s+([a-zA-Z\s]+)/i;
    const typeMatch = text.match(typeRegex);
    if (typeMatch && typeMatch[1]) {
      setBananaTypeContext(typeMatch[1].trim());
    }

    // Extract quantity
    const quantityRegex = /(\d+)(?:\s*kg|\s*kilos|\s*kilograms)/i;
    const quantityMatch = text.match(quantityRegex);
    if (quantityMatch && quantityMatch[1]) {
      setQuantityContext(parseInt(quantityMatch[1]));
    }

    return {
      location: locationMatch ? locationMatch[1].trim() : locationContext,
      bananaType: typeMatch ? typeMatch[1].trim() : bananaTypeContext,
      quantity: quantityMatch ? parseInt(quantityMatch[1]) : quantityContext
    };
  };

  // Format message with context for the API
  const formatMessageWithContext = (userMessage: string, extractedContext: any) => {
    // If the message already contains specific context details, use as is
    if (userMessage.match(/location|type|quantity/i)) {
      return userMessage;
    }

    // Add required fields for price prediction if user is asking about prices
    if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      // Get current date information for the prediction
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-based
      const week_of_month = Math.ceil(now.getDate() / 7);
      const day_of_week = now.getDay();
      const day_of_month = now.getDate();
      
      // Add all 20 features needed by the model when asking about prices
      const enhancedPriceMessage = `${userMessage}. I need a price prediction with the following details:` +
        ` location=${extractedContext.location || 'Colombo'},` +
        ` banana_type=${extractedContext.bananaType || 'ambul'},` +
        ` quantity=${extractedContext.quantity || 5},` +
        ` month=${month},` +
        ` week_of_month=${week_of_month},` +
        ` day_of_week=${day_of_week},` +
        ` day_of_month=${day_of_month},` +
        ` include_all_features=true`;
        
      return enhancedPriceMessage;
    }

    // For other types of queries, just add basic context
    let enhancedMessage = userMessage;
    const contextDetails = [];

    if (extractedContext.location) {
      contextDetails.push(`My location is ${extractedContext.location}`);
    }
    
    if (extractedContext.bananaType) {
      contextDetails.push(`I'm growing ${extractedContext.bananaType} bananas`);
    }
    
    if (extractedContext.quantity !== null) {
      contextDetails.push(`I have ${extractedContext.quantity} kg`);
    }

    if (contextDetails.length > 0) {
      enhancedMessage += `. Context: ${contextDetails.join('. ')}`;
    }
    
    return enhancedMessage;
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessageId = Date.now();
    setChatHistory(prev => [
      ...prev, 
      { id: userMessageId, text: message, isBot: false }
    ]);
    
    const userMsg = message;
    setMessage('');
    setLoading(true);

    // Extract context from the message
    const extractedContext = extractContext(userMsg);
    
    // Format message with context
    const formattedMessage = formatMessageWithContext(userMsg, extractedContext);

    try {
      if (apiStatus === 'disconnected') {
        throw new Error('Not connected to API server');
      }

      // Call the chatbot API
      const response = await sendChatMessage({
        message: formattedMessage,
        language: language
      });
      
      // Process data from response
      if (response.data) {
        // Update context from response data if available
        if (response.data.location) {
          setLocationContext(response.data.location);
        }
        
        if (response.data.banana_type) {
          setBananaTypeContext(response.data.banana_type);
        }
        
        if (response.data.quantity) {
          setQuantityContext(response.data.quantity);
        }
      }
      
      // Add bot response to chat
      addBotMessage(response.text, response.data);
      setLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      setLoading(false);
      
      if (String(error).includes('Network Error') || apiStatus === 'disconnected') {
        setApiStatus('disconnected');
        addBotMessage("I'm having trouble connecting to the server. Please check your network connection and try again.");
      } else {
        addBotMessage("Sorry, I couldn't process your request. Please try again.");
      }
    }
  };

  // Retry connection to API
  const retryConnection = async () => {
    try {
      setCheckingApi(true);
      await testApiConnection();
      setApiStatus('connected');
      addBotMessage("I'm back online! How can I help you?");
    } catch (error) {
      console.error('Retry connection error:', error);
      setApiStatus('disconnected');
      addBotMessage("I'm still having trouble connecting to the server. Please check your network connection.");
    } finally {
      setCheckingApi(false);
    }
  };

  // Render market recommendation if available in chat message
  const renderMarketData = (data: any) => {
    if (!data || !data.best_market) return null;
    
    return (
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Market Recommendation</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Best Market:</Text>
          <Text style={styles.dataValue}>{data.best_market.name}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Price:</Text>
          <Text style={styles.dataValue}>{data.best_market.predicted_price} LKR/kg</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Distance:</Text>
          <Text style={styles.dataValue}>{data.best_market.distance} km</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Potential Profit:</Text>
          <Text style={styles.dataValue}>{data.best_market.potential_profit.toFixed(2)} LKR</Text>
        </View>
      </View>
    );
  };

  // Render price prediction if available in chat message
  const renderPriceData = (data: any) => {
    if (!data || !data.price) return null;
    
    return (
      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Price Prediction</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Price:</Text>
          <Text style={styles.dataValue}>{data.price} {data.currency}/kg</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Banana Type:</Text>
          <Text style={styles.dataValue}>{data.banana_type}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Location:</Text>
          <Text style={styles.dataValue}>{data.location}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Date:</Text>
          <Text style={styles.dataValue}>{data.date}</Text>
        </View>
      </View>
    );
  };

  // Render context info
  const renderContextInfo = () => {
    if (!locationContext && !bananaTypeContext && quantityContext === null) {
      return null;
    }
    
    return (
      <View style={styles.contextContainer}>
        <Text style={styles.contextTitle}>Current Context:</Text>
        <View style={styles.chipContainer}>
          {locationContext && (
            <Chip 
              style={styles.chip} 
              onClose={() => setLocationContext('')}
              onPress={() => {}}
            >
              Location: {locationContext}
            </Chip>
          )}
          
          {bananaTypeContext && (
            <Chip 
              style={styles.chip} 
              onClose={() => setBananaTypeContext('')}
              onPress={() => {}}
            >
              Type: {bananaTypeContext}
            </Chip>
          )}
          
          {quantityContext !== null && (
            <Chip 
              style={styles.chip} 
              onClose={() => setQuantityContext(null)}
              onPress={() => {}}
            >
              Quantity: {quantityContext} kg
            </Chip>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.languageSelector}>
            <Text style={styles.languageLabel}>Language:</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Chip 
                  icon="translate" 
                  onPress={() => setMenuVisible(true)}
                  style={styles.languageChip}
                >
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </Chip>
              }
            >
              {supportedLanguages.map((lang) => (
                <Menu.Item 
                  key={lang} 
                  onPress={() => {
                    setLanguage(lang);
                    setMenuVisible(false);
                  }} 
                  title={lang.charAt(0).toUpperCase() + lang.slice(1)} 
                />
              ))}
            </Menu>
          </View>
          
          {apiStatus === 'disconnected' && (
            <Chip 
              icon="wifi-off" 
              mode="outlined" 
              onPress={retryConnection}
              style={styles.statusChip}
            >
              {checkingApi ? 'Reconnecting...' : 'Offline'}
            </Chip>
          )}
        </View>
        
        {renderContextInfo()}
        
        <ScrollView 
          style={styles.chatContainer}
          ref={scrollViewRef}
        >
          {chatHistory.map(chat => (
            <View key={chat.id}>
              <View 
                style={[
                  styles.messageContainer, 
                  chat.isBot ? styles.botMessage : styles.userMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  { color: chat.isBot ? COLORS.text : COLORS.white }
                ]}>
                  {chat.text}
                </Text>
              </View>
              
              {chat.isBot && chat.data && chat.data.best_market && renderMarketData(chat.data)}
              {chat.isBot && chat.data && chat.data.price && renderPriceData(chat.data)}
            </View>
          ))}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            mode="outlined"
            disabled={loading || apiStatus === 'disconnected'}
          />
          <Button 
            mode="contained" 
            onPress={handleSend} 
            style={styles.sendButton}
            disabled={!message.trim() || loading || apiStatus === 'disconnected'}
            loading={loading}
          >
            Send
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  languageChip: {
    height: 30,
  },
  statusChip: {
    height: 30,
    backgroundColor: '#ffe0e0',
  },
  contextContainer: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 16,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  dataCard: {
    marginLeft: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    maxWidth: '80%',
  },
  dataTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.primary,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dataLabel: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dataValue: {
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
  }
});