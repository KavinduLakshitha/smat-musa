import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, FlatList, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeContext } from '@/components/ThemeContext';
import { requestNotificationPermissions, listenForNotifications } from '@/services/Notifications';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export default function NotificationsScreen() {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const dynamicStyles = {
    unread: {
      backgroundColor: isDark ? '#1a365d' : '#e6f7ff',
    },
    read: {
      backgroundColor: isDark ? '#2d3748' : '#f0f0f0',
    },
    notificationTime: {
      color: isDark ? '#a0aec0' : '#666',
    },
    emptyText: {
      color: isDark ? '#a0aec0' : '#666',
    },
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    
    // Check if it's today
    if (notificationDate.toDateString() === now.toDateString()) {
      const hours = notificationDate.getHours();
      const minutes = notificationDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `Today, ${formattedHours}:${minutes} ${ampm}`;
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (notificationDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise format as date
    return notificationDate.toLocaleDateString();
  };

  // Set up notification permissions and listeners
  useEffect(() => {
    setupNotifications();
    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const setupNotifications = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
      }
      
      // Listen for Firebase notifications
      listenForNotifications((notificationsData) => {
        const formattedNotifications = notificationsData.map((notification: any) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
          read: false
        }));
        setNotifications(formattedNotifications);
        setLoading(false);
        setRefreshing(false);
      });
      
      // Handle notification taps when app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        notification => {
          console.log('Notification received in foreground!', notification);
        }
      );
      
      // Handle notification taps when app is backgrounded
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        response => {
          console.log('Notification tapped!', response);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setupNotifications();
  };

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(item =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(item => ({ ...item, read: true }))
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} onPress={markAllAsRead}>
              <Text style={styles.headerButtonText}>Mark all read</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={notifications}
          style={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => markAsRead(item.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.notificationItem,
                item.read ? dynamicStyles.read : dynamicStyles.unread,
              ]}>
                {!item.read && <RNView style={styles.unreadDot} />}
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={[styles.notificationTime, dynamicStyles.notificationTime]}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                  Loading notifications...
                </Text>
              ) : (
                <RNView style={styles.emptyContent}>
                  <Ionicons name="notifications-off-outline" size={50} color={isDark ? '#a0aec0' : '#666'} />
                  <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                    No notifications yet
                  </Text>
                </RNView>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2C5E1A']}
              tintColor={isDark ? '#a0aec0' : '#666'}
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerButton: {
    marginRight: 16,
  },
  headerButtonText: {
    color: '#2C5E1A',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    width: '100%',
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingVertical: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C5E1A',
  },
  notificationTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});