import React from "react";
import { Image, View } from "react-native";
import FundInitialPage from "@/components/Allcomponents/FundInitialPage";
import { styles } from "../styles";

export default function InitialHeroSection() {
  return (
    <>
      <View style={styles.fund}>
        <FundInitialPage />
      </View>
      <Image
        source={require("../../../assets/images/Initial/ShadowPurple.png")}
        style={styles.shadowImage}
        resizeMode="contain"
      />
    </>
  );
}
