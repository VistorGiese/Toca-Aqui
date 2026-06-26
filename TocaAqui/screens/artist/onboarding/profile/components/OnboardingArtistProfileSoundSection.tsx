import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS, EQUIPAMENTOS_OPCOES } from "../constants";
import { styles } from "../styles";

interface Props {
  temEstrutura: boolean;
  estrutura: string[];
  error?: string;
  onTemEstruturaChange: (value: boolean) => void;
  onToggleEquipamento: (item: string) => void;
}

export default function OnboardingArtistProfileSoundSection({
  temEstrutura,
  estrutura,
  error,
  onTemEstruturaChange,
  onToggleEquipamento,
}: Props) {
  return (
    <View style={[styles.estruturaCard, error ? styles.estruturaCardError : null]}>
      <View style={styles.estruturaHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.estruturaTitulo}>Estrutura de Som</Text>
          <Text style={styles.estruturaSub}>Eu possuo P.A. e equipamentos próprios</Text>
        </View>
        <Switch
          value={temEstrutura}
          onValueChange={onTemEstruturaChange}
          trackColor={{ false: DS.textDis, true: DS.accent }}
          thumbColor={DS.white}
        />
      </View>

      {temEstrutura ? (
        <View style={styles.equipamentosContainer}>
          <Text style={styles.equipamentosLabel}>EQUIPAMENTOS DISPONÍVEIS</Text>
          <View style={styles.checkGrid}>
            {EQUIPAMENTOS_OPCOES.map((item) => {
              const checked = estrutura.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.checkItem}
                  onPress={() => onToggleEquipamento(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                    {checked ? <FontAwesome5 name="check" size={9} color={DS.white} /> : null}
                  </View>
                  <Text style={styles.checkLabel}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <FieldError message={error} />
    </View>
  );
}
