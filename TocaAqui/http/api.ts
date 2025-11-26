import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

//adicionar ip do seu computador, ao cancelar o projeto e rodar denovo o IP troca sozinho
const baseURL = "http://192.168.3.24:3000";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
