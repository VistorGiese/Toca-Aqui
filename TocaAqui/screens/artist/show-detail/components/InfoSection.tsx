import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, SHOW_SUBTITLE } from "../constants";
import { ShowDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: ShowDetailDisplay;
}

export default function InfoSection({ display }: Props) {
  return (
    <>
      <Text style={styles.showTitle}>{display.title}</Text>
      <Text style={styles.showSubtitle}>{SHOW_SUBTITLE}</Text>

      <View style={styles.infoRow}>
        <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
        <Text style={styles.infoText}>
          {display.formattedDate} • {display.weekday}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <FontAwesome5 name="clock" size={14} color={DS.accent} />
        <Text style={styles.infoText}>
          {display.horarioInicio} — {display.horarioFim}
        </Text>
      </View>
    </>
  );
}
