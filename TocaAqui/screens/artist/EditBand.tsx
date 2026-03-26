import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors, genreColors, getGenreColor } from "@/utils/colors";
import { bandService } from "@/http/bandService";
import { artistService } from "@/http/artistService";
import { showApiError } from "@/utils/errorHandler";
import { useAuth } from "@/contexts/AuthContext";
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

interface EditBandForm {
  nome_banda: string;
  descricao: string;
}

const AVAILABLE_GENRES = Object.keys(genreColors);

export default function EditBand() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "EditBand">>();
  const { bandId } = route.params;
  const { signOut } = useAuth();

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const { control, handleSubmit, setValue } = useForm<EditBandForm>({
    mode: "onTouched",
  });

  useEffect(() => {
    loadBand();
  }, [bandId]);

  async function loadBand() {
    try {
      const band = await artistService.getBandById(bandId);
      setValue("nome_banda", band.nome_banda);
      setValue("descricao", band.descricao || "");
      setSelectedGenres(band.generos_musicais || []);
    } catch (error) {
      showApiError(error, "Erro ao carregar banda.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  async function onSubmit(data: EditBandForm) {
    if (selectedGenres.length === 0) return;

    setIsSubmitting(true);
    try {
      await bandService.updateBand(bandId, {
        nome_banda: data.nome_banda,
        descricao: data.descricao || undefined,
        generos_musicais: selectedGenres,
      });
      navigation.goBack();
    } catch (error) {
      showApiError(error, "Erro ao atualizar banda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Excluir banda",
      "Tem certeza que deseja excluir esta banda? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await bandService.deleteBand(bandId);
              navigation.goBack();
            } catch (error) {
              showApiError(error, "Erro ao excluir banda.");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("ArtistHome")}>
            <FontAwesome5 name="home" size={15} color={DS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>
          EDITAR <Text style={styles.headerTitleAccent}>BANDA</Text>
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={15} color="#E53E3E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <FontAwesome5 name="trash" size={17} color={DS.danger} />
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
              required: "Nome é obrigatório",
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
              <Text style={styles.submitText}>Salvar Alterações</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
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
  headerTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
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
});
