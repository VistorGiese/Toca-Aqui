import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { formatBRL } from "@/utils/ticketPricing";
import { DS } from "../constants";
import { styles } from "../styles";
import { UserTicketsTicketCardProps } from "../types";
import { calcDaysLeft, formatDate } from "../utils";

export default function UserTicketsTicketCard({
  ingresso,
  variant,
  onPress,
  onRate,
}: UserTicketsTicketCardProps) {
  const genre = ingresso.Show?.genero_musical ?? "";
  const genreColor = getGenreColor(genre);
  const imageColor = genreColor ? `${genreColor}22` : DS.thumbBg;
  const venue = ingresso.Show
    ? [
        ingresso.Show.EstablishmentProfile?.nome_estabelecimento,
        ingresso.Show.EstablishmentProfile?.Address?.cidade,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const dateStr =
    ingresso.Show?.data_show && ingresso.Show?.horario_inicio
      ? formatDate(ingresso.Show.data_show, ingresso.Show.horario_inicio)
      : "";
  const daysLeft =
    variant === "upcoming" && ingresso.Show?.data_show
      ? calcDaysLeft(ingresso.Show.data_show)
      : null;

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.ticketThumb, { backgroundColor: imageColor }]}>
        <FontAwesome5 name="ticket-alt" size={14} color="rgba(255,255,255,0.45)" />
      </View>

      <View style={styles.ticketInfo}>
        {genre ? (
          <Text style={[styles.genreText, { color: genreColor }]} numberOfLines={1}>
            {genre.toUpperCase()}
          </Text>
        ) : null}
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {ingresso.Show?.titulo_evento ?? "Show"}
        </Text>
        {venue ? (
          <Text style={styles.ticketMeta} numberOfLines={1}>{venue}</Text>
        ) : null}
        {dateStr ? (
          <Text style={styles.ticketDate}>{dateStr}</Text>
        ) : null}
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketPrice}>
            {Number(ingresso.preco) === 0 ? "Gratuito" : formatBRL(Number(ingresso.preco))}
          </Text>
          {daysLeft != null && daysLeft >= 0 ? (
            <Text style={styles.daysText}>
              {daysLeft === 0 ? "Hoje" : `Em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`}
            </Text>
          ) : null}
        </View>
      </View>

      {variant === "past" && onRate ? (
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={(e) => {
            e.stopPropagation();
            onRate();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="star" size={13} color={DS.accent} />
        </TouchableOpacity>
      ) : (
        <FontAwesome5 name="chevron-right" size={11} color={DS.textDis} />
      )}
    </TouchableOpacity>
  );
}
