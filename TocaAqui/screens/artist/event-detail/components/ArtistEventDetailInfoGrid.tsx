import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { EventDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EventDetailDisplay;
}

export default function ArtistEventDetailInfoGrid({ display }: Props) {
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoGridCard}>
        <FontAwesome5 name="calendar-alt" size={16} color={DS.accent} />
        <Text style={styles.infoGridLabel}>DATA</Text>
        <Text style={styles.infoGridValue}>{display.formattedDate}</Text>
      </View>
      <View style={styles.infoGridCard}>
        <FontAwesome5 name="clock" size={16} color={DS.accent} />
        <Text style={styles.infoGridLabel}>HORÁRIO</Text>
        <Text style={styles.infoGridValue}>{display.horario}</Text>
      </View>
    </View>
  );
}
