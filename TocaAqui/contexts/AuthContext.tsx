import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "@/types";
import { userService } from "@/http/userService";
import api, { setOnUnauthorized } from "@/http/api";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signInWithToken: (tokenValue: string, userData: { id: number; nome_completo: string; email: string; role: string; perfil_artista_id?: number }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningOut = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  // Register 401 callback so api interceptor can trigger logout
  useEffect(() => {
    setOnUnauthorized(() => {
      if (!isSigningOut.current) {
        clearAuth();
      }
    });
  }, [clearAuth]);

  const loadStoredData = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setToken(storedToken);

        try {
          const profile = await userService.getProfile();
          const u = profile.user;

          // Usa o role retornado pelo backend; se ausente, busca o salvo no storage
          let role = u.role as UserRole | undefined;
          if (!role) {
            const storedRole = await AsyncStorage.getItem("userRole");
            role = (storedRole as UserRole) || undefined;
          }

          setUser({
            id: u.id,
            nome_completo: u.nome_completo,
            email: u.email,
            role: role as UserRole,
            perfilArtistaId: u.artist_profiles?.[0]?.id,
          });

          if (u.establishment_profiles && u.establishment_profiles.length > 0) {
            await AsyncStorage.setItem(
              "estabelecimentoId",
              String(u.establishment_profiles[0].id)
            );
          }
        } catch {
          await AsyncStorage.multiRemove(["token", "estabelecimentoId", "userRole"]);
          delete api.defaults.headers.common["Authorization"];
          setToken(null);
        }
      }
    } catch {
      // storage read error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const signIn = useCallback(async (email: string, senha: string) => {
    const response = await userService.login(email, senha);
    setToken(response.token);
    const u = response.user;

    // Persiste o role para restauração de sessão futura
    await AsyncStorage.setItem("userRole", u.role);

    try {
      const profile = await userService.getProfile();
      setUser({
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        role: u.role as UserRole,
        perfilArtistaId: profile.user.artist_profiles?.[0]?.id,
      });
      if (
        profile.user.establishment_profiles &&
        profile.user.establishment_profiles.length > 0
      ) {
        await AsyncStorage.setItem(
          "estabelecimentoId",
          String(profile.user.establishment_profiles[0].id)
        );
      }
    } catch {
      setUser({
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        role: u.role as UserRole,
      });
    }
  }, []);

  const signInWithToken = useCallback(async (tokenValue: string, userData: { id: number; nome_completo: string; email: string; role: string; perfil_artista_id?: number }) => {
    await AsyncStorage.setItem("token", tokenValue);
    await AsyncStorage.setItem("userRole", userData.role);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
    setToken(tokenValue);
    setUser({
      id: userData.id,
      nome_completo: userData.nome_completo,
      email: userData.email,
      role: userData.role as UserRole,
      perfilArtistaId: userData.perfil_artista_id,
    });
  }, []);

  const signOut = useCallback(async () => {
    isSigningOut.current = true;
    await userService.logout();
    await AsyncStorage.removeItem("userRole");
    clearAuth();
    isSigningOut.current = false;
  }, [clearAuth]);

  const updateUser = useCallback(async () => {
    try {
      const profile = await userService.getProfile();
      const u = profile.user;
      setUser({
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        role: u.role as UserRole,
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithToken,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
