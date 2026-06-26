import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  onExplore: () => void;
};

export default function UserTicketsExploreCard({ onExplore }: Props) {
  return (
    <View style={styles.exploreCard}>
      <FontAwesome5
        name="compass"
        size={20}
        color={DS.accent}
        style={styles.exploreIcon}
      />
      <Text style={styles.exploreTitle}>Procurando por mais eventos?</Text>
      <Text style={styles.exploreSubtitle}>
        Descubra shows incríveis perto de você.
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={onExplore} activeOpacity={0.85}>
        <Text style={styles.exploreBtnText}>EXPLORAR EVENTOS</Text>
      </TouchableOpacity>
    </View>
  );
}
