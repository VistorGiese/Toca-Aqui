import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Show } from "@/http/showService";
import { colors, getGenreColor, genreColorWithAlpha } from "@/utils/colors";
import {
  formatShowDate,
  getShowCardColor,
  getShowPrice,
  getShowTitle,
  getShowVenue,
} from "@/screens/user/feed/showHelpers";

interface FeedShowCardProps {
  show: Show;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function FeedShowCard({
  show,
  isFavorite,
  onPress,
  onToggleFavorite,
}: FeedShowCardProps) {
  const price = getShowPrice(show);
  const genreColor = getGenreColor(show.genero_musical ?? "");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.image, { backgroundColor: getShowCardColor(show) }]}>
        <FontAwesome5 name="music" size={22} color={colors.iconOnSurface} />
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
        >
          <FontAwesome5
            name="heart"
            size={16}
            color={isFavorite ? colors.purpleLight : colors.textMuted}
            solid={isFavorite}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={[styles.genreBadge, { backgroundColor: genreColorWithAlpha(show.genero_musical ?? "", "22") }]}>
            <Text style={[styles.genreBadgeText, { color: genreColor }]}>
              {(show.genero_musical ?? "").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{getShowTitle(show)}</Text>

        <View style={styles.meta}>
          <FontAwesome5 name="map-marker-alt" size={11} color={colors.textTertiary} />
          <Text style={styles.metaText}>{getShowVenue(show)}</Text>
        </View>
        <View style={styles.meta}>
          <FontAwesome5 name="calendar-alt" size={11} color={colors.textTertiary} />
          <Text style={styles.metaText}>{formatShowDate(show.data_show)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {price === 0 ? "Free Entry" : `R$ ${price}`}
          </Text>
          <TouchableOpacity
            style={price === 0 ? styles.confirmBtn : styles.buyBtn}
            onPress={onPress}
          >
            <Text style={price === 0 ? styles.confirmBtnText : styles.buyBtnText}>
              {price === 0 ? "CONFIRMAR PRESENÇA" : "GARANTIR INGRESSO"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
  },
  image: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlayDarkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 14,
  },
  top: {
    marginBottom: 6,
  },
  genreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genreBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: colors.white,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  price: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: colors.priceFree,
  },
  buyBtn: {
    backgroundColor: colors.purplePrimary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buyBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.5,
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: colors.purpleLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  confirmBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: colors.purpleLight,
    letterSpacing: 0.5,
  },
});
