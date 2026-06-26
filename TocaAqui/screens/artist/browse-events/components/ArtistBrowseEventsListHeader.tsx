import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  count: number;
}

export default function ArtistBrowseEventsListHeader({ count }: Props) {
  return (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Vagas em Destaque</Text>
      <Text style={styles.listCount}>{count} encontradas</Text>
    </View>
  );
}
