import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, genreColorWithAlpha } from "@/utils/colors";

interface UpcomingShow {
  id: number;
  titulo_evento: string;
  data_show: string;
  genero_musical?: string;
}

interface UpcomingShowCardProps {
  show: UpcomingShow;
  onPress: () => void;
}

function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    return `${day} ${month}`;
  } catch {
    return dataShow;
  }
}

export default function UpcomingShowCard({ show, onPress }: UpcomingShowCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.image,
          { backgroundColor: genreColorWithAlpha(show.genero_musical ?? "", "44") || colors.cardFallback },
        ]}
      >
        <FontAwesome5 name="music" size={16} color={colors.iconOnSurface} />
      </View>
      <View style={styles.info}>
        <Text style={styles.date}>{formatShowDate(show.data_show)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {show.titulo_evento}
        </Text>
      </View>
      <FontAwesome5 name="ticket-alt" size={12} color={colors.purpleLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 10,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  date: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: colors.purpleLight,
    marginBottom: 2,
  },
  title: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: colors.white,
    lineHeight: 16,
  },
});
