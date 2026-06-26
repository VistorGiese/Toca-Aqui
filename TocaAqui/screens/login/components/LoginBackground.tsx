import React from "react";
import { Image, StatusBar, View } from "react-native";
import { colors } from "@/utils/colors";
import { styles } from "../styles";

export default function LoginBackground() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Image
        source={require("../../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />
      <View style={styles.glow} pointerEvents="none" />
    </>
  );
}
