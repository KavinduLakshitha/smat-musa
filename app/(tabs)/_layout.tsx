import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> 
        }} 
      />      
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> 
        }} 
      />
    </Tabs>
  );
}