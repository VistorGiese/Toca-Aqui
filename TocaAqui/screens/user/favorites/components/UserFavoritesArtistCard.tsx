import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FavoriteArtistItem } from "@/http/favoriteService";
import { resolveImageUrl } from "@/utils/adapters";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  artista: FavoriteArtistItem;
  onPress: (artistId: number) => void;
  onRemove: (artistId: number) => void;
};

export default function UserFavoritesArtistCard({ artista, onPress, onRemove }: Props) {
  const genre = artista.generos?.[0] || "—";
  const fotoUrl = resolveImageUrl(artista.foto_perfil);

  return (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => onPress(artista.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.artistAvatar, { backgroundColor: DS.artistAvatarBg }]}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.artistAvatarImage} resizeMode="cover" />
        ) : (
          <FontAwesome5 name="microphone" size={22} color="rgba(255,255,255,0.4)" />
        )}
        <TouchableOpacity
          style={styles.artistHeartOverlay}
          onPress={() => onRemove(artista.id)}
        >
          <FontAwesome5 name="heart" size={10} color={DS.accent} solid />
        </TouchableOpacity>
      </View>
      <Text style={styles.artistName} numberOfLines={1}>
        {artista.nome_artistico}
      </Text>
      <Text style={styles.artistGenre}>{genre}</Text>
    </TouchableOpacity>
  );
}
