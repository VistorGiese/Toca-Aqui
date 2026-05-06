import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors, genreColors, getGenreColor } from "@/utils/colors";
import { bandService } from "@/http/bandService";
import { artistService, ArtistSearchResult } from "@/http/artistService";
import { useAuth } from "@/contexts/AuthContext";
import { showApiError } from "@/utils/errorHandler";
import Input from "../../components/Allcomponents/Input";
import Button from "../../components/Allcomponents/Button";

const { height } = Dimensions.get("window");

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CreateBandForm {
  nome_banda: string;
  descricao: string;
}

const AVAILABLE_GENRES = Object.keys(genreColors);

export default function CreateBand() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Member search state
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ArtistSearchResult[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<ArtistSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  function handleMemberSearch(text: string) {
    setMemberSearch(text);
    setShowDropdown(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await artistService.searchArtistProfiles(text);
        const filtered = results.filter(
          (r) => r.id !== user?.perfilArtistaId &&
                 !selectedMembers.some((m) => m.id === r.id)
        );
        setSearchResults(filtered);
        setShowDropdown(filtered.length > 0);
      } catch { } finally { setIsSearching(false); }
    }, 350);
  }

  function selectMember(artist: ArtistSearchResult) {
    setSelectedMembers((prev) => [...prev, artist]);
    setMemberSearch("");
    setSearchResults([]);
    setShowDropdown(false);
  }

  function removeMember(id: number) {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const { control, handleSubmit } = useForm<CreateBandForm>({
    mode: "onTouched",
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  async function onSubmit(data: CreateBandForm) {
    if (selectedGenres.length === 0) {
      return;
    }

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
        } catch { }
      }
      navigation.goBack();
    } catch (error) {
      showApiError(error, "Erro ao criar banda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          CRIAR <Text style={styles.headerTitleAccent}>BANDA</Text>
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("ArtistHome")}>
            <FontAwesome5 name="home" size={15} color={DS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={15} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="nome_banda"
            rules={{
              required: "Nome da banda é obrigatório",
              maxLength: { value: 100, message: "Máximo 100 caracteres" },
            }}
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { error },
            }) => (
              <Input
                inputRef={ref}
                label="Nome da banda"
                iconName="music"
                placeholder="Ex: Os Incríveis"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={error?.message}
                app
              />
            )}
          />

          <Controller
            control={control}
            name="descricao"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Descrição"
                iconName="text"
                placeholder="Fale sobre a banda..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={4}
                app
                inputContainerStyle={{
                  height: undefined,
                  minHeight: 110,
                  alignItems: "flex-start",
                  paddingVertical: 12,
                }}
                style={{ height: undefined, minHeight: 82, textAlignVertical: "top", color: "#fff" }}
              />
            )}
          />

          {/* Member search */}
          <View style={styles.memberSection}>
            <Text style={styles.fieldLabel}>Membros da banda</Text>
            <View style={styles.searchBox}>
              <FontAwesome5 name="search" size={14} color={DS.textSec} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar artista pelo nome..."
                placeholderTextColor={DS.textDis}
                value={memberSearch}
                onChangeText={handleMemberSearch}
              />
              {isSearching && <ActivityIndicator size="small" color={DS.accent} />}
            </View>
            {showDropdown && (
              <View style={styles.dropdown}>
                {searchResults.map((artist) => (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.dropdownItem}
                    onPress={() => selectMember(artist)}
                  >
                    <FontAwesome5 name="user" size={13} color={DS.textSec} />
                    <Text style={styles.dropdownText}>{artist.nome_artistico}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedMembers.length > 0 && (
              <View style={styles.chipsRow}>
                {selectedMembers.map((member) => (
                  <View key={member.id} style={styles.memberChip}>
                    <Text style={styles.memberChipText}>{member.nome_artistico}</Text>
                    <TouchableOpacity onPress={() => removeMember(member.id)}>
                      <FontAwesome5 name="times" size={11} color={DS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Genre label */}
          <View style={styles.genreLabelRow}>
            <Text style={styles.genreLabel}>Gêneros musicais</Text>
            {selectedGenres.length === 0 && (
              <Text style={styles.genreRequired}>*Selecione ao menos um</Text>
            )}
          </View>

          <View style={styles.genreContainer}>
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              const genreColor = getGenreColor(genre);
              return (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    isSelected
                      ? { backgroundColor: genreColor, borderColor: genreColor }
                      : styles.genreChipUnselected,
                  ]}
                  onPress={() => toggleGenre(genre)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.genreChipText,
                      isSelected ? styles.genreChipTextSelected : styles.genreChipTextUnselected,
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || selectedGenres.length === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.purpleDark} />
            ) : (
              <Text style={styles.submitText}>Criar Banda</Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 20,
    backgroundColor: DS.bg,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  homeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(229,62,62,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: "center",
  },
  genreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: 10,
    gap: 8,
  },
  genreLabel: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
  },
  genreRequired: {
    color: DS.danger,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
    width: "100%",
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  genreChipUnselected: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  genreChipText: {
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  genreChipTextSelected: {
    color: DS.white,
  },
  genreChipTextUnselected: {
    color: DS.textSec,
  },
  submitButton: {
    width: "100%",
    height: 52,
    marginTop: 8,
  },
  submitText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: colors.purpleDark,
  },
  memberSection: {
    width: "100%",
    marginBottom: 20,
  },
  fieldLabel: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.2)",
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  dropdownText: {
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(108,92,231,0.2)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.4)",
  },
  memberChipText: {
    color: DS.white,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
  },
});
