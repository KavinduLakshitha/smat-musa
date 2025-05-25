import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Import our dedicated irrigation Firebase configuration
import { irrigationDb } from './firebaseConfig';

// Define types for our notifications
interface IrrigationNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  [key: string]: any; // Allow for additional properties
}

// Configure notification settings with the correct type definition
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log('Handling a notification!');
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Request permission for notifications (call this when your app first starts)
export const requestNotificationPermissions = async (): Promise<boolean> => {
  console.log('Requesting notification permissions...');
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('irrigation-notifications', {
      name: 'Irrigation Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2C5E1A',
    });
    console.log('Android notification channel created');
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log(`Notification permission status: ${status}`);
  return status === 'granted';
};

// Send a test notification to verify the system works
export const sendTestNotification = async (): Promise<boolean> => {
  console.log('Sending test notification...');
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from your irrigation system!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
    console.log('Test notification sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

// Listen for new notifications from Firebase
export const listenForNotifications = (
  onNewNotification: (notifications: IrrigationNotification[]) => void
) => {
  console.log('Setting up Firebase notification listener...');
  
  try {
    const notificationsRef = ref(irrigationDb, 'esp32/notifications');
    console.log('Notification path:', 'esp32/notifications');
    
    const notificationsQuery = query(
      notificationsRef,
      orderByChild('timestamp'),
      limitToLast(20)
    );

    console.log('Listening for Firebase notifications...');
    
    return onValue(notificationsQuery, (snapshot) => {
      console.log('Received a Firebase update!');
      
      const data = snapshot.val();
      if (!data) {
        console.log('No notification data found in Firebase');
        return;
      }

      console.log('Raw notification data:', JSON.stringify(data, null, 2));

      // Convert the data to an array
      const notificationsArray: IrrigationNotification[] = Object.entries(data).map(([id, notification]) => ({
        id,
        ...(notification as any), // Type assertion for Firebase data
      }));

      // Sort by timestamp (newest first)
      notificationsArray.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      console.log(`Processed ${notificationsArray.length} notifications`);
      
      // Send to callback function
      onNewNotification(notificationsArray);

      // Get the most recent notification for showing as a system notification
      const mostRecent = notificationsArray[0];
      
      // Only show if it's new (within the last minute)
      const timeDiff = Date.now() - new Date(mostRecent.timestamp).getTime();
      console.log(`Most recent notification time difference: ${timeDiff}ms`);
      
      if (timeDiff < 60000) { // Less than 1 minute old
        console.log('Showing system notification for recent update:', mostRecent.title);
        schedulePushNotification(mostRecent.title, mostRecent.message);
      }
    });
  } catch (error) {
    console.error('Error setting up notification listener:', error);
    Alert.alert('Error', 'Failed to connect to notification service');
    return null;
  }
};

// Schedule a push notification
async function schedulePushNotification(title: string, body: string): Promise<void> {
  console.log(`Scheduling notification - Title: ${title}, Body: ${body}`);
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
    console.log('System notification scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}