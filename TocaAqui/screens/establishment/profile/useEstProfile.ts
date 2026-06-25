import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import {
  establishmentService,
  EstablishmentProfile,
  EstablishmentProfileStats,
} from "@/http/establishmentService";
import { parsePressKit, resolveImageUrl } from "@/utils/adapters";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_PROFILE_NAME,
  DEFAULT_TIPO_LABEL,
  TIPO_LABEL,
} from "./constants";
import {
  EMPTY_DISPLAY,
  EMPTY_PROFILE_STATS,
  EstProfileDisplayData,
} from "./types";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

function buildDisplayData(profile: EstablishmentProfile | null): EstProfileDisplayData {
  if (!profile) return EMPTY_DISPLAY;

  const cidade = profile.cidade ?? profile.Address?.cidade ?? "";
  const estado = profile.estado ?? profile.Address?.estado ?? "";
  const addr = profile.Address;
  const localizacao = [addr?.rua, addr?.numero, addr?.bairro, cidade, estado]
    .filter(Boolean)
    .join(" · ");

  const generos = profile.generos_musicais
    ? profile.generos_musicais.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  const fotosUrls = parsePressKit(profile.fotos)
    .map((f) => resolveImageUrl(f))
    .filter((u): u is string => Boolean(u));

  const abertura = profile.horario_abertura?.substring(0, 5) ?? "--:--";
  const fechamento = profile.horario_fechamento?.substring(0, 5) ?? "--:--";

  return {
    nome: profile.nome_estabelecimento ?? DEFAULT_PROFILE_NAME,
    tipoLabel: TIPO_LABEL[profile.tipo_estabelecimento ?? ""] ?? DEFAULT_TIPO_LABEL,
    localizacao,
    telefone: profile.telefone_contato ?? "",
    descricao: profile.descricao ?? "",
    generos,
    fotosUrls,
    coverUrl: fotosUrls[0] ?? null,
    isActive: Boolean(profile.esta_ativo),
    abertura,
    fechamento,
    hasSchedule: abertura !== "--:--" || fechamento !== "--:--",
  };
}

export function useEstProfile() {
  const navigation = useNavigation<NavProp>();
  const { signOut, user } = useAuth();

  const [profile, setProfile] = useState<EstablishmentProfile | null>(null);
  const [stats, setStats] = useState<EstablishmentProfileStats>(EMPTY_PROFILE_STATS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await establishmentService.getMyEstablishmentProfile();
      setProfile(p);
      const profileStats = await establishmentService.getEstablishmentProfileStats(
        p.id,
        user?.id
      );
      setStats(profileStats);
    } catch {
      setProfile(null);
      setStats(EMPTY_PROFILE_STATS);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const display = useMemo(() => buildDisplayData(profile), [profile]);

  const goToEdit = useCallback(() => {
    navigation.navigate("EstEditProfile");
  }, [navigation]);

  const goToUserProfile = useCallback(() => {
    const rootNav = (navigation as { getParent?: () => { getParent?: () => { navigate: (name: string) => void } } })
      .getParent?.()
      ?.getParent?.();
    rootNav?.navigate("UserNavigator");
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => { await signOut(); } },
    ]);
  }, [signOut]);

  return {
    loading,
    display,
    stats,
    goToEdit,
    goToUserProfile,
    handleSignOut,
  };
}
