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
          style={[
            styles.input,
            app && styles.inputApp,
            textInputProps.style,
            {
              color:
                textInputProps.value && textInputProps.value.length > 0
                  ? "#fff"
                  : colors.neutral,
            },
          ]}
          placeholderTextColor={colors.neutral}
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
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.purple,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: "#e53e3e",
  },
  inputContainerApp: {
    backgroundColor: colors.purpleBlack2,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#fff",
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
  },
  inputApp: {
    color: colors.neutral,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    marginTop: 4,
    marginLeft: 5,
  },
});
