import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  date: string;
  time: string;
}

export default function UserShowDetailInfoGrid({ date, time }: Props) {
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
        <View>
          <Text style={styles.infoLabel}>Data</Text>
          <Text style={styles.infoValue}>{date}</Text>
        </View>
      </View>
      <View style={styles.infoItem}>
        <FontAwesome5 name="clock" size={14} color={DS.accent} />
        <View>
          <Text style={styles.infoLabel}>Horário</Text>
          <Text style={styles.infoValue}>{time}</Text>
        </View>
      </View>
    </View>
  );
}
