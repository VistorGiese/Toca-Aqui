import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  gigTitle: string;
  onBack: () => void;
  onNotifications: () => void;
}

export default function EstGigApplicationsHeader({
  gigTitle,
  onBack,
  onNotifications,
}: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {gigTitle}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onNotifications}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome5 name="bell" size={18} color={DS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
