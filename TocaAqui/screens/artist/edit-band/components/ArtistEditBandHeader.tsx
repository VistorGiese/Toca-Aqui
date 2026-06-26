import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
  onHome: () => void;
  onDelete: () => void;
}

export default function ArtistEditBandHeader({ onBack, onHome, onDelete }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
          <FontAwesome5 name="home" size={15} color={DS.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>
        EDITAR <Text style={styles.headerTitleAccent}>BANDA</Text>
      </Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <FontAwesome5 name="trash" size={17} color={DS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
