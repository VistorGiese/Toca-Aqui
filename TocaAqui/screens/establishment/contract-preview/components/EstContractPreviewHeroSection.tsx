import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, SCREEN_TITLE } from "../constants";
import { styles } from "../styles";

interface Props {
  gigTitle: string;
  refContrato: string;
  workflowLabel: string;
}

export default function EstContractPreviewHeroSection({
  gigTitle,
  refContrato,
  workflowLabel,
}: Props) {
  return (
    <>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="file-contract" size={32} color={DS.accent} />
        </View>
      </View>

      <Text style={styles.title}>{SCREEN_TITLE}</Text>
      <Text style={styles.subtitle}>{gigTitle}</Text>
      <Text style={styles.ref}>Ref. {refContrato}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{workflowLabel}</Text>
      </View>
    </>
  );
}
