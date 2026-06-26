import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ShowPurchaseCta } from "@/components/feed";
import { FavoriteShowItem } from "@/http/favoriteService";
import {
  getShowCoverUrl,
  getShowCtaLabel,
  getShowPriceLabel,
  isShowFree,
} from "@/screens/user/feed/showHelpers";
import { DS } from "../constants";
import { styles } from "../styles";
import { calcDaysLeft, formatDate } from "../utils";

type Props = {
  item: FavoriteShowItem;
  onPress: (showId: number) => void;
  onRemove: (showId: number) => void;
};

export default function UserFavoritesShowCard({ item, onPress, onRemove }: Props) {
  const { show } = item;
  const coverUrl = getShowCoverUrl(show);
  const daysLeft = show.data_show ? calcDaysLeft(show.data_show) : 0;
  const dateLabel = show.data_show ? formatDate(show.data_show) : "—";
  const venue = show.EstablishmentProfile?.nome_estabelecimento || "—";
  const isFree = isShowFree(show);

  return (
    <TouchableOpacity
      style={styles.showCard}
      onPress={() => onPress(show.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.showImage, { backgroundColor: DS.showImageBg }]}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.showCoverImage} resizeMode="cover" />
        ) : (
          <FontAwesome5 name="music" size={22} color="rgba(255,255,255,0.2)" />
        )}
        <View style={styles.daysBadge}>
          <Text style={styles.daysBadgeText}>EM {daysLeft} DIAS</Text>
        </View>
      </View>
      <View style={styles.showBody}>
        <View style={styles.showBodyTop}>
          <Text style={styles.showDate}>{dateLabel}</Text>
          <TouchableOpacity onPress={() => onRemove(show.id)}>
            <FontAwesome5 name="heart" size={16} color={DS.accent} solid />
          </TouchableOpacity>
        </View>
        <Text style={styles.showTitle}>{show.titulo_evento || "Show"}</Text>
        <Text style={styles.showVenue}>{venue}</Text>
        <View style={styles.showFooter}>
          <Text style={styles.showPrice}>{getShowPriceLabel(show)}</Text>
          <ShowPurchaseCta
            label={getShowCtaLabel(show)}
            variant={isFree ? "free" : "paid"}
            onPress={() => onPress(show.id)}
            stopPropagation
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
