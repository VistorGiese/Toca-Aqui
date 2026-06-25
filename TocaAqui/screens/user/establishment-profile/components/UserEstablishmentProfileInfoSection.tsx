import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { UserEstablishmentProfileDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: UserEstablishmentProfileDisplay;
}

export default function UserEstablishmentProfileInfoSection({ display }: Props) {
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoCard}>
        <FontAwesome5 name="clock" size={14} color={DS.accent} />
        <Text style={styles.infoLabel}>HORÁRIO</Text>
        <Text style={styles.infoValue}>
          {display.abertura} – {display.fechamento}
        </Text>
      </View>
      {display.capacidade ? (
        <View style={styles.infoCard}>
          <FontAwesome5 name="users" size={14} color={DS.accent} />
          <Text style={styles.infoLabel}>CAPACIDADE</Text>
          <Text style={styles.infoValue}>{display.capacidade} pessoas</Text>
        </View>
      ) : null}
    </View>
  );
}
