import React from "react";
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type Props = {
  title?: string;
  onBack?: () => void;
};

export default function DevelopmentPlaceholder({ title = "Agenda", onBack }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <FontAwesome5 name="arrow-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.backSpacer} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 24,
    alignItems: "flex-start",
  },
  backSpacer: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
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
