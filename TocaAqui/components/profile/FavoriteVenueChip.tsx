import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FavoriteEstablishmentItem } from "@/http/favoriteService";
import { colors } from "@/utils/colors";

interface FavoriteVenueChipProps {
  venue: FavoriteEstablishmentItem;
  onPress: () => void;
}

export default function FavoriteVenueChip({ venue, onPress }: FavoriteVenueChipProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatar}>
        <FontAwesome5 name="store" size={16} color={colors.iconOnSurfaceMuted} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {venue.nome_estabelecimento}
      </Text>
      {venue.cidade ? (
        <Text style={styles.city} numberOfLines={1}>
          {venue.cidade}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    width: 72,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(123,97,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: colors.accentBorderSoft,
  },
  name: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },
  city: {
    fontFamily: "Montserrat-Regular",
    fontSize: 9,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: 2,
  },
});
