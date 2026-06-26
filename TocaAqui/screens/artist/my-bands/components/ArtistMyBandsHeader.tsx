import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
  onCreate: () => void;
}

export default function ArtistMyBandsHeader({ onBack, onCreate }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        MINHAS <Text style={styles.headerTitleAccent}>BANDAS</Text>
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={onCreate}>
        <FontAwesome5 name="plus" size={16} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}
