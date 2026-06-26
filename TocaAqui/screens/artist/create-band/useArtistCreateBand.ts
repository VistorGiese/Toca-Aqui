import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { artistService, ArtistSearchResult } from "@/http/artistService";
import { bandService } from "@/http/bandService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { showApiError } from "@/utils/errorHandler";
import { MEMBER_SEARCH_DEBOUNCE_MS, MEMBER_SEARCH_MIN_LENGTH } from "./constants";
import { CreateBandForm } from "./types";
import { filterSearchResults, toggleGenreSelection } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList, "CreateBand">;

export function useArtistCreateBand() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [generosError, setGenerosError] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ArtistSearchResult[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<ArtistSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { control, handleSubmit } = useForm<CreateBandForm>({
    mode: "onTouched",
  });

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goHome = useCallback(() => {
    navigation.navigate("ArtistTabs", { screen: "ArtistHome" } as never);
  }, [navigation]);

  const handleMemberSearch = useCallback(
    (text: string) => {
      setMemberSearch(text);
      setShowDropdown(false);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (text.length < MEMBER_SEARCH_MIN_LENGTH) {
        setSearchResults([]);
        return;
      }
      searchTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await artistService.searchArtistProfiles(text);
          const filtered = filterSearchResults(results, user?.perfilArtistaId, selectedMembers);
          setSearchResults(filtered);
          setShowDropdown(filtered.length > 0);
        } catch {
        } finally {
          setIsSearching(false);
        }
      }, MEMBER_SEARCH_DEBOUNCE_MS);
    },
    [selectedMembers, user?.perfilArtistaId]
  );

  const selectMember = useCallback((artist: ArtistSearchResult) => {
    setSelectedMembers((prev) => [...prev, artist]);
    setMemberSearch("");
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  const removeMember = useCallback((id: number) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setGenerosError("");
    setSelectedGenres((prev) => toggleGenreSelection(prev, genre));
  }, []);

  const onSubmit = useCallback(
    async (data: CreateBandForm) => {
      if (selectedGenres.length === 0) {
        setGenerosError("Selecione pelo menos um gênero");
        return;
      }
      setGenerosError("");

      setIsSubmitting(true);
      try {
        const newBand = await bandService.createBand({
          nome_banda: data.nome_banda,
          descricao: data.descricao || undefined,
          generos_musicais: selectedGenres,
          perfil_artista_id: user?.perfilArtistaId,
        });
        for (const member of selectedMembers) {
          try {
            await bandService.inviteMember(newBand.id, member.id);
          } catch {
          }
        }
        navigation.goBack();
      } catch (error) {
        showApiError(error, "Erro ao criar banda.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigation, selectedGenres, selectedMembers, user?.perfilArtistaId]
  );

  return {
    control,
    handleSubmit,
    isSubmitting,
    selectedGenres,
    generosError,
    memberSearch,
    searchResults,
    selectedMembers,
    isSearching,
    showDropdown,
    goBack,
    goHome,
    handleMemberSearch,
    selectMember,
    removeMember,
    toggleGenre,
    onSubmit,
  };
}
