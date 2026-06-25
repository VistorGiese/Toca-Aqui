import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof FontAwesome5>["name"];
  iconColor?: string;
  valueStyle?: object;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
}

export default function EstShowDetailInfoCard({
  label,
  value,
  icon,
  iconColor,
  valueStyle,
  containerStyle,
  children,
}: Props) {
  return (
    <View style={[styles.infoCard, containerStyle]}>
      {icon ? <FontAwesome5 name={icon} size={13} color={iconColor} /> : null}
      <Text style={styles.infoLabel}>{label}</Text>
      {children ?? <Text style={[styles.infoValueSm, valueStyle]}>{value}</Text>}
    </View>
  );
}
