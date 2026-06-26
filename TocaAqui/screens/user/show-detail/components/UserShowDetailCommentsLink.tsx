import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onPress: () => void;
}

export default function UserShowDetailCommentsLink({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.commentsLink} onPress={onPress}>
      <FontAwesome5 name="comment-alt" size={14} color={DS.accent} />
      <Text style={styles.commentsLinkText}>Ver comentários do show</Text>
      <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
    </TouchableOpacity>
  );
}
