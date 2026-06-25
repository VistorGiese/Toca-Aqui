import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  statusLabel: string;
  statusColor: string;
  refNumber: string;
}

export default function EstShowDetailHeroSection({ statusLabel, statusColor, refNumber }: Props) {
  return (
    <>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="music" size={28} color={DS.accent} />
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          { borderColor: statusColor, backgroundColor: `${statusColor}18` },
        ]}
      >
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      <Text style={styles.refText}>Ref. #{refNumber}</Text>
    </>
  );
}
