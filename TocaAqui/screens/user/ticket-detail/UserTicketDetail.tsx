import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import {
  UserTicketDetailHeader,
  UserTicketDetailLoadingState,
  UserTicketDetailQrCard,
  UserTicketDetailShowInfo,
  UserTicketDetailSupportLink,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserTicketDetail } from "./useUserTicketDetail";

export default function UserTicketDetail() {
  const vm = useUserTicketDetail();

  if (vm.loading) {
    return <UserTicketDetailLoadingState />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserTicketDetailHeader onBack={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <UserTicketDetailShowInfo
          statusLabel={vm.statusLabel}
          statusColor={vm.statusColor}
          codigoQr={vm.codigoQr}
          showTitle={vm.showTitle}
          artist={vm.artist}
          venue={vm.venue}
          address={vm.address}
          date={vm.date}
          time={vm.time}
        />

        <UserTicketDetailQrCard
          cardBg={vm.cardBg}
          codigoQr={vm.codigoQr}
          statusLabel={vm.statusLabel}
          statusColor={vm.statusColor}
        />

        <UserTicketDetailSupportLink />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
