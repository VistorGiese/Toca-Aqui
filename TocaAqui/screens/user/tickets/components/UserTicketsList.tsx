import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ingresso } from "@/http/ingressoService";
import { EMPTY_PAST, EMPTY_UPCOMING } from "../constants";
import { styles } from "../styles";
import { TicketsTab } from "../types";
import UserTicketsExploreCard from "./UserTicketsExploreCard";
import UserTicketsTicketCard from "./UserTicketsTicketCard";

type Props = {
  activeTab: TicketsTab;
  tickets: Ingresso[];
  onTicketPress: (ticketId: number) => void;
  onTicketRate: (ingresso: Ingresso) => (() => void) | undefined;
  onExplore: () => void;
};

export default function UserTicketsList({
  activeTab,
  tickets,
  onTicketPress,
  onTicketRate,
  onExplore,
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {tickets.length === 0 ? (
        <Text style={styles.emptyText}>
          {activeTab === "upcoming" ? EMPTY_UPCOMING : EMPTY_PAST}
        </Text>
      ) : (
        tickets.map((ingresso) => (
          <UserTicketsTicketCard
            key={ingresso.id}
            ingresso={ingresso}
            variant={activeTab}
            onPress={() => onTicketPress(ingresso.id)}
            onRate={onTicketRate(ingresso)}
          />
        ))
      )}

      {activeTab === "upcoming" && (
        <UserTicketsExploreCard onExplore={onExplore} />
      )}

      <View style={styles.scrollBottomSpacer} />
    </ScrollView>
  );
}
