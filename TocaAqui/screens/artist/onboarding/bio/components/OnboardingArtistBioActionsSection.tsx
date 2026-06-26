import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  loading: boolean;
  onConcluir: () => void;
  onBack: () => void;
}

export default function OnboardingArtistBioActionsSection({ loading, onConcluir, onBack }: Props) {
  return (
    <>
      <TouchableOpacity
        style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
        onPress={onConcluir}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={DS.white} />
        ) : (
          <Text style={styles.btnPrimaryText}>CONCLUIR E IR PARA O APP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.7}>
        <FontAwesome5 name="arrow-left" size={12} color={DS.textSec} />
        <Text style={styles.btnBackText}>VOLTAR</Text>
      </TouchableOpacity>
    </>
  );
}
