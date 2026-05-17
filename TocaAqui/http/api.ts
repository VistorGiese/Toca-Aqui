import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

/**
 * Retorna o host da máquina de dev detectado pelo Expo Go em tempo de execução.
 * Funciona com `expo start --lan`. Retorna null com --tunnel ou em produção.
 */
function getExpoDevHost(): string | null {
  if (!__DEV__) return null;
  const hostUri: string | undefined =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost;
  if (!hostUri) return null;
  // hostUri é "IP:8081" — pega só o IP
  return hostUri.split(":")[0] ?? null;
}

/**
 * Resolve a baseURL da API na seguinte ordem:
 * 1. EXPO_PUBLIC_API_URL (override via .env.development.local) — controle total
 * 2. Em dev, host detectado pelo Expo + porta 3000 — sem precisar mexer no .env todo dia
 * 3. Fallback "http://localhost:3000" — emulador iOS / caso nenhum host seja detectado
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;

  if (__DEV__) {
    const expoHost = getExpoDevHost();
    if (expoHost) return `http://${expoHost}:3000`;
    return "http://localhost:3000";
  }

  // Produção: EXPO_PUBLIC_API_URL é obrigatória
  throw new Error("EXPO_PUBLIC_API_URL não definida para produção.");
}

const api = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

api.interceptors.request.use(async (config) => {
  config.baseURL = getApiBaseUrl();

  if (__DEV__ && config.url?.includes("/usuarios/registro")) {
    console.log("[API] POST registro →", `${config.baseURL}${config.url}`);
  }

  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    return Promise.reject(error);
  }
);

export default api;
