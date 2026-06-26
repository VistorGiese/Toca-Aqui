import React from "react";
import { Switch, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  showsRealizados: number;
  notaMedia?: number;
  estaDisponivel: boolean;
  onDisponivelChange: (value: boolean) => void;
}

export default function ArtistEditProfileStatsSection({
  showsRealizados,
  notaMedia,
  estaDisponivel,
  onDisponivelChange,
}: Props) {
  return (
    <>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{showsRealizados}</Text>
          <Text style={styles.statLabel}>SHOWS{"\n"}REALIZADOS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {notaMedia != null ? Number(notaMedia).toFixed(1) : "—"}
          </Text>
          <Text style={styles.statLabel}>NOTA{"\n"}MÉDIA</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Disponibilidade</Text>
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Disponível para shows</Text>
          <Text style={styles.switchHint}>
            {estaDisponivel ? "Seu perfil aparece como disponível" : "Você está indisponível no momento"}
          </Text>
        </View>
        <Switch
          value={estaDisponivel}
          onValueChange={onDisponivelChange}
          trackColor={{ false: "#555577", true: "#7B61FF" }}
          thumbColor="#FFFFFF"
        />
      </View>
    </>
  );
}
