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
import { useAppColorScheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';

// Define types
interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  data?: any;
}

export default function ChatbotRoute() {
  const { language } = useLanguage();
  
  // Define translations for the route component
  const translations = {
    en: {
      screenTitle: "AI Farming Assistant",
      headerBackTitle: "Chat"
    },
    si: {
      screenTitle: "AI ගොවිතැන් සහායක",
      headerBackTitle: "චැට්"
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
      <ChatBotScreen />
    </>
  );
}

const ChatBotScreen = () => {
  const [message, setMessage] = useState<string>('');
  const { language: appLanguage } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatLanguage, setChatLanguage] = useState<string>('english');
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['english', 'sinhala']);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [checkingApi, setCheckingApi] = useState<boolean>(true);
  const [locationContext, setLocationContext] = useState<string>('');
  const [bananaTypeContext, setBananaTypeContext] = useState<string>('');
  const [quantityContext, setQuantityContext] = useState<number | null>(null);
  const [keyboardShown, setKeyboardShown] = useState<boolean>(false);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  // Define translations for the component
  const translations = {
    en: {
      welcomeMessage: "Hello! I'm your banana farming assistant. How can I help you?",
      language: "Language:",
      offline: "Offline",
      reconnecting: "Reconnecting...",
      currentContext: "Current Context:",
      locationChip: "Location: ",
      typeChip: "Type: ",
      quantityChip: "Quantity: ",
      kgUnit: " kg",
      messagePlaceholder: "Type your message here...",
      sendButton: "Send",
      selectLanguage: "Select Language",
      loadingText: "Thinking..."
    },
    si: {
      welcomeMessage: "ආයුබෝවන්! මම ඔබේ කේසෙල් වගා සහායකයායි. මට ඔබට කෙසේ උදව් කළ හැකිද?",
      language: "භාෂාව:",
      offline: "ඔෆ්ලයින්",
      reconnecting: "නැවත සම්බන්ධ වෙමින්...",
      currentContext: "වර්තමාන සන්දර්භය:",
      locationChip: "ස්ථානය: ",
      typeChip: "වර්ගය: ",
      quantityChip: "ප්‍රමාණය: ",
      kgUnit: " කි.ග්‍රෑ.",
      messagePlaceholder: "ඔබේ පණිවිඩය මෙහි ටයිප් කරන්න...",
      sendButton: "යවන්න",
      selectLanguage: "භාෂාව තෝරන්න",
      loadingText: "සිතමින්..."
    }
  };
  
  // Get the current language text
  const t = appLanguage === 'si' ? translations.si : translations.en;

  // Initialize chat with welcome message based on selected language
  useEffect(() => {
    setChatHistory([
      { id: 1, text: t.welcomeMessage, isBot: true }
    ]);
  }, [t.welcomeMessage]);

  // Update chat language when app language changes
  useEffect(() => {
    setChatLanguage(appLanguage === 'si' ? 'sinhala' : 'english');
  }, [appLanguage]);

  const themedStyles = {
    safeArea: {
      ...styles.safeArea,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    container: {
      ...styles.container,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      borderBottomColor: isDark ? '#333333' : '#e1e4e8',
    },
    languageLabel: {
      ...styles.languageLabel,
      color: isDark ? '#b0b0b0' : '#555',
    },
    languageChip: {
      ...styles.languageChip,
      backgroundColor: isDark ? '#293649' : '#edf2ff',
      borderColor: isDark ? '#394B61' : '#d0d9ff',
    },
    languageChipText: {
      ...styles.languageChipText,
      color: isDark ? '#a2b9e0' : '#3b5998',
    },
    languageChipIcon: {
      ...styles.languageChipIcon,
      color: isDark ? '#a2b9e0' : '#3b5998',
    },
    statusChip: {
      ...styles.statusChip,
      backgroundColor: isDark ? '#3d2626' : '#ffe0e0',
      borderColor: isDark ? '#4d2e2e' : '#ffcccc',
    },
    contextContainer: {
      ...styles.contextContainer,
      backgroundColor: isDark ? '#1a1d21' : '#f0f4f8',
      borderBottomColor: isDark ? '#333333' : '#e1e4e8',
    },
    contextTitle: {
      ...styles.contextTitle,
      color: isDark ? '#b0b0b0' : '#666',
    },
    chip: {
      ...styles.chip,
      backgroundColor: isDark ? '#1e2f3e' : '#e0f2fe',
      borderColor: isDark ? '#2a3f52' : '#bae0fd',
    },
    chipText: {
      ...styles.chipText,
      color: isDark ? '#77b6e8' : '#0369a1',
    },
    chipClose: {
      ...styles.chipClose,
      color: isDark ? '#77b6e8' : '#0369a1',
    },
    botMessage: {
      ...styles.botMessage,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    userMessage: {
      ...styles.userMessage,
      backgroundColor: COLORS.primary || '#3a86ff',
    },
    messageText: {
      ...styles.messageText,
      color: isDark ? (prop: any) => prop.isBot ? '#e0e0e0' : '#ffffff' : (prop: any) => prop.isBot ? COLORS.text : COLORS.white,
    },
    loadingContainer: {
      ...styles.loadingContainer,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
    },
    loadingText: {
      ...styles.loadingText,
      color: isDark ? '#b0b0b0' : '#666',
    },
    dataCard: {
      ...styles.dataCard,
      backgroundColor: isDark ? '#1a2633' : '#f0f8ff',
      borderColor: isDark ? '#223547' : '#d0e1f9',
    },
    dataTitle: {
      ...styles.dataTitle,
      color: isDark ? '#77b6e8' : COLORS.primary || '#3a86ff',
    },
    dataLabel: {
      ...styles.dataLabel,
      color: isDark ? '#b0b0b0' : '#444',
    },
    dataValue: {
      ...styles.dataValue,
      color: isDark ? '#e0e0e0' : '#333',
    },
    inputContainer: {
      ...styles.inputContainer,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      borderTopColor: isDark ? '#333333' : '#e1e4e8',
    },
    input: {
      ...styles.input,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderColor: isDark ? '#444444' : '#e1e4e8',
      color: isDark ? '#e0e0e0' : '#000000',
    },
    modalOverlay: {
      ...styles.modalOverlay,
    },
    languageModalContent: {
      ...styles.languageModalContent,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    languageModalTitle: {
      ...styles.languageModalTitle,
      color: isDark ? '#e0e0e0' : '#333',
    },
    languageOption: {
      ...styles.languageOption,
      borderBottomColor: isDark ? '#333333' : '#eee',
    },
    selectedLanguageOption: {
      ...styles.selectedLanguageOption,
      backgroundColor: isDark ? '#1a2633' : '#f0f9ff',
    },
    languageOptionText: {
      ...styles.languageOptionText,
      color: isDark ? '#e0e0e0' : '#333',
    },
    selectedLanguageOptionText: {
      ...styles.selectedLanguageOptionText,
      color: isDark ? '#77b6e8' : '#0284c7',
    },
    checkmark: {
      ...styles.checkmark,
      color: isDark ? '#77b6e8' : '#0284c7',
    },
  };

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
        language: chatLanguage
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
    
    // Market-specific translations
    const marketTranslations = {
      en: {
        title: "Market Recommendation",
        bestMarket: "Best Market:",
        price: "Price:",
        distance: "Distance:",
        potentialProfit: "Potential Profit:",
        kmUnit: "km"
      },
      si: {
        title: "වෙළඳපොල නිර්දේශය",
        bestMarket: "හොඳම වෙළඳපොල:",
        price: "මිල:",
        distance: "දුර:",
        potentialProfit: "විය හැකි ලාභය:",
        kmUnit: "කි.මී."
      }
    };
    
    const mt = appLanguage === 'si' ? marketTranslations.si : marketTranslations.en;
    
    return (
      <View style={themedStyles.dataCard}>
        <Text style={themedStyles.dataTitle}>{mt.title}</Text>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{mt.bestMarket}</Text>
          <Text style={themedStyles.dataValue}>{data.best_market.name}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{mt.price}</Text>
          <Text style={themedStyles.dataValue}>{data.best_market.predicted_price} LKR/kg</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{mt.distance}</Text>
          <Text style={themedStyles.dataValue}>{data.best_market.distance} {mt.kmUnit}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{mt.potentialProfit}</Text>
          <Text style={themedStyles.dataValue}>{data.best_market.potential_profit.toFixed(2)} LKR</Text>
        </View>
      </View>
    );
  };

  // Render price prediction if available in chat message
  const renderPriceData = (data: any) => {
    if (!data || !data.price) return null;
    
    // Price-specific translations
    const priceTranslations = {
      en: {
        title: "Price Prediction",
        price: "Price:",
        bananaType: "Banana Type:",
        location: "Location:",
        date: "Date:"
      },
      si: {
        title: "මිල පුරෝකථනය",
        price: "මිල:",
        bananaType: "කෙසෙල් වර්ගය:",
        location: "ස්ථානය:",
        date: "දිනය:"
      }
    };
    
    const pt = appLanguage === 'si' ? priceTranslations.si : priceTranslations.en;
    
    return (
      <View style={themedStyles.dataCard}>
        <Text style={themedStyles.dataTitle}>{pt.title}</Text>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{pt.price}</Text>
          <Text style={themedStyles.dataValue}>{data.price} {data.currency}/kg</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{pt.bananaType}</Text>
          <Text style={themedStyles.dataValue}>{data.banana_type}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{pt.location}</Text>
          <Text style={themedStyles.dataValue}>{data.location}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={themedStyles.dataLabel}>{pt.date}</Text>
          <Text style={themedStyles.dataValue}>{data.date}</Text>
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
      <View style={themedStyles.contextContainer}>
        <Text style={themedStyles.contextTitle}>{t.currentContext}</Text>
        <View style={styles.chipContainer}>
          {locationContext && (
            <TouchableOpacity 
              style={themedStyles.chip} 
              onPress={() => setLocationContext('')}
            >
              <Text style={themedStyles.chipText}>{t.locationChip}{locationContext}</Text>
              <Text style={themedStyles.chipClose}>×</Text>
            </TouchableOpacity>
          )}
          
          {bananaTypeContext && (
            <TouchableOpacity 
              style={themedStyles.chip} 
              onPress={() => setBananaTypeContext('')}
            >
              <Text style={themedStyles.chipText}>{t.typeChip}{bananaTypeContext}</Text>
              <Text style={themedStyles.chipClose}>×</Text>
            </TouchableOpacity>
          )}
          
          {quantityContext !== null && (
            <TouchableOpacity 
              style={themedStyles.chip} 
              onPress={() => setQuantityContext(null)}
            >
              <Text style={themedStyles.chipText}>{t.quantityChip}{quantityContext}{t.kgUnit}</Text>
              <Text style={themedStyles.chipClose}>×</Text>
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
          style={themedStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={themedStyles.languageModalContent}>
            <Text style={themedStyles.languageModalTitle}>{t.selectLanguage}</Text>
            <FlatList
              data={supportedLanguages}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    themedStyles.languageOption,
                    chatLanguage === item && themedStyles.selectedLanguageOption
                  ]}
                  onPress={() => {
                    setChatLanguage(item);
                    setMenuVisible(false);
                  }}
                >
                  <Text style={[
                    themedStyles.languageOptionText,
                    chatLanguage === item && themedStyles.selectedLanguageOptionText
                  ]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                  {chatLanguage === item && (
                    <Text style={themedStyles.checkmark}>✓</Text>
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
    <SafeAreaView style={themedStyles.safeArea}>
      <KeyboardAvoidingView
        style={themedStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={themedStyles.header}>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={themedStyles.languageLabel}>{t.language}</Text>
            <View style={themedStyles.languageChip}>
              <Text style={themedStyles.languageChipText}>
                {chatLanguage.charAt(0).toUpperCase() + chatLanguage.slice(1)}
              </Text>
              <Text style={themedStyles.languageChipIcon}>▼</Text>
            </View>
          </TouchableOpacity>
          
          {apiStatus === 'disconnected' && (
            <TouchableOpacity 
              style={themedStyles.statusChip}
              onPress={retryConnection}
            >
              <Text style={styles.statusChipText}>
                {checkingApi ? t.reconnecting : t.offline}
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
                  chat.isBot ? themedStyles.botMessage : themedStyles.userMessage
                ]}
              >
                <Text style={{
                  ...styles.messageText,
                  color: chat.isBot 
                    ? (isDark ? '#e0e0e0' : COLORS.text) 
                    : COLORS.white
                }}>
                  {chat.text}
                </Text>
              </View>
              
              {chat.isBot && chat.data && chat.data.best_market && renderMarketData(chat.data)}
              {chat.isBot && chat.data && chat.data.price && renderPriceData(chat.data)}
            </View>
          ))}
          {loading && (
            <View style={themedStyles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={themedStyles.loadingText}>{t.loadingText}</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={[
          themedStyles.inputContainer,
          keyboardShown && Platform.OS === 'ios' ? styles.inputContainerWithKeyboard : null
        ]}>
          <RNTextInput
            ref={inputRef}
            style={themedStyles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={t.messagePlaceholder}
            placeholderTextColor={isDark ? "#777777" : "#888888"}
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
            <Text style={styles.sendButtonText}>{t.sendButton}</Text>
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