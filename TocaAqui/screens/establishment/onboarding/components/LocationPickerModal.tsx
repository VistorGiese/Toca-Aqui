import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { IbgeCidade, IbgeEstado } from "../context/types";

export type LocationPickerMode = "estado" | "cidade" | null;

interface Props {
  visible: boolean;
  mode: LocationPickerMode;
  searchText: string;
  onSearchChange: (text: string) => void;
  onClose: () => void;
  estados: IbgeEstado[];
  cidades: IbgeCidade[];
  selectedEstadoSigla?: string;
  selectedCidadeId?: number;
  onSelectEstado: (estado: IbgeEstado) => void;
  onSelectCidade: (cidade: IbgeCidade) => void;
}

export default function LocationPickerModal({
  visible,
  mode,
  searchText,
  onSearchChange,
  onClose,
  estados,
  cidades,
  selectedEstadoSigla,
  selectedCidadeId,
  onSelectEstado,
  onSelectCidade,
}: Props) {
  const filteredEstados = estados.filter(
    (e) =>
      e.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      e.sigla.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCidades = cidades.filter((c) =>
    c.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === "estado" ? "Selecione o Estado" : "Selecione a Cidade"}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={mode === "estado" ? "Buscar estado..." : "Buscar cidade..."}
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={onSearchChange}
              autoFocus
            />
          </View>

          {mode === "estado" ? (
            <FlatList
              data={filteredEstados}
              keyExtractor={(item) => item.sigla}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, selectedEstadoSigla === item.sigla && styles.itemActive]}
                  onPress={() => onSelectEstado(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemSigla}>{item.sigla}</Text>
                  <Text
                    style={[
                      styles.itemNome,
                      selectedEstadoSigla === item.sigla && styles.itemNomeActive,
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
                  style={[styles.item, selectedCidadeId === item.id && styles.itemActive]}
                  onPress={() => onSelectCidade(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.itemNome,
                      selectedCidadeId === item.id && styles.itemNomeActive,
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.purpleBlack2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  title: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 16,
    color: colors.white,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.white,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    gap: 12,
  },
  itemActive: {
    backgroundColor: colors.accentSoftBg,
  },
  itemSigla: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: colors.purpleLight,
    width: 30,
  },
  itemNome: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.white,
    flex: 1,
  },
  itemNomeActive: {
    color: colors.purpleLight,
  },
});
