import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { setHasSeenIntro } from '../utils/storage';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
  const handleGetStarted = async () => {
    // Save that user has seen the intro
    await setHasSeenIntro();
    
    // Navigate to main app
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074' }} 
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>
          
          <Text style={styles.subtitle}>God's Word in Your Hands</Text>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Explore the Bible, find inspiration, and grow in your faith journey with daily readings and powerful search tools.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default IntroScreen; 