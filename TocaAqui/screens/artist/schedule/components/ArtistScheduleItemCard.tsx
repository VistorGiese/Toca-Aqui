import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { DS } from "../constants";
import { ArtistScheduleItem } from "../types";
import { styles } from "../styles";

interface Props {
  item: ArtistScheduleItem;
  onPress: (item: ArtistScheduleItem) => void;
}

export default function ArtistScheduleItemCard({ item, onPress }: Props) {
  const horario = item.horarioInicio?.substring(0, 5) ?? "--:--";
  const accentColor = getGenreColor(item.title);

  return (
    <TouchableOpacity
      style={[styles.itemCard, { borderLeftColor: accentColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{horario}</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
        <View style={styles.statusPill}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>
            {item.statusLabel.toUpperCase()}
          </Text>
        </View>
      </View>
      <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
    </TouchableOpacity>
  );
}
