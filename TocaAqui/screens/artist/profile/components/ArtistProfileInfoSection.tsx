import React from "react";
import { Text, View } from "react-native";
import { ArtistProfileDisplayData } from "../types";
import { styles } from "../styles";

interface Props {
  display: Pick<ArtistProfileDisplayData, "anosExperiencia" | "urlPortfolio">;
}

export default function ArtistProfileInfoSection({ display }: Props) {
  if (!display.anosExperiencia && !display.urlPortfolio) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detalhes</Text>
      <View style={styles.infoCard}>
        {display.anosExperiencia != null ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experiência</Text>
            <Text style={styles.infoValue}>
              {display.anosExperiencia}{" "}
              {display.anosExperiencia === 1 ? "ano" : "anos"}
            </Text>
          </View>
        ) : null}
        {display.urlPortfolio ? (
          <View
            style={[
              styles.infoRow,
              display.anosExperiencia != null ? styles.infoRowBorder : null,
            ]}
          >
            <Text style={styles.infoLabel}>Portfólio</Text>
            <Text style={styles.linkText} numberOfLines={1}>
              {display.urlPortfolio}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
