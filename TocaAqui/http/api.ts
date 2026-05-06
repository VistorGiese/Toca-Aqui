import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Use the REACT_NATIVE_PACKAGER_HOSTNAME env var set by Expo (works on any machine/network).
// Falls back to localhost for simulators. Override via EXPO_PUBLIC_API_URL if needed.
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${process.env.REACT_NATIVE_PACKAGER_HOSTNAME ?? "localhost"}:3000`;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Callback opcional para tratar respostas 401 (usado pelo AuthContext)
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
