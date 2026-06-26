import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  cacheFormatted: string;
}

export default function CacheSection({ cacheFormatted }: Props) {
  return (
    <View style={styles.cacheCard}>
      <Text style={styles.cacheLabel}>CACHÊ ACORDADO</Text>
      <Text style={styles.cacheValue}>R$ {cacheFormatted}</Text>
    </View>
  );
}
