import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View, StyleSheet, TextStyle } from 'react-native';
// Import our new ThemeProvider and useAppColorScheme
import { ThemeProvider, useAppColorScheme } from '@/components/ThemeContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Wrap the RootLayoutNav with our ThemeProvider
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  // Use our custom hook that respects manual theme preferences
  const colorScheme = useAppColorScheme();

  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
    headerTitleStyle: {
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },
    contentStyle: {
      backgroundColor: colorScheme === 'dark' ? '#121212' : '#f4f4f4',
    }
  };

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={commonScreenOptions}>
        {/* Main app tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Auth screens */}
        <Stack.Screen 
          name="(auth)/login" 
          options={{ 
            title: 'Login',
            ...commonScreenOptions
          }} 
        />
        <Stack.Screen 
          name="(auth)/signup" 
          options={{ 
            title: 'Sign Up',
            ...commonScreenOptions
          }} 
        />
        
        {/* Other screens */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            ...commonScreenOptions
          }} 
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});