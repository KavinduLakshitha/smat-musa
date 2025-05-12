import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAppColorScheme } from '@/components/ThemeContext';
import { Text, View as ThemedView } from '@/components/Themed';
import { Stack } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/components/LanguageContext';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { COLORS } from '@/constants/Colors';

// Smart agriculture Firebase configuration
const irrigationFirebaseConfig = {
  apiKey: "AIzaSyD2RHVqqdwo7pUc2mPFtZoQmN6sIaX3KB8",
  authDomain: "smart-agriculture-2.firebaseapp.com",
  databaseURL: "https://smart-agriculture-2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-agriculture-2",
  storageBucket: "smart-agriculture-2.firebasestorage.app",
  messagingSenderId: "268809839687",
  appId: "1:268809839687:web:4463c1e9eeffbc17d2fd62",
};

// Initialize a secondary Firebase app for irrigation with a unique name
const irrigationApp = initializeApp(irrigationFirebaseConfig, "irrigationApp");
const irrigationDb = getDatabase(irrigationApp);
const irrigationAuth = getAuth(irrigationApp);

export default function IrrigationRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Smart Irrigation System",
          headerBackTitle: "Home"
        }}
      />
      <IrrigationDashboard />
    </>
  );
}

interface SensorData {
  module: string;
  battery: number;
  humidity: number;
  moisture: number;
  temperature: number;
  timestamp: string;
}

interface SummaryData {
  avgTemperature: string;
  avgHumidity: string;
  avgMoisture: string;
  rainPossibility: string;
}

interface Settings {
  bananaType: string;
  cropStage: string;
  operationMode: boolean;
  testMode: boolean;
}

interface TranslationType {
  title: string;
  summary: string;
  avgTemperature: string;
  avgHumidity: string;
  avgMoisture: string;
  rainPossibility: string;
  sensorData: string;
  module: string;
  battery: string;
  humidity: string;
  moisture: string;
  temperature: string;
  lastUpdate: string;
  timeRange: string;
  lastDay: string;
  lastWeek: string;
  lastMonth: string;
  temperatureHistory: string;
  humidityHistory: string;
  moistureHistory: string;
  settings: string;
  bananaType: string;
  cropStage: string;
  operationMode: string;
  testMode: string;
  auto: string;
  manual: string;
  on: string;
  off: string;
  save: string;
  cancel: string;
  settingsSaved: string;
  loading: string;
}

interface TranslationsType {
  en: TranslationType;
  si: TranslationType;
}

