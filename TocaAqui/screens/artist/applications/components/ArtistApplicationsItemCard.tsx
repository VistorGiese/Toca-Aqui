import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { BandApplication } from "@/http/bandApplicationService";
import { DS } from "../constants";
import { styles } from "../styles";
import { formatApplicationDate, formatProposedValue } from "../utils";

interface Props {
  application: BandApplication;
  onViewContract?: (contractId: number) => void;
}

export default function ArtistApplicationsItemCard({ application, onViewContract }: Props) {
  const isPending = application.status === "pendente";
  const isAccepted = application.status === "aceito";

  const statusIcon = isPending
    ? { name: "clock" as const, color: DS.accent }
    : isAccepted
      ? { name: "check-circle" as const, color: DS.success }
      : { name: "times-circle" as const, color: DS.danger };

  const proposedValue = formatProposedValue(application.valor_proposto);

  return (
    <View style={styles.card}>
      <View style={styles.thumbnail}>
        <FontAwesome5 name="music" size={20} color={DS.textMuted} />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.eventName} numberOfLines={1}>
            {application.nome_evento || `Vaga #${application.evento_id}`}
          </Text>
          <FontAwesome5 name={statusIcon.name} size={16} color={statusIcon.color} solid />
        </View>

        {application.nome_estabelecimento ? (
          <Text style={styles.venueText}>{application.nome_estabelecimento}</Text>
        ) : null}

        <Text style={styles.dateText}>{formatApplicationDate(application.data_show)}</Text>

        {application.horario_inicio ? (
          <Text style={styles.timeText}>
            {application.horario_inicio} — {application.horario_fim}
          </Text>
        ) : null}

        {proposedValue ? (
          <Text style={styles.valueText}>Valor proposto: {proposedValue}</Text>
        ) : null}

        {isPending ? (
          <View style={styles.statusBadgePending}>
            <Text style={styles.statusBadgePendingText}>Candidatura em análise...</Text>
          </View>
        ) : isAccepted ? (
          <>
            <View style={styles.statusBadgeAccepted}>
              <Text style={styles.statusBadgeAcceptedText}>ACEITA</Text>
            </View>
            {application.contrato_id != null && onViewContract ? (
              <TouchableOpacity
                style={styles.contractBtn}
                onPress={() => onViewContract(application.contrato_id!)}
                activeOpacity={0.85}
              >
                <Text style={styles.contractBtnText}>VER SHOW CONTRATADO</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <View style={styles.statusBadgeRejected}>
            <Text style={styles.statusBadgeRejectedText}>RECUSADA</Text>
          </View>
        )}
      </View>
    </View>
  );
}
