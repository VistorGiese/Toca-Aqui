import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ArtistApplyConfirmationActionsSection({
  loading,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <>
      <TouchableOpacity
        style={styles.btnEnviar}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={DS.white} />
        ) : (
          <Text style={styles.btnEnviarText}>ENVIAR CANDIDATURA</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancel} activeOpacity={0.7}>
        <Text style={styles.btnCancelarText}>CANCELAR</Text>
      </TouchableOpacity>
    </>
  );
}
