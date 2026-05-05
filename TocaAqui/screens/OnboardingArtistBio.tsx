import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import api from "@/http/api";
import * as ImagePicker from "expo-image-picker";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  gold: "#F6C90E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
  pink: "#E91E8C",
};

interface Estado { sigla: string; nome: string; }
interface Cidade { id: number; nome: string; }
type PickerMode = "estado" | "cidade" | null;

type NavProp = NativeStackNavigationProp<RootStackParamList, "OnboardingArtistBio">;
type RouteType = RouteProp<RootStackParamList, "OnboardingArtistBio">;

export default function OnboardingArtistBio() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const params = route.params;

  // Localização via IBGE
  const [estado, setEstado] = useState<Estado | null>(null);
  const [cidade, setCidade] = useState<Cidade | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [searchText, setSearchText] = useState("");

  // Bio e links
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Press kit (fotos)
  const [pressKit, setPressKit] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoadingEstados(true);
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json())
      .then((data: Array<{ sigla: string; nome: string }>) => {
        setEstados(data.map((e) => ({ sigla: e.sigla, nome: e.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar os estados."))
      .finally(() => setLoadingEstados(false));
  }, []);

  useEffect(() => {
    if (!estado) { setCidades([]); setCidade(null); return; }
    setLoadingCidades(true);
    setCidade(null);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.sigla}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((data: Array<{ id: number; nome: string }>) => {
        setCidades(data.map((c) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => Alert.alert("Erro", "Não foi possível carregar as cidades."))
      .finally(() => setLoadingCidades(false));
  }, [estado]);

  const openPicker = (mode: PickerMode) => {
    setSearchText("");
    setPickerMode(mode);
  };

  const filteredEstados = estados.filter(
    (e) =>
      e.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      e.sigla.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCidades = cidades.filter((c) =>
    c.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const addLink = () => {
    if (novoLink.trim()) {
      setLinks((prev) => [...prev, novoLink.trim()]);
      setNovoLink("");
      setShowLinkInput(false);
    }
  };

  const handleAddPressKit = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para adicionar fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - pressKit.length,
    });
    if (!result.canceled) {
      const novas = result.assets.map((a) => a.uri);
      setPressKit((prev) => [...prev, ...novas].slice(0, 5));
    }
  };

  const handleConcluir = async () => {
    if (!estado) {
      Alert.alert("Atenção", "Selecione o estado.");
      return;
    }
    if (!cidade) {
      Alert.alert("Atenção", "Selecione a cidade.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/usuarios/perfil-artista", {
        nome_artistico: params.nome,
        tipo_atuacao: params.tipo,
        generos: params.generos,
        cache_minimo: params.cacheMin ? parseFloat(params.cacheMin.replace(",", ".")) : undefined,
        cache_maximo: params.cacheMax ? parseFloat(params.cacheMax.replace(",", ".")) : undefined,
        tem_estrutura_som: params.temEstrutura,
        estrutura_som: params.estrutura,
        cidade: cidade.nome,
        estado: estado.sigla,
        biografia: bio,
        links_sociais: links,
      });

      const profileId = response.data?.profile?.id;

      // Upload foto de perfil se selecionada no passo 1
      if (params.fotoUri && profileId) {
        const filename = params.fotoUri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";
        const formData = new FormData();
        if (Platform.OS === "web") {
          const blob = await fetch(params.fotoUri).then((r) => r.blob());
          formData.append("imagem", blob, filename);
        } else {
          formData.append("imagem", { uri: params.fotoUri, name: filename, type } as any);
        }
        await api.patch(`/usuarios/perfil-artista/${profileId}/foto`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Upload press kit se houver fotos selecionadas
      if (pressKit.length > 0 && profileId) {
        const formData = new FormData();
        for (let i = 0; i < pressKit.length; i++) {
          const uri = pressKit[i];
          const filename = uri.split("/").pop() || `press_kit_${i}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";
          if (Platform.OS === "web") {
            const blob = await fetch(uri).then((r) => r.blob());
            formData.append("imagens", blob, filename);
          } else {
            formData.append("imagens", { uri, name: filename, type } as any);
          }
        }
        await api.patch(`/usuarios/perfil-artista/${profileId}/press-kit`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
    } catch (err: any) {
      console.error("[OnboardingArtistBio] Erro:", JSON.stringify(err?.response?.data, null, 2));
      const data = err?.response?.data;
      const msg =
        data?.message ||
        data?.error ||
        data?.detalhes?.[0]?.mensagem ||
        data?.errors?.[0]?.message ||
        "Não foi possível salvar o perfil.";
      const detalhe = data?.detalhes?.map((d: any) => `${d.campo}: ${d.mensagem}`).join("\n") || "";
      Alert.alert("Erro", detalhe ? `${msg}\n\n${detalhe}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: "75%" }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* -------- ETAPA 3 -------- */}
        <Text style={[styles.etapaLabel, { color: DS.cyan }]}>ETAPA 3 DE 4</Text>
        <Text style={styles.titleLarge}>Onde a mágica acontece?</Text>
        <Text style={styles.subtitle}>
          Informe sua cidade base para aparecer nos resultados de busca da sua região.
        </Text>

        {/* Estado */}
        <Text style={styles.fieldLabel}>ESTADO</Text>
        <TouchableOpacity
          style={[styles.selector, !estado && styles.selectorEmpty]}
          onPress={() => openPicker("estado")}
          activeOpacity={0.75}
        >
          <Text style={estado ? styles.selectorText : styles.selectorPlaceholder}>
            {estado ? `${estado.nome} (${estado.sigla})` : "Selecione o estado"}
          </Text>
          {loadingEstados ? (
            <ActivityIndicator size="small" color={DS.accent} />
          ) : (
            <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
          )}
        </TouchableOpacity>

        {/* Cidade */}
        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>CIDADE</Text>
        <TouchableOpacity
          style={[
            styles.selector,
            (!estado || !cidade) && styles.selectorEmpty,
            !estado && styles.selectorDisabled,
          ]}
          onPress={() => estado && openPicker("cidade")}
          activeOpacity={estado ? 0.75 : 1}
        >
          <Text style={cidade ? styles.selectorText : styles.selectorPlaceholder}>
            {!estado
              ? "Selecione o estado primeiro"
              : cidade
              ? cidade.nome
              : "Selecione a cidade"}
          </Text>
          {loadingCidades ? (
            <ActivityIndicator size="small" color={DS.accent} />
          ) : (
            <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
          )}
        </TouchableOpacity>

        {/* Card Mapa visual */}
        <View style={styles.mapCard}>
          <MaterialCommunityIcons name="map-marker" size={32} color={DS.accent} />
          <Text style={styles.mapLabel}>LOCALIZAÇÃO BASE</Text>
          <Text style={styles.mapSub}>
            {cidade && estado ? `${cidade.nome}, ${estado.sigla}` : "Preencha os campos acima"}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* -------- ETAPA 4 -------- */}
        <View style={styles.progressBgInline}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
        <Text style={[styles.etapaLabel, { color: DS.pink, marginTop: 16 }]}>ETAPA 4 DE 4</Text>
        <Text style={styles.titleLarge}>Sua vitrine editorial.</Text>
        <Text style={styles.subtitle}>
          Apresente-se para os estabelecimentos. Seja autêntico e direto.
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>SOBRE MIM / NÓS</Text>
          <Text style={styles.charCount}>{bio.length} / 1000</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Conte sua história, estilo musical, experiências..."
          placeholderTextColor={DS.textDis}
          multiline
          numberOfLines={6}
          maxLength={1000}
          value={bio}
          onChangeText={setBio}
          textAlignVertical="top"
        />

        <Text style={styles.fieldLabel}>LINKS & MÍDIA</Text>

        {links.map((l, i) => (
          <View key={i} style={styles.linkChip}>
            <FontAwesome5 name="link" size={12} color={DS.accentLight} />
            <Text style={styles.linkText} numberOfLines={1}>{l}</Text>
            <TouchableOpacity onPress={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}>
              <FontAwesome5 name="times" size={12} color={DS.danger} />
            </TouchableOpacity>
          </View>
        ))}

        {showLinkInput && (
          <View style={styles.linkInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="https://..."
              placeholderTextColor={DS.textDis}
              value={novoLink}
              onChangeText={setNovoLink}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity style={styles.btnAddSmall} onPress={addLink}>
              <Text style={styles.btnAddSmallText}>ADD</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => setShowLinkInput(!showLinkInput)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="link" size={13} color={DS.accentLight} />
          <Text style={styles.btnOutlineText}>ADD SOCIAL LINK</Text>
        </TouchableOpacity>

        {/* Press Kit — fotos */}
        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>PRESS KIT / FOTOS</Text>
        {pressKit.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {pressKit.map((uri, i) => (
              <View key={i} style={styles.pressKitThumb}>
                <Image source={{ uri }} style={styles.pressKitImage} />
                <TouchableOpacity
                  style={styles.pressKitRemove}
                  onPress={() => setPressKit((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <FontAwesome5 name="times" size={10} color={DS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        {pressKit.length < 5 && (
          <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8} onPress={handleAddPressKit}>
            <FontAwesome5 name="cloud-upload-alt" size={24} color={DS.textSec} />
            <Text style={styles.uploadLabel}>
              {pressKit.length === 0 ? "ADICIONAR FOTOS" : "ADICIONAR MAIS FOTOS"}
            </Text>
            <Text style={styles.uploadSub}>PNG, JPG — máx 5 fotos ({pressKit.length}/5)</Text>
          </TouchableOpacity>
        )}

        {/* Botão Concluir */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={handleConcluir}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DS.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>CONCLUIR E IR PARA O APP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="arrow-left" size={12} color={DS.textSec} />
          <Text style={styles.btnBackText}>VOLTAR</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal picker de estado/cidade */}
      <Modal
        visible={pickerMode !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerMode === "estado" ? "Selecione o Estado" : "Selecione a Cidade"}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerMode(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <FontAwesome5 name="times" size={18} color={DS.textSec} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <FontAwesome5 name="search" size={13} color={DS.textSec} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={pickerMode === "estado" ? "Buscar estado..." : "Buscar cidade..."}
                placeholderTextColor={DS.textSec}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>

            {pickerMode === "estado" ? (
              <FlatList
                data={filteredEstados}
                keyExtractor={(item) => item.sigla}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      estado?.sigla === item.sigla && styles.pickerItemActive,
                    ]}
                    onPress={() => { setEstado(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerItemSigla}>{item.sigla}</Text>
                    <Text
                      style={[
                        styles.pickerItemNome,
                        estado?.sigla === item.sigla && { color: DS.accent },
                      ]}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <FlatList
                data={filteredCidades}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      cidade?.id === item.id && styles.pickerItemActive,
                    ]}
                    onPress={() => { setCidade(item); setPickerMode(null); }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerItemNome,
                        cidade?.id === item.id && { color: DS.accent },
                      ]}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  progressBg: {
    width: "100%",
    height: 4,
    backgroundColor: DS.bgCard,
  },
  progressBgInline: {
    width: "100%",
    height: 4,
    backgroundColor: DS.bgCard,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: DS.accent,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
  },
  etapaLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleLarge: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    marginBottom: 8,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    marginBottom: 20,
    lineHeight: 20,
  },
  fieldLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: DS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  // Seletores IBGE
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  selectorEmpty: {
    borderColor: DS.bgSurface,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
    flex: 1,
  },
  selectorPlaceholder: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
    flex: 1,
  },
  mapCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    marginTop: 16,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  mapLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textSec,
    letterSpacing: 2,
    marginTop: 8,
  },
  mapSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 28,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
    marginTop: 16,
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  linkInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  btnAddSmall: {
    backgroundColor: DS.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  btnAddSmallText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: DS.white,
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DS.accentLight,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 10,
    gap: 8,
  },
  btnOutlineText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.accentLight,
    letterSpacing: 1,
  },
  // Press kit
  pressKitThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    position: "relative",
  },
  pressKitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  pressKitRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: DS.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: DS.bgSurface,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    marginTop: 4,
    gap: 8,
    backgroundColor: DS.bgCard,
  },
  uploadLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.textSec,
    letterSpacing: 1,
  },
  uploadSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  btnPrimary: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  btnPrimaryText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
  btnBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  btnBackText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.textSec,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: DS.bgInput,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: DS.bgSurface,
  },
  modalTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 16,
    color: DS.white,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DS.bgSurface,
    gap: 12,
  },
  pickerItemActive: {
    backgroundColor: DS.accent + "22",
  },
  pickerItemSigla: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: DS.accent,
    width: 30,
  },
  pickerItemNome: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.white,
    flex: 1,
  },
});
