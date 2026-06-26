import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Contract } from "@/http/contractService";
import { DS } from "../constants";
import { formatContractCache, formatContractDate, getContractBadge } from "../utils";
import { styles } from "../styles";

interface Props {
  contract: Contract;
  onPress: () => void;
}

export default function ArtistHomeContractCard({ contract, onPress }: Props) {
  const badge = getContractBadge(contract.status);
  const dateText = formatContractDate(contract.data_evento);
  const cacheText = formatContractCache(contract.cache_total);

  return (
    <View style={styles.contractCard}>
      <View style={styles.contractImagePlaceholder}>
        <FontAwesome5 name="music" size={24} color={DS.textDis} />
      </View>
      <View style={styles.contractInfo}>
        <View style={styles.contractBadgeRow}>
          <View style={[styles.contractBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.contractBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        <Text style={styles.contractEventName} numberOfLines={1}>
          {contract.nome_evento || `Contrato #${contract.id}`}
        </Text>
        {contract.cidade ? (
          <View style={styles.contractLocationRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
            <Text style={styles.contractLocationText}>{contract.cidade}</Text>
          </View>
        ) : null}
        {dateText ? <Text style={styles.contractDateText}>{dateText}</Text> : null}
        {cacheText ? <Text style={styles.contractCacheText}>{cacheText}</Text> : null}
      </View>
      <TouchableOpacity style={styles.contractFab} onPress={onPress}>
        <FontAwesome5 name="chevron-right" size={12} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}
