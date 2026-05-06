import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { avaliacaoService } from "@/http/avaliacaoService";

type Props = NativeStackScreenProps<UserStackParamList, "UserRateShow">;

const ARTIST_CHIPS = [
  "Som incrível",
  "Repertório ótimo",
  "Pontual",
  "Show fraco",
  "Atrasou",
];

const VENUE_CHIPS = [
  "Bem organizado",
  "Boa estrutura",
  "Lotado",
  "Mal organizado",
];

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <FontAwesome5
            name="star"
            size={28}
            color={i <= value ? "#FFD700" : "#333355"}
            solid={i <= value}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function UserRateShow({ route, navigation }: Props) {
  const { showId, showTitle, venueName } = route.params;
  const [artistRating, setArtistRating] = useState(0);
  const [venueRating, setVenueRating] = useState(0);
  const [artistChips, setArtistChips] = useState<string[]>([]);
  const [venueChips, setVenueChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_COMMENT = 280;

  function toggleChip(
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) {
    setList(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  }

  async function handlePublish() {
    if (artistRating === 0) {
      Alert.alert("Atenção", "Por favor avalie o artista");
      return;
    }
    try {
      setLoading(true);
      await avaliacaoService.criarAvaliacao({
        agendamento_id: showId,
        nota_artista: artistRating,
        nota_local: venueRating,
        comentario: comment || undefined,
        tags_artista: artistChips.length > 0 ? artistChips : undefined,
        tags_local: venueChips.length > 0 ? venueChips : undefined,
      });
      Alert.alert("Obrigado!", "Sua avaliação foi publicada.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a avaliação");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <FontAwesome5 name="times" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={12} color="#A78BFA" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.showImagePlaceholder}>
          <View style={styles.showImageOverlay}>
            <Text style={styles.howWasTitle}>Como foi?</Text>
            <Text style={styles.showName}>{showTitle}</Text>
            <Text style={styles.venueName}>{venueName}</Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <FontAwesome5 name="microphone" size={16} color="#A78BFA" />
            <Text style={styles.ratingTitle}>Avaliação do artista</Text>
          </View>
          <StarPicker value={artistRating} onChange={setArtistRating} />

          <View style={styles.chipsRow}>
            {ARTIST_CHIPS.map((chip) => {
              const isSelected = artistChips.includes(chip);
              const isDanger = chip === "Show fraco" || chip === "Atrasou";
              return (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.chip,
                    isSelected && (isDanger ? styles.chipDangerSelected : styles.chipSelected),
                  ]}
                  onPress={() => toggleChip(artistChips, setArtistChips, chip)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && (isDanger ? styles.chipTextDanger : styles.chipTextSelected),
                    ]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <FontAwesome5 name="building" size={16} color="#A78BFA" />
            <Text style={styles.ratingTitle}>E o espaço?</Text>
          </View>
          <StarPicker value={venueRating} onChange={setVenueRating} />

          <View style={styles.chipsRow}>
            {VENUE_CHIPS.map((chip) => {
              const isSelected = venueChips.includes(chip);
              const isDanger = chip === "Lotado" || chip === "Mal organizado";
              return (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.chip,
                    isSelected && (isDanger ? styles.chipDangerSelected : styles.chipSelected),
                  ]}
                  onPress={() => toggleChip(venueChips, setVenueChips, chip)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && (isDanger ? styles.chipTextDanger : styles.chipTextSelected),
                    ]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.commentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Conte mais sobre sua noite..."
            placeholderTextColor="#555577"
            value={comment}
            onChangeText={(t) => setComment(t.slice(0, MAX_COMMENT))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.commentCounter}>
            {comment.length}/{MAX_COMMENT}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.publishBtn, loading && { opacity: 0.6 }]}
          onPress={handlePublish}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.publishBtnText}>PUBLICAR AVALIAÇÃO</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipLink} onPress={handleSkip}>
          <Text style={styles.skipLinkText}>PULAR</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: { padding: 4 },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  showImagePlaceholder: {
    height: 160,
    backgroundColor: "#2D1B4E",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  showImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 20,
    justifyContent: "flex-end",
  },
  howWasTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  showName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#A78BFA",
    marginBottom: 2,
  },
  venueName: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  ratingSection: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginBottom: 16,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  ratingTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipSelected: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderColor: "#A78BFA",
  },
  chipDangerSelected: {
    backgroundColor: "rgba(255,107,107,0.12)",
    borderColor: "rgba(255,107,107,0.4)",
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#888",
  },
  chipTextSelected: { color: "#A78BFA" },
  chipTextDanger: { color: "#FF6B6B" },
  commentSection: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    marginBottom: 16,
  },
  commentInput: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#FFFFFF",
    minHeight: 90,
    lineHeight: 22,
  },
  commentCounter: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
    textAlign: "right",
    marginTop: 8,
  },
  publishBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  publishBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  skipLink: { alignItems: "center", paddingVertical: 8 },
  skipLinkText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#555577",
    letterSpacing: 1,
  },
});
