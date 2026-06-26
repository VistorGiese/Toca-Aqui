import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  items: string[];
  icon?: string;
  color?: string;
}

export default function UserArtistProfileChipList({
  items,
  icon = "check",
  color = "#6C5CE7",
}: Props) {
  return (
    <View style={styles.chipsWrap}>
      {items.map((item) => (
        <View
          key={item}
          style={[styles.instrumentChip, { borderColor: color + "88", backgroundColor: color + "18" }]}
        >
          <FontAwesome5 name={icon as "check"} size={10} color={color} />
          <Text style={[styles.instrumentChipText, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
