import React from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  EstShowDetailActionsSection,
  EstShowDetailCancellationClause,
  EstShowDetailHeader,
  EstShowDetailHeroSection,
  EstShowDetailInfoCard,
  EstShowDetailLoadingState,
  EstShowDetailMetricsGrid,
  EstShowDetailPendingBanner,
  EstShowDetailWorkflowSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstShowDetail } from "./useEstShowDetail";

export default function EstShowDetail() {
  const vm = useEstShowDetail();

  if (vm.loading) {
    return <EstShowDetailLoadingState />;
  }

  if (!vm.contract || !vm.display) {
    return null;
  }

  const { display } = vm;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstShowDetailHeader onBack={vm.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <EstShowDetailHeroSection
          statusLabel={display.statusLabel}
          statusColor={display.statusColor}
          refNumber={display.refNumber}
        />

        <EstShowDetailInfoCard
          label="EVENTO"
          value={display.eventName}
          valueStyle={styles.infoValue}
        />

        <EstShowDetailMetricsGrid
          formattedDate={display.formattedDate}
          cacheLabel={display.cacheLabel}
        />

        {display.showSchedule ? (
          <EstShowDetailInfoCard
            label="HORÁRIO"
            value={`${display.horarioInicio ?? "--"} — ${display.horarioFim ?? "--"}`}
            valueStyle={styles.infoValue}
          />
        ) : null}

        {display.showContracted && display.contractedName ? (
          <EstShowDetailInfoCard label="CONTRATADO" value={display.contractedName} valueStyle={styles.infoValue}>
            <View style={styles.artistRow}>
              <View style={styles.artistAvatar}>
                <FontAwesome5 name="user" size={16} color={DS.accent} />
              </View>
              <Text style={styles.infoValue}>{display.contractedName}</Text>
            </View>
          </EstShowDetailInfoCard>
        ) : null}

        {display.showContratante && display.contratanteName ? (
          <EstShowDetailInfoCard
            label="CONTRATANTE"
            value={display.contratanteName}
            valueStyle={styles.infoValue}
          />
        ) : null}

        {display.showLocal && display.localEvento ? (
          <EstShowDetailInfoCard label="LOCAL DO EVENTO" value={display.localEvento} />
        ) : null}

        {display.showSinal && display.sinalLabel && display.sinalValue ? (
          <EstShowDetailInfoCard
            label={display.sinalLabel}
            value={`R$ ${display.sinalValue}`}
            valueStyle={styles.infoValueAmber}
          />
        ) : null}

        {!display.showIsPublic ? <EstShowDetailPendingBanner /> : null}

        <EstShowDetailWorkflowSection
          contractId={vm.contractId}
          contract={vm.contract}
          workflow={vm.workflow}
          onRefresh={vm.refreshWorkflowAndLoad}
          onApproved={vm.handleContractApproved}
        />

        {display.showCancellationClause ? <EstShowDetailCancellationClause /> : null}

        <EstShowDetailActionsSection
          display={display}
          completing={vm.completing}
          cancelling={vm.cancelling}
          onRate={vm.handleRateArtist}
          onComplete={vm.handleComplete}
          onCancel={vm.handleCancel}
        />
      </ScrollView>
    </View>
  );
}
