import React from "react";
import { ActivityIndicator, View } from "react-native";
import { styles } from "../styles";

export default function EstEditProfileLoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#7B61FF" />
    </View>
  );
}
