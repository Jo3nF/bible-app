import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  resetPassword,
  subscribeToAuthChanges
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      await signIn(email, password);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: translateFirebaseError(error.code)
      };
    }
  };

  // Register function
  const register = async (email, password, displayName) => {
    try {
      await signUp(email, password, displayName);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: translateFirebaseError(error.code)
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: translateFirebaseError(error.code)
      };
    }
  };

  // Send password reset email
  const forgotPassword = async (email) => {
    try {
      await resetPassword(email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: translateFirebaseError(error.code)
      };
    }
  };

  // Translate Firebase error codes to user-friendly messages
  const translateFirebaseError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está en uso.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/user-not-found':
        return 'No hay usuarios con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet.';
      default:
        return 'Ocurrió un error. Por favor intenta de nuevo.';
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 