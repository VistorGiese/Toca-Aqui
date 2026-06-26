import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

interface Props {
  saving: boolean;
  onPress: () => void;
}

export default function ArtistEditProfileSaveButton({ saving, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
      onPress={onPress}
      disabled={saving}
      activeOpacity={0.85}
    >
      {saving ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.saveBtnText}>SALVAR ALTERAÇÕES</Text>
      )}
    </TouchableOpacity>
  );
}
