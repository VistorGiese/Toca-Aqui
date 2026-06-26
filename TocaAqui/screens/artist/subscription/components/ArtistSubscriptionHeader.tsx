import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistSubscriptionHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <FontAwesome5 name="bars" size={18} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.brandName}>TOCA AQUI</Text>
      <View style={styles.avatarSmall}>
        <FontAwesome5 name="user" size={14} color={DS.accent} />
      </View>
    </View>
  );
}
