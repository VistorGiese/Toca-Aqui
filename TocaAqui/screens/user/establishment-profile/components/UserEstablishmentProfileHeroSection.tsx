import React from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { UserEstablishmentProfileDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: UserEstablishmentProfileDisplay;
  showFavorite: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

export default function UserEstablishmentProfileHeroSection({
  display,
  showFavorite,
  isFavorite,
  favoriteLoading,
  onBack,
  onToggleFavorite,
}: Props) {
  return (
    <View
      style={[
        styles.headerImage,
        display.coverUrl ? undefined : { backgroundColor: display.genreColor + "88" },
      ]}
    >
      {display.coverUrl ? (
        <Image source={{ uri: display.coverUrl }} style={styles.coverImage} />
      ) : null}
      <View style={styles.headerOverlay} />

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={16} color={DS.textPrimary} />
      </TouchableOpacity>

      {showFavorite ? (
        <TouchableOpacity
          style={styles.favoriteHeaderBtn}
          onPress={onToggleFavorite}
          disabled={favoriteLoading}
          activeOpacity={0.85}
        >
          {favoriteLoading ? (
            <ActivityIndicator size="small" color={DS.accent} />
          ) : (
            <FontAwesome5
              name="heart"
              size={18}
              color={isFavorite ? DS.accent : DS.textPrimary}
              solid={isFavorite}
            />
          )}
        </TouchableOpacity>
      ) : null}

      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: display.genreColor + "66" }]}>
          <FontAwesome5 name="store" size={28} color="rgba(255,255,255,0.85)" />
        </View>
      </View>
    </View>
  );
}
