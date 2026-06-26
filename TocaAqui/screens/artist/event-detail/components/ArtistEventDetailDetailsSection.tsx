import React from "react";
import { Text, View } from "react-native";
import { EventDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EventDetailDisplay;
}

export default function ArtistEventDetailDetailsSection({ display }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Detalhes da vaga</Text>
      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Som Próprio</Text>
          <View style={styles.toggleVisual}>
            <View style={styles.toggleThumb} />
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gêneros Aceitos</Text>
        </View>
        <View style={styles.genrePillsRow}>
          {(display.eventGenres.length > 0 ? display.eventGenres : ["NÃO INFORMADO"]).map((g) => (
            <View key={g} style={styles.genrePill}>
              <Text style={styles.genrePillText}>{g}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
