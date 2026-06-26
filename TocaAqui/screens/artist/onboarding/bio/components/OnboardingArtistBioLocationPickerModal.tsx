import React from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { IbgeCidade, IbgeEstado, LocationPickerMode } from "../types";

interface Props {
  pickerMode: LocationPickerMode;
  searchText: string;
  filteredEstados: IbgeEstado[];
  filteredCidades: IbgeCidade[];
  selectedEstado: IbgeEstado | null;
  selectedCidade: IbgeCidade | null;
  onSearchChange: (text: string) => void;
  onClose: () => void;
  onSelectEstado: (item: IbgeEstado) => void;
  onSelectCidade: (item: IbgeCidade) => void;
}

export default function OnboardingArtistBioLocationPickerModal({
  pickerMode,
  searchText,
  filteredEstados,
  filteredCidades,
  selectedEstado,
  selectedCidade,
  onSearchChange,
  onClose,
  onSelectEstado,
  onSelectCidade,
}: Props) {
  return (
    <Modal visible={pickerMode !== null} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {pickerMode === "estado" ? "Selecione o Estado" : "Selecione a Cidade"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <FontAwesome5 name="times" size={18} color={DS.textSec} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={13} color={DS.textSec} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={pickerMode === "estado" ? "Buscar estado..." : "Buscar cidade..."}
              placeholderTextColor={DS.textSec}
              value={searchText}
              onChangeText={onSearchChange}
              autoFocus
            />
          </View>

          {pickerMode === "estado" ? (
            <FlatList
              data={filteredEstados}
              keyExtractor={(item) => item.sigla}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedEstado?.sigla === item.sigla && styles.pickerItemActive,
                  ]}
                  onPress={() => onSelectEstado(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerItemSigla}>{item.sigla}</Text>
                  <Text
                    style={[
                      styles.pickerItemNome,
                      selectedEstado?.sigla === item.sigla && { color: DS.accent },
                    ]}
                  >
                    {item.nome}
                  </Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <FlatList
              data={filteredCidades}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedCidade?.id === item.id && styles.pickerItemActive,
                  ]}
                  onPress={() => onSelectCidade(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemNome,
                      selectedCidade?.id === item.id && { color: DS.accent },
                    ]}
                  >
                    {item.nome}
                  </Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
