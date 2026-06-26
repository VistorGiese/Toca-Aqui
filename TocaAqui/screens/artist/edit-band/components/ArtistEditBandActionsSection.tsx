import React from "react";
import { ActivityIndicator, Text } from "react-native";
import Button from "@/components/ui/Button";
import { colors } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  isSubmitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}

export default function ArtistEditBandActionsSection({
  isSubmitting,
  disabled,
  onSubmit,
}: Props) {
  return (
    <Button style={styles.submitButton} onPress={onSubmit} disabled={disabled}>
      {isSubmitting ? (
        <ActivityIndicator color={colors.purpleDark} />
      ) : (
        <Text style={styles.submitText}>Salvar Alterações</Text>
      )}
    </Button>
  );
}
