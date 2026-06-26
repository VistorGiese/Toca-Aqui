import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

type Props = {
  onStart: () => void;
};

export default function UserOnboardingLocationFooter({ onStart }: Props) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.8}>
        <Text style={styles.startBtnText}>COMEÇAR A DESCOBRIR →</Text>
      </TouchableOpacity>
    </View>
  );
}
