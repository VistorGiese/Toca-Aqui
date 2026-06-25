import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Show } from "@/http/showService";
import { DS } from "../constants";
import { formatShowDate } from "../utils";
import { styles } from "../styles";

interface Props {
  shows: Show[];
  canBuyTickets: boolean;
  onShowPress: (showId: number) => void;
}

export default function UserEstablishmentProfileShowsSection({
  shows,
  canBuyTickets,
  onShowPress,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Próximos shows</Text>
      {shows.length === 0 ? (
        <Text style={styles.emptySection}>Nenhum show programado</Text>
      ) : (
        shows.map((show) => {
          const rowContent = (
            <>
              <View style={styles.showDateBlock}>
                <Text style={styles.showDate}>{formatShowDate(show.data_show)}</Text>
              </View>
              <View style={styles.showInfo}>
                <Text style={styles.showTitle}>{show.titulo_evento}</Text>
                <Text style={styles.showArtist}>
                  {show.nome_artista ?? show.Contract?.Band?.nome_banda ?? "Artista a confirmar"}
                </Text>
              </View>
              {canBuyTickets ? (
                <FontAwesome5 name="chevron-right" size={12} color={DS.textMuted} />
              ) : null}
            </>
          );

          if (!canBuyTickets) {
            return (
              <View key={show.id} style={styles.showRow}>
                {rowContent}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={show.id}
              style={styles.showRow}
              onPress={() => onShowPress(show.id)}
              activeOpacity={0.85}
            >
              {rowContent}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}
