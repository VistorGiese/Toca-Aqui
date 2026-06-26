import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { getRadiusFillPercent } from "../utils";

type Props = {
  radius: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function UserOnboardingLocationRadiusSection({
  radius,
  onDecrease,
  onIncrease,
}: Props) {
  return (
    <View style={styles.radiusCard}>
      <Text style={styles.radiusCardTitle}>RAIO DE BUSCA</Text>
      <Text style={styles.radiusValue}>{radius} KM</Text>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>LOCAL{"\n"}1KM</Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${getRadiusFillPercent(radius)}%` }]} />
          <View style={styles.sliderThumb} />
        </View>
        <Text style={[styles.sliderLabel, { textAlign: "right" }]}>
          ESTENDIDO{"\n"}200KM
        </Text>
      </View>

      <View style={styles.radiusControls}>
        <TouchableOpacity style={styles.radiusBtn} onPress={onDecrease}>
          <FontAwesome5 name="minus" size={14} color={DS.accent} />
        </TouchableOpacity>
        <Text style={styles.radiusBtnLabel}>{radius} km</Text>
        <TouchableOpacity style={styles.radiusBtn} onPress={onIncrease}>
          <FontAwesome5 name="plus" size={14} color={DS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
