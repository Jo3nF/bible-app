import { Redirect } from 'expo-router';
import App from '../app'; // Note the capital A

export default function Index() {
  // This redirects the Expo Router to use your custom App component
  return <App />;
} 