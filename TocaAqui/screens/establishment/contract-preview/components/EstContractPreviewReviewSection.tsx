import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";
import EstContractPreviewActionButton from "./EstContractPreviewActionButton";

interface Props {
  reviewHint: string;
  awaitingApproval: boolean;
  busy: boolean;
  onViewArtistContract: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function EstContractPreviewReviewSection({
  reviewHint,
  awaitingApproval,
  busy,
  onViewArtistContract,
  onApprove,
  onReject,
}: Props) {
  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>REVISÃO DO CONTRATO DO ARTISTA</Text>
      <Text style={styles.reviewHint}>{reviewHint}</Text>

      <EstContractPreviewActionButton
        variant="cyan"
        label="VER CONTRATO"
        icon="file-pdf"
        busy={busy}
        onPress={onViewArtistContract}
      />

      {awaitingApproval ? (
        <>
          <EstContractPreviewActionButton
            variant="success"
            label="APROVAR CONTRATO E ABRIR PARA ANÚNCIO"
            icon="check-circle"
            busy={busy}
            onPress={onApprove}
          />

          <EstContractPreviewActionButton
            variant="danger"
            label="CANCELAR CONTRATO"
            icon="times-circle"
            busy={busy}
            onPress={onReject}
          />
        </>
      ) : null}
    </View>
  );
}
