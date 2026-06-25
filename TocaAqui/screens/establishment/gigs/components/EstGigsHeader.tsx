import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  headerName: string;
  onNotifications: () => void;
}

export default function EstGigsHeader({ headerName, onNotifications }: Props) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="store" size={14} color={DS.accent} />
        </View>
        <Text style={styles.headerName}>{headerName}</Text>
        <TouchableOpacity
          onPress={onNotifications}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5 name="bell" size={20} color={DS.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Minhas Vagas</Text>
    </>
  );
}
