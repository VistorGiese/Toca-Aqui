import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  applicationId: number;
}

export default function EstAcceptContractReferenceCard({ applicationId }: Props) {
  return (
    <View style={styles.refCard}>
      <FontAwesome5 name="hashtag" size={12} color={DS.textMuted} />
      <Text style={styles.refText}>Candidatura #{applicationId}</Text>
    </View>
  );
}
