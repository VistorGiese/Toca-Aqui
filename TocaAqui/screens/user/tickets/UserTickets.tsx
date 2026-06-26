import React from "react";
import { StatusBar, View } from "react-native";
import {
  UserTicketsHeader,
  UserTicketsList,
  UserTicketsLoadingState,
  UserTicketsTabs,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserTickets } from "./useUserTickets";

export default function UserTickets() {
  const vm = useUserTickets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserTicketsHeader />

      <UserTicketsTabs activeTab={vm.activeTab} onTabChange={vm.setActiveTab} />

      {vm.loading ? (
        <UserTicketsLoadingState />
      ) : (
        <UserTicketsList
          activeTab={vm.activeTab}
          tickets={vm.tickets}
          onTicketPress={vm.goToDetail}
          onTicketRate={vm.getTicketRateHandler}
          onExplore={vm.goToFeed}
        />
      )}
    </View>
  );
}
