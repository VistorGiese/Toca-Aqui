import React from "react";
import { Text, View } from "react-native";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  items: string[];
}

export default function EstArtistProfileChipList({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.chipsWrap}>
      {items.map((item) => {
        const color = getGenreColor(item);
        return (
          <View
            key={item}
            style={[styles.chip, { backgroundColor: color + "22", borderColor: color + "55" }]}
          >
            <Text style={[styles.chipText, { color }]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}
