import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  EstAcceptContractActionsSection,
  EstAcceptContractBanner,
  EstAcceptContractCandidateCard,
  EstAcceptContractHeader,
  EstAcceptContractHeroSection,
  EstAcceptContractHiringInfoCard,
  EstAcceptContractMessageCard,
  EstAcceptContractReferenceCard,
} from "./components";
import {
  CLOSED_EVENT_MESSAGE,
  DS,
  REACCEPT_BANNER_MESSAGE,
} from "./constants";
import { styles } from "./styles";
import { useEstAcceptContract } from "./useEstAcceptContract";

export default function EstAcceptContract() {
  const vm = useEstAcceptContract();
  const { display } = vm;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstAcceptContractHeader onBack={vm.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {display.showClosedBanner ? (
          <EstAcceptContractBanner variant="closed" message={CLOSED_EVENT_MESSAGE} />
        ) : null}

        {display.showRejectedBanner ? (
          <EstAcceptContractBanner variant="rejected" message={REACCEPT_BANNER_MESSAGE} />
        ) : null}

        <EstAcceptContractHeroSection gigTitle={display.gigTitle} status={display.status} />

        <EstAcceptContractCandidateCard
          isBanda={display.isBanda}
          contratadoLabel={display.contratadoLabel}
          artistName={display.artistName}
          valorProposto={display.valorProposto}
        />

        {display.mensagem ? (
          <EstAcceptContractMessageCard message={display.mensagem} />
        ) : null}

        <EstAcceptContractReferenceCard applicationId={display.applicationId} />

        <EstAcceptContractHiringInfoCard />

        <EstAcceptContractActionsSection
          display={display}
          loading={vm.loading}
          onAccept={vm.handleAccept}
          onReject={vm.handleReject}
          onViewProfile={vm.openProfile}
        />
      </ScrollView>
    </View>
  );
}
