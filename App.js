// App.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenExpo from 'expo-splash-screen';
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import { NotoSerif_400Regular } from '@expo-google-fonts/noto-serif';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PreferencesScreen from './src/screens/dump/PreferencesScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import RootNavigator from './src/navigation/RootNavigator';
import { useOnboarding } from './src/hooks/useOnboarding';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { localStorage } from './src/services/localStorage';

SplashScreenExpo.preventAutoHideAsync().catch(() => { });

// Full app flow, in order:
//   native splash -> custom splash -> onboarding (once, ever)
//     -> [not authenticated] Register -> Login   (AuthContext decides which)
//     -> [authenticated, first time] pick calendar preference (once, ever)
//     -> Calendar (main app)
function AppFlow() {
  const theme = useTheme();
  const { status } = useAuthContext(); // 'loading' | 'register' | 'login' | 'authenticated'
  const { hasOnboarded, completeOnboarding } = useOnboarding();

  const [showSplash, setShowSplash] = useState(true);
  const [hasChosenPreference, setHasChosenPreference] = useState(null); // null = still checking

  usePushNotifications({
    onNotificationTap: (data) => {
      // TODO: deep-link into the relevant event/date using a nav ref.
      console.log('Notification tapped:', data);
    },
  });

  // Only relevant once the user is authenticated — re-checked every time
  // `status` flips to 'authenticated' (e.g. right after login).
  useEffect(() => {
    if (status !== 'authenticated') return;
    localStorage.hasChosenPreference().then(setHasChosenPreference);
  }, [status]);

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  if (hasOnboarded === null || status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: theme.color.background }} />;
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  // Not logged in yet: AuthNavigator internally shows Register first, then
  // Login (see AuthContext bootstrap — presence of a stored ref_code alone
  // decides which one, with no token this is always one of these two).
  if (status !== 'authenticated') {
    return <AuthNavigator />;
  }

  // Logged in, but first time ever -> make them pick a calendar preference
  // before landing on the calendar itself.
  if (hasChosenPreference === null) {
    return <View style={{ flex: 1, backgroundColor: theme.color.background }} />;
  }

  if (!hasChosenPreference) {
    return (
      <PreferencesScreen
        onDone={async () => {
          await localStorage.setPreferenceChosen(true);
          setHasChosenPreference(true);
        }}
      />
    );
  }

  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    NotoSerif_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreenExpo.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <StatusBar barStyle="dark-content" />
            <AppFlow />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
