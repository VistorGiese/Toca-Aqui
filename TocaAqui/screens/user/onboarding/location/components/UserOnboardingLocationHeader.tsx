import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { headerStyles } from "../styles";

type Props = {
  onSkip: () => void;
};

export default function UserOnboardingLocationHeader({ onSkip }: Props) {
  return (
    <View style={headerStyles.header}>
      <View style={headerStyles.headerLeft} />
      <Text style={headerStyles.headerBrand}>TOCA AQUI</Text>
      <TouchableOpacity onPress={onSkip} style={headerStyles.skipBtn}>
        <Text style={headerStyles.skipText}>PULAR</Text>
      </TouchableOpacity>
    </View>
  );
}
