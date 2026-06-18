import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type Props = {
  title?: string;
};

export default function DevelopmentPlaceholder({ title = "Agenda" }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.content}>
        <FontAwesome5 name="tools" size={40} color="#555577" />
        <Text style={styles.message}>Tela ainda em desenvolvimento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09090F",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  message: {
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: "#A0A0B8",
    textAlign: "center",
  },
});
