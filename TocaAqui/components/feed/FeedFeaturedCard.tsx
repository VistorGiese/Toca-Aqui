import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Show } from "@/http/showService";
import { colors, getGenreColor, genreColorWithAlpha } from "@/utils/colors";
import { getShowPrice, getShowTitle, getShowVenue } from "@/screens/user/feed/showHelpers";

interface FeedFeaturedCardProps {
  show: Show;
  onPress: () => void;
}

export default function FeedFeaturedCard({ show, onPress }: FeedFeaturedCardProps) {
  const genre = show.genero_musical ?? "";
  const genreColor = getGenreColor(genre);
  const price = getShowPrice(show);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: genreColorWithAlpha(genre, "55") }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.overlay}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>AO VIVO</Text>
        </View>

        <View>
          <View style={[styles.genreBadge, { backgroundColor: genreColorWithAlpha(genre, "33") }]}>
            <Text style={[styles.genreBadgeText, { color: genreColor }]}>
              {genre.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{getShowTitle(show)}</Text>
          <View style={styles.meta}>
            <FontAwesome5 name="map-marker-alt" size={12} color={colors.textSecondary} />
            <Text style={styles.venue}>{getShowVenue(show)}</Text>
            <Text style={styles.price}>{price === 0 ? "Free Entry" : `R$ ${price}`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    height: 220,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
    padding: 16,
    justifyContent: "space-between",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.liveBadge,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  liveBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: colors.white,
    letterSpacing: 1,
  },
  genreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: colors.white,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  venue: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  price: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: colors.priceFree,
  },
});
