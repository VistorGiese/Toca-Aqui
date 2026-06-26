import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { formatCurrency } from "../utils";
import { styles } from "../styles";

interface Props {
  cacheMinimo?: number;
  cacheMaximo?: number;
}

export default function ArtistProfileCacheSection({ cacheMinimo, cacheMaximo }: Props) {
  if (cacheMinimo == null && cacheMaximo == null) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Faixa de cachê</Text>
      <View style={styles.cacheRow}>
        <View style={styles.cacheCard}>
          <Text style={styles.cacheLabel}>MÍNIMO</Text>
          <Text style={styles.cacheValue}>{formatCurrency(cacheMinimo)}</Text>
        </View>
        <FontAwesome5 name="long-arrow-alt-right" size={14} color={DS.textMuted} />
        <View style={styles.cacheCard}>
          <Text style={styles.cacheLabel}>MÁXIMO</Text>
          <Text style={styles.cacheValue}>{formatCurrency(cacheMaximo)}</Text>
        </View>
      </View>
    </View>
  );
}
