import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  isEditing: boolean;
  saving: boolean;
  onPress: () => void;
}

export default function EstNewGigPublishButton({ isEditing, saving, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.publishBtn, saving && styles.publishBtnDisabled]}
      onPress={onPress}
      disabled={saving}
      activeOpacity={0.85}
    >
      {saving ? (
        <ActivityIndicator color={DS.textPrimary} size="small" />
      ) : (
        <Text style={styles.publishBtnText}>
          {isEditing ? "SALVAR ALTERAÇÕES" : "PUBLICAR DATA ▶"}
        </Text>
      )}
    </TouchableOpacity>
  );
}
