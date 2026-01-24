import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import UserGreeting from './components/UserGreeting';

export default function App() {
  console.log('App component rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vision Match Mobile</Text>
      <Text style={styles.subtitle}>Your Mobile Experience</Text>
      
      <UserGreeting />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});