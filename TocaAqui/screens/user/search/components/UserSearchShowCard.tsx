import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ShowPurchaseCta } from "@/components/feed";
import { Show } from "@/http/showService";
import { getGenreColor } from "@/utils/colors";
import {
  getShowArtistName,
  getShowCardColor,
  getShowCoverUrl,
  getShowCtaLabel,
  getShowPriceLabel,
  isShowFree,
} from "@/screens/user/feed/showHelpers";
import { cardStyles } from "../styles";
import { formatShowListDate, formatShowTime, getShowVenueLabel } from "../utils";

interface Props {
  show: Show;
  onPress: () => void;
}

export default function UserSearchShowCard({ show, onPress }: Props) {
  const coverUrl = getShowCoverUrl(show);
  const genreColor = getGenreColor(show.genero_musical ?? "");
  const isFree = isShowFree(show);
  const artistName = getShowArtistName(show);

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[cardStyles.imageArea, { backgroundColor: getShowCardColor(show) }]}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={cardStyles.coverImage} resizeMode="cover" />
        ) : (
          <FontAwesome5 name="music" size={30} color="rgba(255,255,255,0.25)" />
        )}
        {show.genero_musical ? (
          <View style={[cardStyles.genreBadge, { backgroundColor: genreColor + "CC" }]}>
            <Text style={cardStyles.genreBadgeText}>{show.genero_musical.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      <View style={cardStyles.body}>
        <Text style={cardStyles.eventName} numberOfLines={2}>
          {show.titulo_evento}
        </Text>
        {artistName ? (
          <Text style={cardStyles.artistName} numberOfLines={1}>
            {artistName}
          </Text>
        ) : null}

        <View style={cardStyles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={11} color="#555577" />
          <Text style={cardStyles.locationText} numberOfLines={1}>
            {getShowVenueLabel(show)}
          </Text>
        </View>

        <View style={cardStyles.infoRow}>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="calendar" size={11} color="#A0A0B8" />
            <Text style={cardStyles.infoText}>{formatShowListDate(show.data_show)}</Text>
          </View>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="clock" size={11} color="#A0A0B8" />
            <Text style={cardStyles.infoText}>{formatShowTime(show.horario_inicio)}</Text>
          </View>
        </View>

        <View style={cardStyles.footer}>
          <Text style={cardStyles.price}>{getShowPriceLabel(show)}</Text>
          <ShowPurchaseCta
            label={getShowCtaLabel(show)}
            variant={isFree ? "free" : "paid"}
            onPress={onPress}
            stopPropagation
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
