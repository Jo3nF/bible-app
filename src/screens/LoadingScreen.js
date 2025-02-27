import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1507499739999-097f9693f797?q=80&w=2092' }} 
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.title}>BIBLIA</Text>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 3,
  },
});

export default LoadingScreen; 