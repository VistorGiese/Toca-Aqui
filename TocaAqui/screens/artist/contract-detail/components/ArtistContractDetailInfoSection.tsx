import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ContractPreview } from "../types";
import { styles } from "../styles";

interface Props {
  preview: ContractPreview;
  formattedDate: string;
}

export default function ArtistContractDetailInfoSection({ preview, formattedDate }: Props) {
  return (
    <>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardLabel}>EVENTO</Text>
        <Text style={styles.infoCardValue}>{preview.tituloEvento}</Text>
      </View>

      <View style={styles.gridRow}>
        <View style={[styles.infoCard, { flex: 1 }]}>
          <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
          <Text style={styles.infoCardLabel}>DATA</Text>
          <Text style={styles.infoCardValueSmall}>{formattedDate}</Text>
        </View>
        <View style={[styles.infoCard, { flex: 1 }]}>
          <FontAwesome5 name="map-marker-alt" size={14} color={DS.accent} />
          <Text style={styles.infoCardLabel}>LOCAL</Text>
          <Text style={styles.infoCardValueSmall}>{preview.localEvento}</Text>
        </View>
      </View>
    </>
  );
}
