import React from "react";
import { View, Text } from "react-native";
import { QR_INSTRUCTION } from "../constants";
import { styles } from "../styles";
import UserTicketDetailFakeQRCode from "./UserTicketDetailFakeQRCode";

type Props = {
  cardBg: string;
  codigoQr: string;
  statusLabel: string;
  statusColor: string;
};

export default function UserTicketDetailQrCard({
  cardBg,
  codigoQr,
  statusLabel,
  statusColor,
}: Props) {
  return (
    <View style={[styles.qrCard, { backgroundColor: cardBg }]}>
      <View style={styles.qrCardOverlay}>
        <UserTicketDetailFakeQRCode />
        <Text style={styles.qrInstruction}>{QR_INSTRUCTION}</Text>
        {codigoQr ? (
          <Text style={styles.qrCodeText}>{codigoQr}</Text>
        ) : null}
        <View
          style={[
            styles.validBadge,
            {
              borderColor: statusColor + "4D",
              backgroundColor: statusColor + "1F",
            },
          ]}
        >
          <View style={[styles.validDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.validText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
