export default {
  name: 'Ask Madha',
  slug: 'ask-madha',
  version: '1.0.0',
  orientation: 'portrait' as const,
  icon: './assets/icon.png',
  scheme: 'askmadha',
  userInterfaceStyle: 'automatic' as const,
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.askmadha.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundImage: './assets/android-icon-background.png',
      backgroundColor: '#2C1810',
    },
    package: 'com.askmadha.app',
    softwareKeyboardLayoutMode: 'resize',
    permissions: [
      'VIBRATE',
    ],
  },
  plugins: [
    'expo-font',
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: false,
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#2C1810',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '9c91bf73-b1c0-40dc-b482-cf05967175cc',
    },
    // Set via env (EXPO_PUBLIC_API_BASE_URL). Falls back to the dev deployment.
    // Local: .env  ·  Builds: eas.json build profile `env`.
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      'https://ask-madha-website-git-dev-deepflock.vercel.app',
  },
};
