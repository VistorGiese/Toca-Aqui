import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EstRateArtist() {
  return (
    <View style={s.root}>
      <Text style={s.text}>Em breve</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F", justifyContent: "center", alignItems: "center" },
  text: { color: "#8888AA", fontFamily: "Montserrat-SemiBold", fontSize: 16 },
});
