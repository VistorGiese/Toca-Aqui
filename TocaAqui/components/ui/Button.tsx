import { colors } from "@/utils/colors";
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function Button({
  onPress,
  style,
  textStyle,
  children,
  disabled,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabledButton]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {children ? children : <Text style={[styles.text, textStyle]}>{""}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.purplePrimary,
    borderRadius: 14,
  },
  text: {
    color: colors.white,
    fontSize: 24,
    fontFamily: "Poppins-ExtraBold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
