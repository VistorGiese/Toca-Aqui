import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  dates: string[];
  novaData: string;
  onNovaDataChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (date: string) => void;
}

export default function ArtistEditProfileUnavailableSection({
  dates,
  novaData,
  onNovaDataChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Datas indisponíveis</Text>
      <Text style={styles.helper}>Use o formato AAAA-MM-DD (ex: 2026-07-15)</Text>
      {dates.map((date) => (
        <View key={date} style={styles.linkRow}>
          <Text style={styles.linkText}>{date}</Text>
          <TouchableOpacity onPress={() => onRemove(date)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TextInput
        style={styles.input}
        value={novaData}
        onChangeText={onNovaDataChange}
        placeholder="2026-07-15"
        placeholderTextColor="#555577"
        autoCapitalize="none"
        keyboardType="number-pad"
        maxLength={10}
      />
      <TouchableOpacity style={styles.addLinkBtn} onPress={onAdd} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={12} color="#7B61FF" />
        <Text style={styles.addLinkText}>Adicionar data</Text>
      </TouchableOpacity>
    </>
  );
}
