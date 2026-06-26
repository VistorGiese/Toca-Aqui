import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { UpcomingShow } from "../types";
import { formatShowDate } from "../utils";
import { styles } from "../styles";

interface Props {
  shows: UpcomingShow[];
  canBuyTickets: boolean;
  onBuyTicket: (show: UpcomingShow) => void;
}

export default function UserArtistProfileShowsSection({
  shows,
  canBuyTickets,
  onBuyTicket,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Próximos shows</Text>
      {shows.length === 0 ? (
        <Text style={styles.emptyHint}>Nenhum show programado</Text>
      ) : (
        shows.map((show) => (
          <View key={show.id} style={styles.showRow}>
            <View style={styles.showDateBlock}>
              <Text style={styles.showDate}>{formatShowDate(show.data_show)}</Text>
            </View>
            <View style={styles.showInfo}>
              <Text style={styles.showTitle}>{show.titulo_evento}</Text>
              <Text style={styles.showVenue}>
                {show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado"}
              </Text>
            </View>
            {canBuyTickets ? (
              <TouchableOpacity style={styles.buyTicketBtn} onPress={() => onBuyTicket(show)}>
                <Text style={styles.buyTicketText}>COMPRAR</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}
