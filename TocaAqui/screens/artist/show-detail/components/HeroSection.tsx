import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  title: string;
}

export default function HeroSection({ title }: Props) {
  return (
    <View style={styles.heroImage}>
      <FontAwesome5 name="music" size={40} color={DS.textDis} />
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>{title}</Text>
      </View>
    </View>
  );
}
