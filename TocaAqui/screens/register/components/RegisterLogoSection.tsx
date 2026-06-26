import React from "react";
import { Image, Text, View } from "react-native";
import { styles } from "../styles";

export default function RegisterLogoSection() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("../../../assets/adaptive-icon.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logoSubtitle}>Sua jornada musical começa aqui.</Text>
    </View>
  );
}
