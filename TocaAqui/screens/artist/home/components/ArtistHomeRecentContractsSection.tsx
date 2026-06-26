import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Contract } from "@/http/contractService";
import { DS } from "../constants";
import ArtistHomeContractCard from "./ArtistHomeContractCard";
import { styles } from "../styles";

interface Props {
  contracts: Contract[];
  onContractPress: (contractId: number) => void;
  onBrowseEvents: () => void;
}

export default function ArtistHomeRecentContractsSection({
  contracts,
  onContractPress,
  onBrowseEvents,
}: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimas Candidaturas</Text>
        <Text style={styles.sectionSub}>ÚLTIMAS 3</Text>
      </View>

      {contracts.length === 0 ? (
        <View style={styles.emptyCard}>
          <FontAwesome5 name="guitar" size={28} color={DS.textDis} />
          <Text style={styles.emptyText}>Nenhuma candidatura ainda</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={onBrowseEvents}>
            <Text style={styles.emptyBtnText}>Explorar vagas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        contracts.map((contract) => (
          <ArtistHomeContractCard
            key={contract.id}
            contract={contract}
            onPress={() => onContractPress(contract.id)}
          />
        ))
      )}
    </>
  );
}
