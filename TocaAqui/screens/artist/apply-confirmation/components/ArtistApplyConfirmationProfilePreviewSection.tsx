import React from "react";
import { Text, View } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { ApplyProfilePreview } from "../types";

interface Props {
  preview: ApplyProfilePreview;
}

export default function ArtistApplyConfirmationProfilePreviewSection({ preview }: Props) {
  const roundedRating = Math.round(preview.mediaArtista);

  return (
    <>
      <Text style={styles.cardSectionTitle}>COMO O CONTRATANTE VERÁ SEU PERFIL</Text>
      <View style={styles.profilePreviewCard}>
        <View style={styles.previewGenreBadge}>
          <Text style={styles.previewGenreText}>ARTISTA</Text>
        </View>

        <View style={styles.previewAvatarRow}>
          <View style={styles.previewAvatar}>
            <FontAwesome5 name="user" size={28} color={DS.accent} />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>{preview.nome}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome
                  key={i}
                  name={i < roundedRating ? "star" : "star-o"}
                  size={12}
                  color={i < roundedRating ? DS.gold : DS.textDis}
                />
              ))}
              <Text style={styles.reviewsCount}>
                ({preview.mediaArtista > 0 ? preview.mediaArtista.toFixed(1) : "Novo"})
              </Text>
            </View>
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
              <Text style={styles.previewLocation}> {preview.cidadeArtista}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
