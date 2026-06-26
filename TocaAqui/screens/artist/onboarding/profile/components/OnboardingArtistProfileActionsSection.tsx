import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function OnboardingArtistProfileActionsSection({ onContinue, onBack }: Props) {
  return (
    <>
      <TouchableOpacity style={styles.btnPrimary} onPress={onContinue} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>CONTINUAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.7}>
        <FontAwesome5 name="arrow-left" size={12} color={DS.textSec} />
        <Text style={styles.btnBackText}>VOLTAR</Text>
      </TouchableOpacity>
    </>
  );
}
