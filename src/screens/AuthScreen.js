import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { login, register, forgotPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, name);
      }

      if (result.success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        Alert.alert(
          'Recuperación de contraseña', 
          'Se ha enviado un correo a tu dirección para recuperar tu contraseña'
        );
        setShowForgotPassword(false);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };

  const handleBackPress = () => {
    if (showForgotPassword) {
      setShowForgotPassword(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a0072" />
      
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Icon name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>
            {showForgotPassword 
              ? 'Recuperar contraseña'
              : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Text>
          
          {!isLogin && !showForgotPassword && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          {!showForgotPassword && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          )}
          
          {isLogin && !showForgotPassword && (
            <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={showForgotPassword ? handleForgotPassword : handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#4a0072" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {showForgotPassword 
                  ? 'Enviar instrucciones' 
                  : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </Text>
            )}
          </TouchableOpacity>
          
          {!showForgotPassword && (
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={toggleAuthMode}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin 
                  ? '¿No tienes una cuenta? Regístrate' 
                  : '¿Ya tienes una cuenta? Inicia sesión'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a0072',
  },
  backButton: {
    padding: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#dd7aec',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#dd7aec',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#4a0072',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    alignSelf: 'center',
  },
  toggleButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});

export default AuthScreen; 