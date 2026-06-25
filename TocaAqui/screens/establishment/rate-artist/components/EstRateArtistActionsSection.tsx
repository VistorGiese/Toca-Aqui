import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

interface Props {
  submitting: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}

export default function EstRateArtistActionsSection({ submitting, onSubmit, onSkip }: Props) {
  return (
    <>
      <TouchableOpacity
        style={[styles.btnEnviar, submitting && styles.disabled]}
        onPress={onSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnEnviarText}>ENVIAR AVALIAÇÃO</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPular} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.btnPularText}>PULAR</Text>
      </TouchableOpacity>
    </>
  );
}
