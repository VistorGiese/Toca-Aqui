import React from "react";
import { View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import EstShowDetailInfoCard from "./EstShowDetailInfoCard";
import { styles } from "../styles";

interface Props {
  formattedDate: string;
  cacheLabel: string;
}

export default function EstShowDetailMetricsGrid({ formattedDate, cacheLabel }: Props) {
  return (
    <View style={styles.grid}>
      <EstShowDetailInfoCard
        label="DATA"
        value={formattedDate}
        icon="calendar-alt"
        iconColor={DS.accent}
        containerStyle={styles.infoCardFlex}
      />
      <EstShowDetailInfoCard
        label="CACHÊ"
        value={`R$ ${cacheLabel}`}
        icon="dollar-sign"
        iconColor={DS.success}
        valueStyle={styles.infoValueSuccess}
        containerStyle={styles.infoCardFlex}
      />
    </View>
  );
}
