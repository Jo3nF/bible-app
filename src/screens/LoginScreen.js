import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleContinueWithoutAccount = () => {
    // Navigate to the main screen without login
    navigation.navigate('Main');
  };

  const handleSignInOrRegister = () => {
    // Navigate to sign in/register screen
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a0072" />
      
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&h=200&fit=crop' }} 
          style={styles.logoBackground}
        />
        <View style={styles.crossContainer}>
          <Text style={styles.crossText}>✝</Text>
        </View>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerFirstLine}>De cristianos,</Text>
        <Text style={styles.headerSecondLine}>para cristianos.</Text>
      </View>

      <Text style={styles.subheader}>
        Desarrollado con pastores y estudiosos cristianos de todas las denominaciones
      </Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.starIcon}>★</Text>
        <Text style={styles.ratingNumber}>4.9</Text>
        <View style={styles.ratingDivider} />
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingText}>PROMEDIO DE LAS VALORACIONES</Text>
          <Text style={styles.downloadsText}>MÁS DE 300 MIL DESCARGAS</Text>
        </View>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleContinueWithoutAccount}
      >
        <Text style={styles.continueButtonText}>Continuar sin una cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleSignInOrRegister}
      >
        <Text style={styles.registerButtonText}>Regístrate o inicia sesión</Text>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          We respect your privacy and handle your sensitive information according to GDPR standards. By signing up, you agree to our
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerText}> and </Text>
          <Text style={styles.footerLink}>Terms of Use</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressIndicator} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a0072', // Deep purple
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 50,
    position: 'relative',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
  },
  crossContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 220, 220, 0.6)',
  },
  crossText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerFirstLine: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSecondLine: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#80ddd5', // Light blue/teal
  },
  subheader: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  starIcon: {
    color: '#ffc107', // Amber color for star
    fontSize: 30,
    marginRight: 8,
  },
  ratingNumber: {
    color: '#ffc107',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
  },
  ratingDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  downloadsText: {
    color: 'white',
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  continueButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#dd7aec', // Light purple
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#4a0072',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowIcon: {
    color: '#4a0072',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressIndicator: {
    width: '30%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default LoginScreen;
