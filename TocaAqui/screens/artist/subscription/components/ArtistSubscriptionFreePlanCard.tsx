import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, FREE_FEATURES } from "../constants";
import { styles } from "../styles";

export default function ArtistSubscriptionFreePlanCard() {
  return (
    <View style={styles.freePlanCard}>
      <Text style={styles.planTag}>PLANO INICIAL</Text>
      <Text style={styles.freePrice}>Gratuito</Text>
      <View style={styles.separator} />
      {FREE_FEATURES.map((f) => (
        <View key={f.label} style={styles.featureRow}>
          <FontAwesome5
            name={f.included ? "check" : "times"}
            size={13}
            color={f.included ? DS.success : DS.textDis}
          />
          <Text style={[styles.featureText, !f.included && styles.featureTextDisabled]}>
            {f.label}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btnContinueFree} activeOpacity={0.8}>
        <Text style={styles.btnContinueFreeText}>CONTINUAR NO GRATUITO</Text>
      </TouchableOpacity>
    </View>
  );
}
