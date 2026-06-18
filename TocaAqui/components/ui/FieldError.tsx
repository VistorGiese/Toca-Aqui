import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "@/utils/colors";

interface FieldErrorProps {
  message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.error,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 2,
  },
});
