import 'react-native-gesture-handler';

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { AuthProvider } from '../contexts/AuthContext';
import Navigate, { linking } from "../navigation/Navigate";
import { customFonts } from "../assets/fonts/fonts";

SplashScreen.preventAutoHideAsync();

// TODO: reativar logs na tela quando estabilizar carregamento dos perfis
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Algo deu errado</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message ?? "Erro desconhecido"}
          </Text>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleReset}>
            <Text style={errorStyles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090F",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    color: "#A0A0B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

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
    <ErrorBoundary>
      <NavigationIndependentTree>
        <NavigationContainer linking={linking}>
          <AuthProvider>
            <Navigate />
          </AuthProvider>
        </NavigationContainer>
      </NavigationIndependentTree>
    </ErrorBoundary>
  );
}
