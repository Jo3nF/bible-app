// Import Firebase web SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Analytics import may need special setup for React Native
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoUESloAwjHPfAB_KdcurGgfn36f1puF8",
  authDomain: "bible-app-cdb6c.firebaseapp.com",
  projectId: "bible-app-cdb6c",
  storageBucket: "bible-app-cdb6c.firebasestorage.app",
  messagingSenderId: "1020192819342",
  appId: "1:1020192819342:web:d78282112ef4e39f79e1df",
  measurementId: "G-M18DYGG4KF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  
  export { app, auth };