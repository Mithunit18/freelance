import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

// Import with namespace to avoid module issues
import * as UserService from '../services/user';
type UserResponse = UserService.UserResponse;

export default function UserGreeting() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        console.log('UserGreeting: Starting fetch...');
        setLoading(true);
        setError(null);
        
        const data = await UserService.userService.getCurrentUser();
        
        if (mounted) {
          console.log('UserGreeting: Setting user data');
          setUser(data);
        }
      } catch (err: any) {
        console.error('UserGreeting: Error caught:', err.message);
        if (mounted) {
          setError(err.message || 'Failed to fetch user data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user?.name}! 👋</Text>
      <Text style={styles.message}>{user?.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#1976D2',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
  },
});