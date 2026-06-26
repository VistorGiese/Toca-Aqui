import React from "react";
import { Switch, Text, View } from "react-native";
import { EQUIPAMENTOS_OPCOES } from "../constants";
import ArtistEditProfileChipSection from "./ArtistEditProfileChipSection";
import { styles } from "../styles";

interface Props {
  temEstrutura: boolean;
  equipamentos: string[];
  onTemEstruturaChange: (value: boolean) => void;
  onToggleEquipamento: (item: string) => void;
  error?: string;
}

export default function ArtistEditProfileSoundSection({
  temEstrutura,
  equipamentos,
  onTemEstruturaChange,
  onToggleEquipamento,
  error,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Estrutura de som</Text>
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Possuo estrutura de som própria</Text>
        </View>
        <Switch
          value={temEstrutura}
          onValueChange={onTemEstruturaChange}
          trackColor={{ false: "#555577", true: "#7B61FF" }}
          thumbColor="#FFFFFF"
        />
      </View>
      {temEstrutura ? (
        <ArtistEditProfileChipSection
          title="Equipamentos"
          options={EQUIPAMENTOS_OPCOES}
          selected={equipamentos}
          onToggle={onToggleEquipamento}
          error={error}
        />
      ) : null}
    </>
  );
}
