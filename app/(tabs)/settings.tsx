import { SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Switch, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { useThemeContext } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { useCallback, useState } from 'react';

export default function SettingsScreen() {
  const { colorScheme, setThemePreference } = useThemeContext();
  const { language, setLanguage } = useLanguage();
  const isDarkMode = colorScheme === 'dark';
  
  const toggleTheme = useCallback(() => {
    setThemePreference(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setThemePreference]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' }, // Sinhala
  ];

  // Handle language selection
  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>      
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Preferences' : 'මනාපයන්'}
          </Text>
          <View style={styles.sectionContent}>
            {/* Dark Mode Toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Ionicons 
                  name="moon-outline" 
                  size={22} 
                  color={isDarkMode ? "#6200ee" : "#555"} 
                  style={styles.icon} 
                />
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Dark Mode' : 'අඳුරු මාදිලිය'}
                </Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: '#6200ee' }}
                  thumbColor="#f4f3f4"
                />
              </View>
            </View>

            {/* Language Selection */}
            <View style={styles.settingItem}>
              <View style={styles.settingRow}>
                <Ionicons 
                  name="language-outline" 
                  size={22} 
                  color="#6200ee" 
                  style={styles.icon} 
                />
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Language' : 'භාෂාව'}
                </Text>
              </View>
              <RNView style={styles.languageOptions}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      language === lang.code && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={[
                      styles.languageText,
                      language === lang.code && styles.selectedLanguageText
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </RNView>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View style={styles.settingRow}>
                <Ionicons name="log-out-outline" size={22} color="#6200ee" style={styles.icon} />
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Sign Out' : 'පිටවීම'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionContent: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 14,
    width: 22,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingLeft: 36,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#6200ee',
  },
  languageText: {
    fontSize: 14,
    color: '#444',
  },
  selectedLanguageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});