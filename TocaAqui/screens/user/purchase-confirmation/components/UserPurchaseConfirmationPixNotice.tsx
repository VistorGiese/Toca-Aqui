import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { PIX_NOTICE_TEXT } from "../constants";
import { styles } from "../styles";

export default function UserPurchaseConfirmationPixNotice() {
  return (
    <View style={styles.pixNotice}>
      <FontAwesome5 name="info-circle" size={18} color="#F39C12" style={{ marginTop: 2 }} />
      <Text style={styles.pixNoticeText}>{PIX_NOTICE_TEXT}</Text>
    </View>
  );
}
