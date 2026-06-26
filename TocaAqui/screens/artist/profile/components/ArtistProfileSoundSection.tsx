import React from "react";
import { Text, View } from "react-native";
import { DS } from "../constants";
import { ArtistProfileDisplayData } from "../types";
import { formatCurrency } from "../utils";
import { styles } from "../styles";

interface Props {
  display: Pick<ArtistProfileDisplayData, "temEstruturaSom" | "estruturaSom">;
}

export default function ArtistProfileSoundSection({ display }: Props) {
  const hasSoundInfo =
    display.temEstruturaSom || (display.estruturaSom?.length ?? 0) > 0;
  if (!hasSoundInfo) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estrutura de som</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {display.temEstruturaSom ? "Possui estrutura" : "Não possui estrutura"}
          </Text>
        </View>
      </View>
      {(display.estruturaSom?.length ?? 0) > 0 ? (
        <View style={[styles.chipsWrap, { marginTop: 12 }]}>
          {display.estruturaSom.map((item) => (
            <View
              key={item}
              style={[styles.chip, { backgroundColor: DS.green + "22", borderColor: DS.green + "55" }]}
            >
              <Text style={[styles.chipText, { color: DS.green }]}>{item}</Text>
            </View>
          ))}
        </View>
      ) : display.temEstruturaSom ? (
        <Text style={[styles.bioText, { marginTop: 8 }]}>
          Equipamentos não listados no perfil.
        </Text>
      ) : null}
    </View>
  );
}
