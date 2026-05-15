import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

function getExpoRuntimeHost(): string | null {
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost ??
    null;

  if (!hostUri || typeof hostUri !== "string") return null;
  return hostUri.split(":")[0] ?? null;
}

const envBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoRuntimeHost = getExpoRuntimeHost();
const packagerHost = process.env.REACT_NATIVE_PACKAGER_HOSTNAME ?? "localhost";

const baseURL = __DEV__
  ? `http://${expoRuntimeHost ?? packagerHost}:3000`
  : envBaseURL || `http://${packagerHost}:3000`;

if (__DEV__) {
  console.log("[API] baseURL →", baseURL, {
    expoRuntimeHost,
    packagerHost,
    envBaseURL: envBaseURL ?? "(vazio)",
  });
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
