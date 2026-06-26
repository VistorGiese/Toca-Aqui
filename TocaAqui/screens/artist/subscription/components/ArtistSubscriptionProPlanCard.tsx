import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, PRO_FEATURES } from "../constants";
import { styles } from "../styles";

interface Props {
  onAssinarPro: () => void;
}

export default function ArtistSubscriptionProPlanCard({ onAssinarPro }: Props) {
  return (
    <View style={styles.proPlanCard}>
      <View style={styles.proPlanHeader}>
        <View>
          <Text style={styles.proPlanTag}>ACESSO ILIMITADO</Text>
          <View style={styles.proDot} />
        </View>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMENDADO</Text>
        </View>
      </View>

      <Text style={styles.proPrice}>
        Pro <Text style={styles.proPriceValue}>R$29</Text>
        <Text style={styles.proPriceMonth}>/mês</Text>
      </Text>

      <View style={styles.separator} />

      {PRO_FEATURES.map((f) => (
        <View key={f.label} style={styles.featureRow}>
          <FontAwesome5 name="check" size={13} color={DS.accent} />
          <Text style={styles.featureTextPro}>{f.label}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.btnAssinarPro}
        onPress={onAssinarPro}
        activeOpacity={0.85}
      >
        <Text style={styles.btnAssinarProText}>ASSINAR PRO</Text>
      </TouchableOpacity>
    </View>
  );
}
