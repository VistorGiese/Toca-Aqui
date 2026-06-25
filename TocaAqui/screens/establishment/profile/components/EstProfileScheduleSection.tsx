import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  abertura: string;
  fechamento: string;
  visible: boolean;
}

export default function EstProfileScheduleSection({ abertura, fechamento, visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Horários de Shows</Text>
      <View style={styles.horariosCard}>
        <View style={styles.horarioRow}>
          <Text style={styles.horarioDia}>Abertura</Text>
          <Text style={styles.horarioHora}>{abertura}</Text>
        </View>
        <View style={[styles.horarioRow, styles.horarioRowBorder]}>
          <Text style={styles.horarioDia}>Fechamento</Text>
          <Text style={styles.horarioHora}>{fechamento}</Text>
        </View>
      </View>
    </View>
  );
}
