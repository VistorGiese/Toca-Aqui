import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ArtistNotification } from "../types";
import {
  formatTimeAgo,
  getNotificationIcon,
  getNotificationMessage,
  getNotificationTimestamp,
} from "../utils";
import { styles } from "../styles";

interface Props {
  item: ArtistNotification;
}

export default function ArtistNotificationCard({ item }: Props) {
  const icon = getNotificationIcon(item.tipo);
  const isRead = Boolean(item.lida);

  return (
    <View style={[styles.card, isRead && styles.cardRead]}>
      {!isRead ? <View style={styles.unreadDot} /> : null}
      <View style={[styles.iconCircle, { backgroundColor: icon.color + "22" }]}>
        <FontAwesome5 name={icon.name as "bell"} size={16} color={icon.color} />
      </View>
      <View style={styles.content}>
        {item.titulo ? <Text style={styles.titulo}>{item.titulo}</Text> : null}
        <Text style={[styles.mensagem, isRead && styles.mensagemRead]} numberOfLines={2}>
          {getNotificationMessage(item)}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(getNotificationTimestamp(item))}</Text>
      </View>
    </View>
  );
}
