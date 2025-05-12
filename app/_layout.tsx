import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TextStyle } from 'react-native';
// Import our ThemeProvider and useAppColorScheme
import { ThemeProvider, useAppColorScheme } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';

export { ErrorBoundary } from 'expo-router';

// Updated for Expo Router v5
export const unstable_settings = {
  // Initial route is now just the root tabs
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
      <LanguageProvider>
        <RootLayoutNav />
      </LanguageProvider>
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
        {/* Main app tabs - keep as is */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Auth screens - these should be groups now, not direct routes */}
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
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