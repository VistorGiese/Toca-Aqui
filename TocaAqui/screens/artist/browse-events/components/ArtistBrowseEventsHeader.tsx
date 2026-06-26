import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onNotifications: () => void;
}

export default function ArtistBrowseEventsHeader({ onNotifications }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarSmall}>
        <FontAwesome5 name="user" size={14} color={DS.accent} />
      </View>
      <Text style={styles.brandName}>TOCA AQUI</Text>
      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onNotifications}
      >
        <FontAwesome5 name="bell" size={18} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}
