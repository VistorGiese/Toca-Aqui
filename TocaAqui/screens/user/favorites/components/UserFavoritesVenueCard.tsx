import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FavoriteEstablishmentItem } from "@/http/favoriteService";
import { resolveImageUrl } from "@/utils/adapters";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  local: FavoriteEstablishmentItem;
  onPress: (establishmentId: number) => void;
  onRemove: (establishmentId: number) => void;
};

export default function UserFavoritesVenueCard({ local, onPress, onRemove }: Props) {
  const fotoUrl = resolveImageUrl(local.foto_url);

  return (
    <View style={styles.venueCard}>
      <TouchableOpacity
        style={styles.venueCardPressable}
        onPress={() => onPress(local.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.venueImage, { backgroundColor: DS.venueImageBg }]}>
          {fotoUrl ? (
            <Image
              source={{ uri: fotoUrl }}
              style={styles.venueImageCover}
              resizeMode="cover"
            />
          ) : (
            <FontAwesome5 name="building" size={20} color="rgba(255,255,255,0.4)" />
          )}
        </View>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{local.nome_estabelecimento}</Text>
          <View style={styles.venueCityRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
            <Text style={styles.venueCity}>{local.cidade || "—"}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.venueHeartBtn}
        onPress={() => onRemove(local.id)}
      >
        <FontAwesome5 name="heart" size={14} color={DS.accent} solid />
      </TouchableOpacity>
    </View>
  );
}
