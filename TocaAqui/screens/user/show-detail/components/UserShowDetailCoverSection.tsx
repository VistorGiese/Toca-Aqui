import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  coverUrl: string | null;
  imageColor: string;
  genreColor: string;
  genre: string;
  title: string;
  onBack: () => void;
}

export default function UserShowDetailCoverSection({
  coverUrl,
  imageColor,
  genreColor,
  genre,
  title,
  onBack,
}: Props) {
  return (
    <View style={[styles.coverImage, { backgroundColor: imageColor }]}>
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.coverBackgroundImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.coverOverlay} />
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onBack}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <FontAwesome5 name="share-alt" size={16} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.coverInfo}>
        <View style={[styles.genreBadge, { backgroundColor: genreColor + "33" }]}>
          <Text style={[styles.genreBadgeText, { color: genreColor }]}>
            {genre.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.coverTitle}>{title}</Text>
      </View>
    </View>
  );
}
