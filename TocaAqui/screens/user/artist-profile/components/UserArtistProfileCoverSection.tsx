import React from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  coverUrl: string | null;
  fotoUrl: string | null;
  showFavorite: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

export default function UserArtistProfileCoverSection({
  coverUrl,
  fotoUrl,
  showFavorite,
  isFavorite,
  favoriteLoading,
  onBack,
  onToggleFavorite,
}: Props) {
  const avatarUrl = fotoUrl ?? coverUrl;

  return (
    <View style={styles.coverContainer}>
      {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" /> : null}
      <View style={styles.coverOverlay} />

      <View style={styles.coverActions}>
        <TouchableOpacity style={styles.coverActionBtn} onPress={onBack}>
          <FontAwesome5 name="arrow-left" size={16} color={DS.textPrimary} />
        </TouchableOpacity>

        {showFavorite ? (
          <TouchableOpacity
            style={styles.coverActionBtn}
            onPress={onToggleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={DS.accent} />
            ) : (
              <FontAwesome5
                name="heart"
                size={16}
                color={isFavorite ? DS.accent : DS.textPrimary}
                solid={isFavorite}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.coverActionBtn} />
        )}
      </View>

      <View style={styles.coverAvatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.coverAvatarImage} resizeMode="cover" />
        ) : (
          <FontAwesome5 name="user" size={32} color={DS.accent} />
        )}
      </View>
    </View>
  );
}
