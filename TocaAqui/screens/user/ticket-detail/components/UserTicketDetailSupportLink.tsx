import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SUPPORT_LINK_TEXT } from "../constants";
import { styles } from "../styles";

export default function UserTicketDetailSupportLink() {
  return (
    <TouchableOpacity style={styles.supportLink}>
      <Text style={styles.supportLinkText}>{SUPPORT_LINK_TEXT}</Text>
      <FontAwesome5
        name="external-link-alt"
        size={11}
        color="#A78BFA"
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
}
