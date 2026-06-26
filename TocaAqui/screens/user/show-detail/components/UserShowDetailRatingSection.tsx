import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  rating: number;
  total: number;
}

export default function UserShowDetailRatingSection({ rating, total }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avaliações</Text>
      <View style={styles.ratingRow}>
        <FontAwesome5 name="star" size={16} color={DS.star} solid />
        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
        <Text style={styles.ratingCount}>({total} avaliações)</Text>
      </View>
    </View>
  );
}
