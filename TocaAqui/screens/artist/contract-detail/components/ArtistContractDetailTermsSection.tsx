import React from "react";
import { Text, View } from "react-native";
import { ContractPreview } from "../types";
import { styles } from "../styles";

interface Props {
  preview: ContractPreview;
}

export default function ArtistContractDetailTermsSection({ preview }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Termos Acordados</Text>
      <View style={styles.termsCard}>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Cachê</Text>
          <Text style={styles.termValue}>R$ {preview.cacheTotal}</Text>
        </View>
        <View style={styles.termDivider} />
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Horário</Text>
          <Text style={styles.termNote}>
            {preview.horarioInicio} — {preview.horarioFim}
          </Text>
        </View>
        <View style={styles.termDivider} />
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Estabelecimento</Text>
          <Text style={styles.termNote}>{preview.nomeContratante}</Text>
        </View>
      </View>
    </>
  );
}
