import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ActionButtonVariant } from "../types";
import { actionButtonStyles, styles } from "../styles";

interface Props {
  variant: ActionButtonVariant;
  label: string;
  icon?: React.ComponentProps<typeof FontAwesome5>["name"];
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export default function EstContractPreviewActionButton({
  variant,
  label,
  icon,
  busy = false,
  disabled = false,
  onPress,
}: Props) {
  const isDisabled = disabled || busy;
  const showSpinner = busy && variant !== "secondary";

  return (
    <TouchableOpacity
      style={[...actionButtonStyles[variant], isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={variant === "secondary" ? 0.8 : 0.85}
    >
      {showSpinner ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          {icon && variant !== "secondary" ? (
            <FontAwesome5
              name={icon}
              size={14}
              color={variant === "danger" ? DS.danger : "#fff"}
            />
          ) : null}
          <Text
            style={
              variant === "danger"
                ? styles.actionBtnTextDanger
                : variant === "secondary"
                  ? styles.actionBtnTextSecondary
                  : styles.actionBtnText
            }
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
