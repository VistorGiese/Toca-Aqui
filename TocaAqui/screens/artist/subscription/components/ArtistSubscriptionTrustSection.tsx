import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, TRUST_ITEMS } from "../constants";
import { styles } from "../styles";

export default function ArtistSubscriptionTrustSection() {
  return (
    <View style={styles.trustRow}>
      {TRUST_ITEMS.map((item) => (
        <View key={item.label} style={styles.trustItem}>
          <View style={styles.trustIconCircle}>
            <FontAwesome5 name={item.icon as "lock"} size={16} color={DS.accent} />
          </View>
          <Text style={styles.trustLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
