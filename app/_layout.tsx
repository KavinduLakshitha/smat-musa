import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { TextStyle } from 'react-native';
// Import our ThemeProvider and useAppColorScheme
import { ThemeProvider, useAppColorScheme } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';

// Import notification handling
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '@/services/Notifications';
import { router } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';

// Import our irrigation Firebase auth
import { irrigationAuth } from '@/services/firebaseConfig';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  
  // Notification listeners
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  
  // Set up notifications and Firebase auth
  useEffect(() => {
    // Initialize Firebase authentication
    const setupAuth = async () => {
      try {
        await signInAnonymously(irrigationAuth);
        console.log('Anonymous authentication successful for irrigation notifications');
      } catch (error) {
        console.error('Anonymous authentication failed:', error);
      }
    };

    // Set up notifications
    const setupNotifications = async () => {
      // Request permissions
      await requestNotificationPermissions();
      
      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        notification => {
          console.log('Notification received in foreground:', notification);
        }
      );
      
      // This listener is fired whenever a user taps on or interacts with a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        response => {
          console.log('Notification response received:', response);
          // Navigate to notifications screen when a notification is tapped
          router.push('/(tabs)/notifications');
        }
      );
    };
    
    if (loaded) {
      setupAuth();
      setupNotifications();
    }
    
    return () => {
      // Clean up the notification listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [loaded]);

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