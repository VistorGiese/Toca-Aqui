import { colors } from "@/utils/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputContainerStyle?: ViewStyle;
  app?: boolean;
  error?: string;
  inputRef?: React.Ref<TextInput>;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  iconName,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  app = false,
  error,
  inputRef,
  rightElement,
  ...textInputProps
}: InputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          app && styles.inputContainerApp,
          inputContainerStyle,
          hasError && styles.inputContainerError,
        ]}
      >
        {iconName && (
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={colors.neutral}
            style={styles.icon}
          />
        )}
        <TextInput
          ref={inputRef}
          style={[styles.input, app && styles.inputApp, textInputProps.style]}
          placeholderTextColor={colors.placeholder}
          {...textInputProps}
        />
        {rightElement}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginBottom: 15,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "Montserrat-SemiBold",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.purpleBlack2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerApp: {
    backgroundColor: colors.purpleBlack2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
  },
  inputApp: {
    color: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    marginTop: 6,
    marginLeft: 4,
  },
});
