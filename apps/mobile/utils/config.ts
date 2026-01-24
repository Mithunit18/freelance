import Constants from 'expo-constants';

// Safely get the API URL with multiple fallback attempts
function getApiUrl(): string {
  try {
    // Try expoConfig first (Expo SDK 46+)
    if (Constants.expoConfig?.extra?.apiUrl) {
      return Constants.expoConfig.extra.apiUrl;
    }
    
    // Try manifest (older Expo versions)
    if (Constants.manifest?.extra?.apiUrl) {
      return Constants.manifest.extra.apiUrl;
    }
    
    // Try manifest2 (EAS builds)
    if (Constants.manifest2?.extra?.expoClient?.extra?.apiUrl) {
      return Constants.manifest2.extra.expoClient.extra.apiUrl;
    }
  } catch (error) {
    console.warn('Error reading config:', error);
  }
  
  // Default fallback
  return 'http://localhost:8002';
}

export const config = {
  apiUrl: getApiUrl(),
};