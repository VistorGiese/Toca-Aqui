import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole, MinhasPaginas } from "@/types";
import { userService } from "@/http/userService";
import api, { setOnUnauthorized } from "@/http/api";

interface AuthContextData {
  user: User | null;
  token: string | null;
  paginas: MinhasPaginas | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signInWithToken: (tokenValue: string, userData: { id: number; nome_completo: string; email: string; role: string; perfil_artista_id?: number }) => Promise<MinhasPaginas | null>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
  refreshPaginas: () => Promise<MinhasPaginas | null>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

async function syncEstablishmentIdFromProfile(profile: Awaited<ReturnType<typeof userService.getProfile>>) {
  const u = profile.user;
  if (u.establishment_profiles && u.establishment_profiles.length > 0) {
    await AsyncStorage.setItem("estabelecimentoId", String(u.establishment_profiles[0].id));
  } else if (u.establishment_memberships && u.establishment_memberships.length > 0) {
    await AsyncStorage.setItem(
      "estabelecimentoId",
      String(u.establishment_memberships[0].estabelecimento.id)
    );
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [paginas, setPaginas] = useState<MinhasPaginas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningOut = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setPaginas(null);
  }, []);

  const refreshPaginas = useCallback(async (): Promise<MinhasPaginas | null> => {
    try {
      const p = await userService.getMinhasPaginas();
      setPaginas(p);
      if (p.pagina_estabelecimento) {
        await AsyncStorage.setItem("estabelecimentoId", String(p.pagina_estabelecimento.id));
      }
      return p;
    } catch {
      return null;
    }
  }, []);

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
          const storedRole = await AsyncStorage.getItem("userRole");
          setUser({
            id: u.id,
            nome_completo: u.nome_completo,
            email: u.email,
            role: ((u as { role?: string }).role ?? storedRole ?? "common_user") as UserRole,
            perfilArtistaId: u.artist_profiles?.[0]?.id,
          });
          await syncEstablishmentIdFromProfile(profile);
          await refreshPaginas();
        } catch {
          await AsyncStorage.multiRemove(["token", "estabelecimentoId", "userRole"]);
          delete api.defaults.headers.common["Authorization"];
          setToken(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshPaginas]);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const signIn = useCallback(async (email: string, senha: string) => {
    const response = await userService.login(email, senha);
    setToken(response.token);
    const u = response.user;

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
      await syncEstablishmentIdFromProfile(profile);
    } catch {
      setUser({
        id: u.id,
        nome_completo: u.nome_completo,
        email: u.email,
        role: u.role as UserRole,
      });
    }
    await refreshPaginas();
  }, [refreshPaginas]);

  const signInWithToken = useCallback(async (tokenValue: string, userData: { id: number; nome_completo: string; email: string; role: string; perfil_artista_id?: number }) => {
    await AsyncStorage.setItem("token", tokenValue);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
    setToken(tokenValue);
    await AsyncStorage.setItem("userRole", userData.role);

    let perfilArtistaId: number | undefined = userData.perfil_artista_id;
    try {
      const profile = await userService.getProfile();
      perfilArtistaId = profile.user.artist_profiles?.[0]?.id;
      await syncEstablishmentIdFromProfile(profile);
    } catch { /* ignore */ }

    setUser({
      id: userData.id,
      nome_completo: userData.nome_completo,
      email: userData.email,
      role: userData.role as UserRole,
      perfilArtistaId,
    });

    return refreshPaginas();
  }, [refreshPaginas]);

  const signOut = useCallback(async () => {
    isSigningOut.current = true;
    await userService.logout();
    await AsyncStorage.removeItem("userRole");
    setPaginas(null);
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
        perfilArtistaId: u.artist_profiles?.[0]?.id,
      });
      await refreshPaginas();
    } catch {
      // ignore
    }
  }, [refreshPaginas]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        paginas,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithToken,
        signOut,
        updateUser,
        refreshPaginas,
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
