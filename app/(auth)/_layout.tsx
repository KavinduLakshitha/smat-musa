import { Stack } from 'expo-router';
import { useAppColorScheme } from '@/components/ThemeContext';
import { TextStyle } from 'react-native';

export default function AuthLayout() {
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
    <Stack screenOptions={commonScreenOptions}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
}