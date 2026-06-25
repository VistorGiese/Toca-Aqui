import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  unreadCount: number;
  onBack: () => void;
}

export default function EstNotificationsHeader({ unreadCount, onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <Text style={styles.headerSub}>{unreadCount} não lida(s)</Text>
        )}
      </View>
    </View>
  );
}
