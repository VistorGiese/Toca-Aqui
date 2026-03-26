import 'react-native-gesture-handler';

import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AccountProvider } from '../contexts/AccountFromContexto';
import { AuthProvider } from '../contexts/AuthContext';
import Navigate from "../navigation/Navigate";
import { customFonts } from "../assets/fonts/fonts";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AccountProvider>
        <Navigate />
      </AccountProvider>
    </AuthProvider>
  );
}
