import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, HEADER_BACK_LABEL } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function ArtistEventDetailHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
        <Text style={styles.backText}>{HEADER_BACK_LABEL}</Text>
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome5 name="share-alt" size={16} color={DS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
