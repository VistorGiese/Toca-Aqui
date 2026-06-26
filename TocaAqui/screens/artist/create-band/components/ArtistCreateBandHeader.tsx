import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

export default function ArtistCreateBandHeader({ onBack, onHome }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        CRIAR <Text style={styles.headerTitleAccent}>BANDA</Text>
      </Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
          <FontAwesome5 name="home" size={15} color={DS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
