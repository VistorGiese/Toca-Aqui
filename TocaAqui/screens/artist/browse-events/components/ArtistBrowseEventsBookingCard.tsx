import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Booking } from "@/http/bookingService";
import { BandApplication } from "@/http/bandApplicationService";
import { DS } from "../constants";
import { cardStyles } from "../styles";
import { formatBookingDate, getVenueLabel } from "../utils";

interface Props {
  booking: Booking;
  applicationStatus?: BandApplication["status"];
  onPress: () => void;
}

export default function ArtistBrowseEventsBookingCard({
  booking,
  applicationStatus,
  onPress,
}: Props) {
  const isNew = booking.status === "pendente";
  const isPendingApplication = applicationStatus === "pendente";

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.imageArea}>
        <FontAwesome5 name="music" size={30} color={DS.textDis} />
        <View
          style={[
            cardStyles.statusBadge,
            { backgroundColor: isNew ? DS.accent : DS.danger },
          ]}
        >
          <Text style={cardStyles.statusBadgeText}>{isNew ? "NOVA" : "ENCERRANDO"}</Text>
        </View>
      </View>

      <View style={cardStyles.body}>
        <Text style={cardStyles.eventName} numberOfLines={1}>
          {booking.titulo_evento || `Vaga #${booking.id}`}
        </Text>

        <View style={cardStyles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={11} color={DS.textDis} />
          <Text style={cardStyles.locationText}>{getVenueLabel(booking)}</Text>
        </View>

        <View style={cardStyles.infoRow}>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="calendar" size={11} color={DS.textSec} />
            <Text style={cardStyles.infoText}>{formatBookingDate(booking.data_show)}</Text>
          </View>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="clock" size={11} color={DS.textSec} />
            <Text style={cardStyles.infoText}>
              {booking.horario_inicio} — {booking.horario_fim}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[cardStyles.btnCandidatar, isPendingApplication && cardStyles.btnAguardando]}
          onPress={isPendingApplication ? undefined : onPress}
          activeOpacity={isPendingApplication ? 1 : 0.85}
          disabled={isPendingApplication}
        >
          <Text style={cardStyles.btnCandidatarText}>
            {isPendingApplication ? "AGUARDANDO RETORNO" : "CANDIDATAR-SE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
