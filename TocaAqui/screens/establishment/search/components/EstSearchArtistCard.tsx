import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ArtistPublicProfile } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";
import { DS } from "../constants";
import { formatArtistType, formatCacheLabel } from "../utils";
import { styles } from "../styles";

interface Props {
  artist: ArtistPublicProfile;
  onPress: (artist: ArtistPublicProfile) => void;
}

export default function EstSearchArtistCard({ artist, onPress }: Props) {
  const genre = artist.generos?.[0] ?? "";
  const genreColor = getGenreColor(genre.toUpperCase());
  const photoUrl = artist.foto_perfil ?? artist.foto_url;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.artistImg}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.artistImgPhoto} resizeMode="cover" />
          ) : (
            <FontAwesome5 name="user" size={28} color={DS.accent} />
          )}
        </View>
        {genre ? (
          <View
            style={[
              styles.genreBadge,
              { backgroundColor: `${genreColor}22`, borderColor: genreColor },
            ]}
          >
            <Text style={[styles.genreBadgeText, { color: genreColor }]}>{genre.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.artistName}>{artist.nome_artistico ?? artist.nome ?? "Artista"}</Text>
      <Text style={styles.artistType}>{formatArtistType(artist.tipo_atuacao ?? artist.tipo)}</Text>

      <View style={styles.cacheRow}>
        <Text style={styles.cacheLabel}>CACHÊ</Text>
        <Text style={styles.cacheValue}>
          {formatCacheLabel(artist.cache_minimo, artist.cache_maximo ?? artist.cache_medio)}
        </Text>
      </View>

      <View style={styles.ratingRow}>
        <FontAwesome5 name="star" size={12} color="#F39C12" solid />
        <Text style={styles.ratingText}>
          {artist.nota_media != null ? artist.nota_media.toFixed(1) : "—"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => onPress(artist)}
        activeOpacity={0.85}
      >
        <Text style={styles.profileBtnText}>VER PERFIL</Text>
      </TouchableOpacity>
    </View>
  );
}
