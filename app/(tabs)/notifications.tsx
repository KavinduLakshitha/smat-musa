import { SafeAreaView, StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeContext } from '@/components/ThemeContext';

const notifications = [
  { id: '1', title: 'New message', time: '5 min ago', read: false },
  { id: '2', title: 'Friend request', time: '1 hour ago', read: false },
  { id: '3', title: 'System update', time: '2 hours ago', read: false },
  { id: '4', title: 'Your post was liked', time: 'Yesterday', read: true },
  { id: '5', title: 'Weekly summary', time: '2 days ago', read: true },
];

export default function NotificationsScreen() {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';

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

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>           
            
            <FlatList
                data={notifications}
                style={styles.list}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={[
                    styles.notificationItem,
                    item.read ? dynamicStyles.read : dynamicStyles.unread,
                ]}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={[styles.notificationTime, dynamicStyles.notificationTime]}>
                    {item.time}
                    </Text>
                </View>
                )}
                ListEmptyComponent={
                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                    No notifications to display
                </Text>
                }
                contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
