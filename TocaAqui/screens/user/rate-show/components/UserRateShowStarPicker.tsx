import React from "react";
import { View, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { StarPickerProps } from "../types";

export default function UserRateShowStarPicker({
  value,
  onChange,
  onClearError,
}: StarPickerProps) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          onPress={() => {
            onClearError?.();
            onChange(i);
          }}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name="star"
            size={28}
            color={i <= value ? DS.starActive : DS.starInactive}
            solid={i <= value}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
