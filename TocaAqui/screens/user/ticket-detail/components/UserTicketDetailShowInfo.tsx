import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

type Props = {
  statusLabel: string;
  statusColor: string;
  codigoQr: string;
  showTitle: string;
  artist: string;
  venue: string;
  address: string;
  date: string;
  time: string;
};

export default function UserTicketDetailShowInfo({
  statusLabel,
  statusColor,
  codigoQr,
  showTitle,
  artist,
  venue,
  address,
  date,
  time,
}: Props) {
  return (
    <>
      <View style={styles.confirmedRow}>
        <View
          style={[
            styles.confirmedBadge,
            { backgroundColor: statusColor + "1F" },
          ]}
        >
          <FontAwesome5 name="check-circle" size={13} color={statusColor} />
          <Text style={[styles.confirmedText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        {codigoQr ? (
          <Text style={styles.codeText}>{codigoQr.slice(0, 12)}</Text>
        ) : null}
      </View>

      <Text style={styles.showTitle}>{showTitle}</Text>
      <Text style={styles.artistName}>{artist}</Text>

      {(venue || address) ? (
        <View style={styles.infoRow}>
          <FontAwesome5 name="map-marker-alt" size={13} color="#A78BFA" />
          <Text style={styles.infoText}>
            {[venue, address].filter(Boolean).join(" — ")}
          </Text>
        </View>
      ) : null}
      {date ? (
        <View style={styles.infoRow}>
          <FontAwesome5 name="calendar-alt" size={13} color="#A78BFA" />
          <Text style={styles.infoText}>{date}</Text>
        </View>
      ) : null}
      {time ? (
        <View style={styles.infoRow}>
          <FontAwesome5 name="clock" size={13} color="#A78BFA" />
          <Text style={styles.infoText}>{time}</Text>
        </View>
      ) : null}
    </>
  );
}
