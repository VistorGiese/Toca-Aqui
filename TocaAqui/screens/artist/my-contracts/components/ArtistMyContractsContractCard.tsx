import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Contract } from "@/http/contractService";
import { DS } from "../constants";
import { styles } from "../styles";
import { formatContractValue, formatDate, getStatusConfig } from "../utils";

interface Props {
  contract: Contract;
  onPress: (contractId: number) => void;
}

export default function ArtistMyContractsContractCard({ contract, onPress }: Props) {
  const config = getStatusConfig(contract.status);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: config.color }]}
      onPress={() => onPress(contract.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.contractTitle} numberOfLines={1}>
          {contract.nome_evento || `Contrato #${contract.id}`}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <FontAwesome5 name="calendar" size={12} color={DS.textSec} />
          <Text style={styles.detailText}>
            {formatDate(contract.data_evento ?? contract.data_show)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome5 name="clock" size={12} color={DS.textSec} />
          <Text style={styles.detailText}>
            {contract.horario_inicio || "—"} - {contract.horario_fim || "—"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome5 name="money-bill-wave" size={12} color={DS.success} />
          <Text style={[styles.detailText, styles.valueText]}>{formatContractValue(contract)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
