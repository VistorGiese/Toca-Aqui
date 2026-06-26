import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function UserCheckoutHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <FontAwesome5 name="arrow-left" size={16} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Checkout</Text>
      <FontAwesome5 name="shopping-cart" size={18} color={DS.accent} />
    </View>
  );
}
