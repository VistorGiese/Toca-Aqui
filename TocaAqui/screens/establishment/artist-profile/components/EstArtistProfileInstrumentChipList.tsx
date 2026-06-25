import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  items: string[];
}

export default function EstArtistProfileInstrumentChipList({ items }: Props) {
  if (items.length === 0) {
    return <Text style={styles.emptyHint}>Nenhum instrumento informado</Text>;
  }

  return (
    <View style={styles.chipsWrap}>
      {items.map((item) => {
        const color = getGenreColor(item.toUpperCase());
        return (
          <View
            key={item}
            style={[
              styles.instrumentChip,
              { borderColor: color + "88", backgroundColor: color + "18" },
            ]}
          >
            <FontAwesome5 name="music" size={10} color={color} style={{ marginRight: 6 }} />
            <Text style={[styles.instrumentChipText, { color }]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}
