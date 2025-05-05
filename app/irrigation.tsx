import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Button, Switch, Menu, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/components/LanguageContext';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';

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
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean | string>(false);
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
  
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [humidityData, setHumidityData] = useState<number[]>([]);
  const [moistureData, setMoistureData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  
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
        await signInAnonymously(irrigationAuth);
        console.log('User signed in anonymously to irrigation system');
        
        loadSensorData();
        loadSummaryData();
        loadHistoricalData(timeRange);
        loadSettings();
      } catch (error) {
        console.error('Authentication failed:', error);
        Alert.alert('Error', 'Failed to connect to database');
      }
    };

    initFirebase();

    return () => {
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
        <Text style={styles.loadingText}>{t.loading}</Text>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>{title}</Text>
          <ScrollView horizontal>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                {chartLabels.slice(0, 5).map((label, index) => (
                  <Text key={index} style={styles.tableHeaderCell}>{label}</Text>
                ))}
              </View>
              <View style={styles.tableRow}>
                {data.slice(0, 5).map((value, index) => (
                  <Text key={index} style={styles.tableCell}>{value.toFixed(1)}</Text>
                ))}
              </View>
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.dashboardTitle}>{t.title}</Text>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsButton}>
            <Feather name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Summary Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{t.summary}</Text>
              <View style={styles.averageCard}>
                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>{t.avgTemperature}</Text>
                  <Text style={styles.averageValue}>{summaryData.avgTemperature}</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>{t.avgHumidity}</Text>
                  <Text style={styles.averageValue}>{summaryData.avgHumidity}</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>{t.avgMoisture}</Text>
                  <Text style={styles.averageValue}>{summaryData.avgMoisture}</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>{t.rainPossibility}</Text>
                  <Text style={styles.averageValue}>{summaryData.rainPossibility}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{t.sensorData}</Text>
              <ScrollView horizontal>
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
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{row.module}</Text>
                        <Text style={[styles.tableCell, styles.numericCell]}>{row.battery?.toFixed(1)}</Text>
                        <Text style={[styles.tableCell, styles.numericCell]}>{row.humidity?.toFixed(1)}</Text>
                        <Text style={[styles.tableCell, styles.numericCell]}>{row.moisture?.toFixed(1)}</Text>
                        <Text style={[styles.tableCell, styles.numericCell]}>{row.temperature?.toFixed(1)}</Text>
                        <Text style={styles.tableCell}>{row.timestamp}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.loadingCell]}>{t.loading}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Time Range Selector */}
          <View style={styles.controls}>
            <Menu
              visible={menuVisible === true}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setMenuVisible(true)}
                  style={styles.timeRangeButton}
                  icon="refresh"
                >
                  {timeRange === '24h' ? t.lastDay : timeRange === '7d' ? t.lastWeek : t.lastMonth}
                </Button>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setTimeRange('24h');
                  loadHistoricalData('24h');
                  setMenuVisible(false);
                }} 
                title={t.lastDay} 
              />
              <Menu.Item 
                onPress={() => {
                  setTimeRange('7d');
                  loadHistoricalData('7d');
                  setMenuVisible(false);
                }} 
                title={t.lastWeek} 
              />
              <Menu.Item 
                onPress={() => {
                  setTimeRange('30d');
                  loadHistoricalData('30d');
                  setMenuVisible(false);
                }} 
                title={t.lastMonth} 
              />
            </Menu>
          </View>

          {/* Charts (replaced with data tables) */}
          {renderChartData(t.temperatureHistory, temperatureData)}
          {renderChartData(t.humidityHistory, humidityData)}
          {renderChartData(t.moistureHistory, moistureData)}
        </ScrollView>

        {/* Settings Modal */}
        <Portal>
          <Modal
            visible={settingsVisible}
            onDismiss={() => setSettingsVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalTitle}>{t.settings}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.bananaType}</Text>
              <Menu
                visible={menuVisible === 'bananaType'}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setMenuVisible('bananaType')}
                    style={styles.selectButton}
                  >
                    Type {settings.bananaType}
                  </Button>
                }
              >
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, bananaType: '1'});
                    setMenuVisible(false);
                  }} 
                  title="Type 1" 
                />
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, bananaType: '2'});
                    setMenuVisible(false);
                  }} 
                  title="Type 2" 
                />
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, bananaType: '3'});
                    setMenuVisible(false);
                  }} 
                  title="Type 3" 
                />
              </Menu>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.cropStage}</Text>
              <Menu
                visible={menuVisible === 'cropStage'}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setMenuVisible('cropStage')}
                    style={styles.selectButton}
                  >
                    Stage {settings.cropStage}
                  </Button>
                }
              >
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, cropStage: '1'});
                    setMenuVisible(false);
                  }} 
                  title="Stage 1" 
                />
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, cropStage: '2'});
                    setMenuVisible(false);
                  }} 
                  title="Stage 2" 
                />
                <Menu.Item 
                  onPress={() => {
                    setSettings({...settings, cropStage: '3'});
                    setMenuVisible(false);
                  }} 
                  title="Stage 3" 
                />
              </Menu>
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.modeLabel}>
                <Text style={styles.formLabel}>{t.operationMode}</Text>
                <View style={styles.modeStatus}>
                  <Switch
                    value={settings.operationMode}
                    onValueChange={(value) => setSettings({...settings, operationMode: value})}
                    color="#2196f3"
                  />
                  <Text style={styles.statusText}>
                    {settings.operationMode ? t.auto : t.manual}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.modeLabel}>
                <Text style={styles.formLabel}>{t.testMode}</Text>
                <View style={styles.modeStatus}>
                  <Switch
                    value={settings.testMode}
                    onValueChange={(value) => setSettings({...settings, testMode: value})}
                    color="#2196f3"
                  />
                  <Text style={styles.statusText}>
                    {settings.testMode ? t.on : t.off}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonGroup}>
              <Button 
                mode="outlined" 
                onPress={() => setSettingsVisible(false)}
                style={styles.cancelButton}
              >
                {t.cancel}
              </Button>
              <Button 
                mode="contained" 
                onPress={saveSettings}
                style={styles.saveButton}
              >
                {t.save}
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#2196f3',
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardTitle: {
    color: '#ffffff',
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
    padding: 15,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 15,
    textAlign: 'center',
  },
  averageCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  averageItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  averageValue: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  controls: {
    marginBottom: 20,
    alignItems: 'center',
  },
  timeRangeButton: {
    width: 200,
  },
  tableContainer: {
    minWidth: Dimensions.get('window').width - 60,
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2196f3',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
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
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 80,
  },
  numericCell: {
    textAlign: 'right',
  },
  loadingCell: {
    textAlign: 'center',
    flex: 6,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectButton: {
    width: '100%',
  },
  modeLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 10,
    color: '#2196f3',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#2196f3',
  },
  cancelButton: {
    borderColor: '#e0e0e0',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
});