const IrrigationDashboard = () => {
  const { language } = useLanguage() as { language: string };
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState<boolean>(false);
  const [bananaTypeModalVisible, setBananaTypeModalVisible] = useState<boolean>(false);
  const [cropStageModalVisible, setCropStageModalVisible] = useState<boolean>(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    avgTemperature: '-',
    avgHumidity: '-',
    avgMoisture: '-',
    rainPossibility: '-',
  });
  const [settings, setSettings] = useState<Settings>({
    bananaType: '1',
    cropStage: '1',
    operationMode: false,
    testMode: false,
  });

  const themedStyles = {
    safeArea: {
      ...styles.safeArea,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    card: {
      ...styles.card,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    },
    cardHeader: {
      ...styles.cardHeader,
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderBottomColor: isDark ? '#333333' : '#e0e0e0',
    },
    cardTitle: {
      ...styles.cardTitle,
      color: isDark ? '#ffffff' : '#333333',
    },
    summaryItem: {
      ...styles.summaryItem,
      backgroundColor: isDark ? '#282828' : '#f5f5f5',
    },
    summaryLabel: {
      ...styles.summaryLabel,
      color: isDark ? '#e0e0e0' : '#666666',
    },
    summaryValue: {
      ...styles.summaryValue,
      color: isDark ? '#ffffff' : '#333333',
    },
    tableRow: {
      ...styles.tableRow,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderColor: isDark ? '#333333' : '#e0e0e0',
    },
    tableRowOdd: {
      backgroundColor: isDark ? '#252525' : '#f9f9f9',
    },
    tableCell: {
      ...styles.tableCell,
      color: isDark ? '#e0e0e0' : '#333333',
    },
    loadingText: {
      ...styles.loadingText,
      color: isDark ? '#cccccc' : '#666666',
    },
    modalContainer: {
      ...styles.modalContainer,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    },
    modalTitle: {
      ...styles.modalTitle,
      color: isDark ? '#ffffff' : '#333333',
    },
    modalOption: {
      ...styles.modalOption,
      borderBottomColor: isDark ? '#333333' : '#e0e0e0',
    },
    selectedOption: {
      backgroundColor: isDark ? '#2C5E1A33' : '#f0f9f0',
    },
    modalOptionText: {
      ...styles.modalOptionText,
      color: isDark ? '#e0e0e0' : '#333333',
    },
    settingsModalOverlay: {
      ...styles.settingsModalOverlay,
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
    },
    settingLabel: {
      ...styles.settingLabel,
      color: isDark ? '#ffffff' : '#333333',
    },
    settingButton: {
      ...styles.settingButton,
      backgroundColor: isDark ? '#282828' : '#f5f5f5',
      borderColor: isDark ? '#333333' : '#e0e0e0',
    },
    settingButtonText: {
      ...styles.settingButtonText,
      color: isDark ? '#4CAF50' : '#2C5E1A',
    },
    toggleContainer: {
      ...styles.toggleContainer,
      borderColor: isDark ? '#333333' : '#e0e0e0',
    },
    toggleOption: {
      ...styles.toggleOption,
      backgroundColor: isDark ? '#282828' : '#f5f5f5',
    },
    toggleOptionText: {
      ...styles.toggleOptionText,
      color: isDark ? '#cccccc' : '#666666',
    },
    cancelButton: {
      ...styles.cancelButton,
      backgroundColor: isDark ? '#282828' : '#f5f5f5',
      borderColor: isDark ? '#333333' : '#e0e0e0',
    },
    cancelButtonText: {
      ...styles.cancelButtonText,
      color: isDark ? '#cccccc' : '#666666',
    },
  };
  
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [humidityData, setHumidityData] = useState<number[]>([]);
  const [moistureData, setMoistureData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const translations: TranslationsType = {
    en: {
      title: "IoT-Based Weather Prediction and Irrigation System",
      summary: "Summary",
      avgTemperature: "Average Temperature",
      avgHumidity: "Average Humidity",
      avgMoisture: "Average Moisture",
      rainPossibility: "Rain Possibility",
      sensorData: "Sensor Data",
      module: "Module",
      battery: "Battery (%)",
      humidity: "Humidity (%)",
      moisture: "Moisture (%)",
      temperature: "Temperature (°C)",
      lastUpdate: "Last Update",
      timeRange: "Time Range",
      lastDay: "Last 24 Hours",
      lastWeek: "Last 7 Days",
      lastMonth: "Last 30 Days",
      temperatureHistory: "Temperature History",
      humidityHistory: "Humidity History",
      moistureHistory: "Moisture History",
      settings: "Settings",
      bananaType: "Banana Type",
      cropStage: "Crop Stage",
      operationMode: "Operation Mode",
      testMode: "Test Mode",
      auto: "Auto",
      manual: "Manual",
      on: "On",
      off: "Off",
      save: "Save",
      cancel: "Cancel",
      settingsSaved: "Settings saved successfully!",
      loading: "Loading...",
    },
    si: {
      title: "IoT පදනම් කරගත් කාලගුණ පුරෝකථන සහ වාරිමාර්ග පද්ධති",
      summary: "සාරාංශය",
      avgTemperature: "සාමාන්‍ය උෂ්ණත්වය",
      avgHumidity: "සාමාන්‍ය ආර්ද්‍රතාවය",
      avgMoisture: "සාමාන්‍ය තෙතමනය",
      rainPossibility: "වැසි හැකියාව",
      sensorData: "සංවේදක දත්ත",
      module: "මොඩියුලය",
      battery: "බැටරිය (%)",
      humidity: "ආර්ද්‍රතාවය (%)",
      moisture: "තෙතමනය (%)",
      temperature: "උෂ්ණත්වය (°C)",
      lastUpdate: "අවසන් යාවත්කාලීනය",
      timeRange: "කාල පරාසය",
      lastDay: "පසුගිය පැය 24",
      lastWeek: "පසුගිය දින 7",
      lastMonth: "පසුගිය දින 30",
      temperatureHistory: "උෂ්ණත්ව ඉතිහාසය",
      humidityHistory: "ආර්ද්‍රතා ඉතිහාසය",
      moistureHistory: "තෙතමන ඉතිහාසය",
      settings: "සැකසුම්",
      bananaType: "කෙසෙල් වර්ගය",
      cropStage: "බෝග අදියර",
      operationMode: "ක්‍රියාකාරී ප්‍රකාරය",
      testMode: "පරීක්ෂණ ප්‍රකාරය",
      auto: "ස්වයංක්‍රීය",
      manual: "අතින්",
      on: "සක්‍රීය",
      off: "අක්‍රීය",
      save: "සුරකින්න",
      cancel: "අවලංගු කරන්න",
      settingsSaved: "සැකසුම් සාර්ථකව සුරකින ලදී!",
      loading: "පූරණය වෙමින්...",
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    const initFirebase = async () => {
      try {
        setLoading(true);
        await signInAnonymously(irrigationAuth);
        console.log('User signed in anonymously to irrigation system');
        
        loadSensorData();
        loadSummaryData();
        loadHistoricalData(timeRange);
        loadSettings();
        setLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to connect to database');
      }
    };

    initFirebase();

    return () => {
      // Clean up listeners
      const sensorRef = ref(irrigationDb, 'esp32/sensor_data');
      const histRef = ref(irrigationDb, 'esp32/historical_data');
      const settingsRef = ref(irrigationDb, 'esp32/settings');
      onValue(sensorRef, () => {}, { onlyOnce: true });
      onValue(histRef, () => {}, { onlyOnce: true });
      onValue(settingsRef, () => {}, { onlyOnce: true });
    };
  }, []);

  const loadSettings = () => {
    const settingsRef = ref(irrigationDb, 'esp32/settings');
    
    onValue(settingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setSettings({
        bananaType: data.bananaType || '1',
        cropStage: data.cropStage || '1',
        operationMode: data.mode === 1,
        testMode: data.Testmode === 1,
      });
    });
  };

  const loadSensorData = () => {
    const sensorDataRef = ref(irrigationDb, 'esp32/sensor_data');
    
    onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val() || {};
      const dataArray: SensorData[] = Object.entries(data).map(([key, value]) => ({
        module: key,
        ...(value as any)
      }));
      
      setSensorData(dataArray);
    });
  };

  const loadSummaryData = () => {
    const indexRef = ref(irrigationDb, 'esp32/historical_data/Index');
    
    onValue(indexRef, (indexSnapshot) => {
      const index = indexSnapshot.val();
      if (index) {
        const dataRef = ref(irrigationDb, `esp32/historical_data/${index}`);
        get(dataRef).then((dataSnapshot) => {
          const data = dataSnapshot.val();
          if (data) {
            setSummaryData({
              avgTemperature: `${data.temperature.toFixed(1)}°C`,
              avgHumidity: `${data.humidity.toFixed(1)}%`,
              avgMoisture: `${data.moisture.toFixed(1)}%`,
              rainPossibility: `${data.chanceOfRain.toFixed(1)}%`,
            });
          }
        });
      }
    });
  };
  
  const loadHistoricalData = (range: string) => {
    const historicalRef = ref(irrigationDb, 'esp32/historical_data');
    
    onValue(historicalRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const dataArray = Object.entries(data)
        .filter(([key]) => key !== 'Index')
        .map(([_, value]) => value as any)
        .filter(value => value.timestamp);

      const processedData = dataArray.map(value => ({
        ...value,
        timestampObj: new Date(value.timestamp).getTime(),
      }));

      processedData.sort((a, b) => a.timestampObj - b.timestampObj);

      const now = new Date().getTime();
      let cutoff = now;
      
      if (range === '24h') {
        cutoff = now - (24 * 60 * 60 * 1000);
      } else if (range === '7d') {
        cutoff = now - (7 * 24 * 60 * 60 * 1000);
      } else if (range === '30d') {
        cutoff = now - (30 * 24 * 60 * 60 * 1000);
      }

      const filteredData = processedData.filter(value => value.timestampObj > cutoff);

      const timestamps: string[] = [];
      const temperatures: number[] = [];
      const humidities: number[] = [];
      const moistures: number[] = [];

      filteredData.forEach(value => {
        let formattedTime;
        const timestamp = new Date(value.timestampObj);

        if (range === '24h') {
          formattedTime = `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
        } else {
          formattedTime = `${timestamp.getDate()}/${timestamp.getMonth() + 1}`;
        }

        timestamps.push(formattedTime);
        temperatures.push(value.temperature);
        humidities.push(value.humidity);
        moistures.push(value.moisture);
      });

      setChartLabels(timestamps);
      setTemperatureData(temperatures);
      setHumidityData(humidities);
      setMoistureData(moistures);
    });
  };

  const saveSettings = () => {
    const settingsRef = ref(irrigationDb, 'esp32/settings');
    
    set(settingsRef, {
      bananaType: settings.bananaType,
      cropStage: settings.cropStage,
      mode: settings.operationMode ? 1 : 0,
      Testmode: settings.testMode ? 1 : 0,
    })
    .then(() => {
      setSettingsVisible(false);
      Alert.alert('Success', t.settingsSaved);
    })
    .catch(error => {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    });
  };

  const renderChartData = (title: string, data: number[]) => {
    if (data.length === 0 || chartLabels.length === 0) {
      return (
        <View style={themedStyles.card}>
          <View style={themedStyles.cardHeader}>
            <Text style={themedStyles.cardTitle}>{title}</Text>
          </View>
          <View style={styles.cardContent}>
            <ActivityIndicator size="small" color={COLORS.primary || "#2C5E1A"} />
            <Text style={themedStyles.loadingText}>{t.loading}</Text>
          </View>
        </View>
      );
    }
  
    return (
      <View style={themedStyles.card}>
        <View style={themedStyles.cardHeader}>
          <Text style={themedStyles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardContent}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                {chartLabels.map((label, index) => (
                  <Text key={index} style={styles.tableHeaderCell}>{label}</Text>
                ))}
              </View>
              <View style={themedStyles.tableRow}>
                {data.map((value, index) => (
                  <Text key={index} style={[themedStyles.tableCell, styles.numericCell]}>
                    {value.toFixed(1)}
                  </Text>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderTimeRangeModal = () => (
    <Modal
      visible={timeRangeModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setTimeRangeModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setTimeRangeModalVisible(false)}
      >
      <View style={themedStyles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={themedStyles.modalTitle}>{t.timeRange}</Text>
          <TouchableOpacity onPress={() => setTimeRangeModalVisible(false)}>
            <Ionicons name="close" size={24} color={isDark ? "#aaaaaa" : "#666666"} />
          </TouchableOpacity>
        </View>
          
        <TouchableOpacity 
          style={[themedStyles.modalOption, timeRange === '24h' && themedStyles.selectedOption]}
          onPress={() => {
            setTimeRange('24h');
            loadHistoricalData('24h');
            setTimeRangeModalVisible(false);
          }}
        >
          <Text style={[themedStyles.modalOptionText, timeRange === '24h' && styles.selectedOptionText]}>
            {t.lastDay}
          </Text>
            {timeRange === '24h' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, timeRange === '7d' && styles.selectedOption]}
            onPress={() => {
              setTimeRange('7d');
              loadHistoricalData('7d');
              setTimeRangeModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, timeRange === '7d' && styles.selectedOptionText]}>
              {t.lastWeek}
            </Text>
            {timeRange === '7d' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, timeRange === '30d' && styles.selectedOption]}
            onPress={() => {
              setTimeRange('30d');
              loadHistoricalData('30d');
              setTimeRangeModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, timeRange === '30d' && styles.selectedOptionText]}>
              {t.lastMonth}
            </Text>
            {timeRange === '30d' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderBananaTypeModal = () => (
    <Modal
      visible={bananaTypeModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setBananaTypeModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setBananaTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.bananaType}</Text>
            <TouchableOpacity onPress={() => setBananaTypeModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.bananaType === '1' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, bananaType: '1'});
              setBananaTypeModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.bananaType === '1' && styles.selectedOptionText]}>
              Type 1
            </Text>
            {settings.bananaType === '1' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.bananaType === '2' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, bananaType: '2'});
              setBananaTypeModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.bananaType === '2' && styles.selectedOptionText]}>
              Type 2
            </Text>
            {settings.bananaType === '2' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.bananaType === '3' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, bananaType: '3'});
              setBananaTypeModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.bananaType === '3' && styles.selectedOptionText]}>
              Type 3
            </Text>
            {settings.bananaType === '3' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderCropStageModal = () => (
    <Modal
      visible={cropStageModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setCropStageModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setCropStageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.cropStage}</Text>
            <TouchableOpacity onPress={() => setCropStageModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.cropStage === '1' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, cropStage: '1'});
              setCropStageModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.cropStage === '1' && styles.selectedOptionText]}>
              Stage 1
            </Text>
            {settings.cropStage === '1' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.cropStage === '2' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, cropStage: '2'});
              setCropStageModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.cropStage === '2' && styles.selectedOptionText]}>
              Stage 2
            </Text>
            {settings.cropStage === '2' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalOption, settings.cropStage === '3' && styles.selectedOption]}
            onPress={() => {
              setSettings({...settings, cropStage: '3'});
              setCropStageModalVisible(false);
            }}
          >
            <Text style={[styles.modalOptionText, settings.cropStage === '3' && styles.selectedOptionText]}>
              Stage 3
            </Text>
            {settings.cropStage === '3' && <Ionicons name="checkmark" size={22} color={COLORS.primary || "#2C5E1A"} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={settingsVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <SafeAreaView style={styles.settingsModalOverlay}>
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsModalHeader}>
            <Text style={styles.settingsModalTitle}>{t.settings}</Text>
            <TouchableOpacity 
              onPress={() => setSettingsVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.settingsScrollView}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>{t.bananaType}</Text>
              <TouchableOpacity 
                style={styles.settingButton}
                onPress={() => setBananaTypeModalVisible(true)}
              >
                <Text style={styles.settingButtonText}>Type {settings.bananaType}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>{t.cropStage}</Text>
              <TouchableOpacity 
                style={styles.settingButton}
                onPress={() => setCropStageModalVisible(true)}
              >
                <Text style={styles.settingButtonText}>Stage {settings.cropStage}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingGroup}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>{t.operationMode}</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      !settings.operationMode && styles.toggleOptionSelected
                    ]}
                    onPress={() => setSettings({...settings, operationMode: false})}
                  >
                    <Text style={[
                      styles.toggleOptionText,
                      !settings.operationMode && styles.toggleOptionTextSelected
                    ]}>
                      {t.manual}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      settings.operationMode && styles.toggleOptionSelected
                    ]}
                    onPress={() => setSettings({...settings, operationMode: true})}
                  >
                    <Text style={[
                      styles.toggleOptionText,
                      settings.operationMode && styles.toggleOptionTextSelected
                    ]}>
                      {t.auto}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.settingGroup}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>{t.testMode}</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      !settings.testMode && styles.toggleOptionSelected
                    ]}
                    onPress={() => setSettings({...settings, testMode: false})}
                  >
                    <Text style={[
                      styles.toggleOptionText,
                      !settings.testMode && styles.toggleOptionTextSelected
                    ]}>
                      {t.off}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      settings.testMode && styles.toggleOptionSelected
                    ]}
                    onPress={() => setSettings({...settings, testMode: true})}
                  >
                    <Text style={[
                      styles.toggleOptionText,
                      settings.testMode && styles.toggleOptionTextSelected
                    ]}>
                      {t.on}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveSettings}
              >
                <Text style={styles.saveButtonText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setSettingsVisible(true)}
        >
          <Feather name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
          <ActivityIndicator size="large" color={COLORS.primary || "#2C5E1A"} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : (
        <ScrollView style={[styles.scrollView, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]} contentContainerStyle={styles.scrollContent}>
          {/* Summary Card */}
          <View style={themedStyles.card}>
            <View style={themedStyles.cardHeader}>
              <Text style={themedStyles.cardTitle}>{t.summary}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.summaryGrid}>
                {/* Update each summary item */}
                <View style={themedStyles.summaryItem}>
                  <Text style={themedStyles.summaryLabel}>{t.avgTemperature}</Text>
                  <Text style={themedStyles.summaryValue}>{summaryData.avgTemperature}</Text>
                </View>
                <View style={themedStyles.summaryItem}>
                  <Text style={themedStyles.summaryLabel}>{t.avgHumidity}</Text>
                  <Text style={themedStyles.summaryValue}>{summaryData.avgHumidity}</Text>
                </View>
                <View style={themedStyles.summaryItem}>
                  <Text style={themedStyles.summaryLabel}>{t.avgMoisture}</Text>
                  <Text style={themedStyles.summaryValue}>{summaryData.avgMoisture}</Text>
                </View>
                <View style={themedStyles.summaryItem}>
                  <Text style={themedStyles.summaryLabel}>{t.rainPossibility}</Text>
                  <Text style={themedStyles.summaryValue}>{summaryData.rainPossibility}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sensor Data Card */}
          <View style={themedStyles.card}>
            <View style={themedStyles.cardHeader}>
              <Text style={themedStyles.cardTitle}>{t.sensorData}</Text>
            </View>
            <View style={styles.cardContent}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>{t.module}</Text>
                    <Text style={[styles.tableHeaderCell, styles.numericCell]}>{t.battery}</Text>
                    <Text style={[styles.tableHeaderCell, styles.numericCell]}>{t.humidity}</Text>
                    <Text style={[styles.tableHeaderCell, styles.numericCell]}>{t.moisture}</Text>
                    <Text style={[styles.tableHeaderCell, styles.numericCell]}>{t.temperature}</Text>
                    <Text style={styles.tableHeaderCell}>{t.lastUpdate}</Text>
                  </View>

                  {sensorData.length > 0 ? (
                    sensorData.map((row, index) => (
                      <View key={index} style={[
                        themedStyles.tableRow, 
                        index % 2 === 0 ? null : themedStyles.tableRowOdd
                      ]}>
                        <Text style={themedStyles.tableCell}>{row.module}</Text>
                        <Text style={[themedStyles.tableCell, styles.numericCell]}>
                          {row.battery?.toFixed(1)}
                        </Text>
                        <Text style={[themedStyles.tableCell, styles.numericCell]}>
                          {row.humidity?.toFixed(1)}
                        </Text>
                        <Text style={[themedStyles.tableCell, styles.numericCell]}>
                          {row.moisture?.toFixed(1)}
                        </Text>
                        <Text style={[themedStyles.tableCell, styles.numericCell]}>
                          {row.temperature?.toFixed(1)}
                        </Text>
                        <Text style={themedStyles.tableCell}>{row.timestamp}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.loadingCell]}>{t.loading}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity 
              style={styles.timeRangeButton}
              onPress={() => setTimeRangeModalVisible(true)}
            >
              <Ionicons name="calendar-outline" size={22} color="#fff" style={styles.timeRangeIcon} />
              <Text style={styles.timeRangeText}>
                {timeRange === '24h' ? t.lastDay : timeRange === '7d' ? t.lastWeek : t.lastMonth}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Historical Data Charts */}
          {renderChartData(t.temperatureHistory, temperatureData)}
          {renderChartData(t.humidityHistory, humidityData)}
          {renderChartData(t.moistureHistory, moistureData)}
        </ScrollView>
      )}

      {/* Modals */}
      {renderTimeRangeModal()}
      {renderBananaTypeModal()}
      {renderCropStageModal()}
      {renderSettingsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  summaryItem: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableContainer: {
    minWidth: Dimensions.get('window').width - 60,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2C5E1A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 10,
  },
  tableHeaderCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 10,
    minWidth: 80,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
  },  
  tableRowOdd: {
    // backgroundColor: '#f9f9f9',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 80,
    fontSize: 14,
  },
  numericCell: {
    textAlign: 'right',
  },
  loadingCell: {
    textAlign: 'center',
    flex: 6,
  },
  timeRangeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeButton: {
    backgroundColor: '#2C5E1A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  timeRangeIcon: {
    marginRight: 8,
  },
  timeRangeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#f0f9f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2C5E1A',
    fontWeight: 'bold',
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  settingsModalContainer: {
    flex: 1,
  },
  settingsModalHeader: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsScrollView: {
    flex: 1,
    padding: 16,
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#2C5E1A',
  },
  settingRow: {
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  toggleOptionSelected: {
    backgroundColor: '#2C5E1A',
  },
  toggleOptionText: {
    fontSize: 14,
    color: '#666',
  },
  toggleOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2C5E1A',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});