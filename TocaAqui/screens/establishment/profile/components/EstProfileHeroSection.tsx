import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  coverUrl: string | null;
  onEdit: () => void;
}

export default function EstProfileHeroSection({ coverUrl, onEdit }: Props) {
  return (
    <View style={styles.heroContainer}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <FontAwesome5 name="store" size={40} color={DS.textMuted} />
        </View>
      )}
      <View style={styles.heroGradient} />
      <View style={styles.heroActions}>
        <View style={styles.heroActionsSpacer} />
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <FontAwesome5 name="edit" size={16} color={DS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
