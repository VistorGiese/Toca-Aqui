import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, STATUS_LABEL } from "../constants";
import { ApplicationStatus } from "../types";
import { styles } from "../styles";

interface Props {
  gigTitle: string;
  status: ApplicationStatus;
}

export default function EstAcceptContractHeroSection({ gigTitle, status }: Props) {
  const statusInfo = STATUS_LABEL[status];

  return (
    <>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="file-alt" size={32} color={DS.accent} />
        </View>
      </View>

      <Text style={styles.title}>Candidatura para</Text>
      <Text style={styles.gigTitle}>{gigTitle}</Text>

      <View
        style={[
          styles.statusPill,
          {
            borderColor: `${statusInfo.color}55`,
            backgroundColor: `${statusInfo.color}18`,
          },
        ]}
      >
        <Text style={[styles.statusPillText, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      </View>
    </>
  );
}
