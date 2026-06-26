import React from "react";
import { Image, Text, View } from "react-native";
import { styles } from "../styles";

export default function LoginLogoSection() {
  return (
    <>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../../assets/adaptive-icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headingWrap}>
        <Text style={styles.heading}>Bem-vindo de volta</Text>
      </View>
    </>
  );
}
