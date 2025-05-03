import { SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { useThemeContext } from '@/components/ThemeContext';
import { useCallback } from 'react';

export default function SettingsScreen() {
  const { colorScheme, setThemePreference } = useThemeContext();
  const isDarkMode = colorScheme === 'dark';
  
  const toggleTheme = useCallback(() => {
    setThemePreference(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setThemePreference]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login")
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>      
        <View style={styles.section}>
            <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
                <View style={styles.settingRow}>
                <Ionicons 
                    name="moon-outline" 
                    size={22} 
                    color={isDarkMode ? "#6200ee" : "#555"} 
                    style={styles.icon} 
                />
                <Text style={styles.settingText}>Dark Mode</Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: '#6200ee' }}
                    thumbColor="#f4f3f4"
                />
                </View>
            </View>
            <TouchableOpacity
                style={styles.settingItem}
                onPress={handleSignOut}
            >
                <View style={styles.settingRow}>
                <Ionicons name="log-out-outline" size={22} color="#6200ee" style={styles.icon} />
                <Text style={styles.settingText}>Sign Out</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
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
});
