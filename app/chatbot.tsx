import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  Keyboard,
  TextInput as RNTextInput
} from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { sendChatMessage, testApiConnection, getSupportedLanguages } from '@/services/api';

// Define types
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
  const [keyboardShown, setKeyboardShown] = useState<boolean>(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  // Keyboard listeners to adjust UI
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardShown(true);
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardShown(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

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
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setLocationContext('')}
            >
              <Text style={styles.chipText}>Location: {locationContext}</Text>
              <Text style={styles.chipClose}>×</Text>
            </TouchableOpacity>
          )}
          
          {bananaTypeContext && (
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setBananaTypeContext('')}
            >
              <Text style={styles.chipText}>Type: {bananaTypeContext}</Text>
              <Text style={styles.chipClose}>×</Text>
            </TouchableOpacity>
          )}
          
          {quantityContext !== null && (
            <TouchableOpacity 
              style={styles.chip} 
              onPress={() => setQuantityContext(null)}
            >
              <Text style={styles.chipText}>Quantity: {quantityContext} kg</Text>
              <Text style={styles.chipClose}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Language selector modal
  const renderLanguageModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.languageModalContent}>
            <Text style={styles.languageModalTitle}>Select Language</Text>
            <FlatList
              data={supportedLanguages}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    language === item && styles.selectedLanguageOption
                  ]}
                  onPress={() => {
                    setLanguage(item);
                    setMenuVisible(false);
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    language === item && styles.selectedLanguageOptionText
                  ]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                  {language === item && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.languageLabel}>Language:</Text>
            <View style={styles.languageChip}>
              <Text style={styles.languageChipText}>
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </Text>
              <Text style={styles.languageChipIcon}>▼</Text>
            </View>
          </TouchableOpacity>
          
          {apiStatus === 'disconnected' && (
            <TouchableOpacity 
              style={styles.statusChip}
              onPress={retryConnection}
            >
              <Text style={styles.statusChipText}>
                {checkingApi ? 'Reconnecting...' : 'Offline'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {renderContextInfo()}
        
        <ScrollView 
          style={styles.chatContainer}
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContentContainer}
        >
          {chatHistory.map(chat => (
            <View key={chat.id} style={styles.messageWrapper}>
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
        
        <View style={[
          styles.inputContainer,
          keyboardShown && Platform.OS === 'ios' ? styles.inputContainerWithKeyboard : null
        ]}>
          <RNTextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            placeholderTextColor="#888"
            editable={!(loading || apiStatus === 'disconnected')}
            multiline={true}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() || loading || apiStatus === 'disconnected') ? styles.sendButtonDisabled : null
            ]}
            onPress={handleSend}
            disabled={!message.trim() || loading || apiStatus === 'disconnected'}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        
        {renderLanguageModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Define custom styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2ff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d0d9ff',
  },
  languageChipText: {
    fontSize: 14,
    color: '#3b5998',
    fontWeight: '600',
  },
  languageChipIcon: {
    fontSize: 10,
    color: '#3b5998',
    marginLeft: 4,
  },
  statusChip: {
    backgroundColor: '#ffe0e0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  statusChipText: {
    fontSize: 14,
    color: '#cc0000',
    fontWeight: '600',
  },
  contextContainer: {
    padding: 12,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 2,
    borderWidth: 1,
    borderColor: '#bae0fd',
  },
  chipText: {
    fontSize: 13,
    color: '#0369a1',
  },
  chipClose: {
    fontSize: 16,
    color: '#0369a1',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  messageContainer: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary || '#3a86ff',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  dataCard: {
    marginTop: 8,
    marginLeft: 10,
    marginBottom: 10,
    padding: 14,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#d0e1f9',
  },
  dataTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.primary || '#3a86ff',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 14,
  },
  dataValue: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    alignItems: 'flex-end',
  },
  inputContainerWithKeyboard: {
    paddingBottom: 26, // Extra padding when keyboard is shown on iOS
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary || '#3a86ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#c5c9cc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  languageModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLanguageOption: {
    backgroundColor: '#f0f9ff',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageOptionText: {
    fontWeight: 'bold',
    color: '#0284c7',
  },
  checkmark: {
    fontSize: 18,
    color: '#0284c7',
    fontWeight: 'bold',
  },
});