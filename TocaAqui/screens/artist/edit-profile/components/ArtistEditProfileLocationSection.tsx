import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { IbgeEstado } from "@/screens/establishment/onboarding/context/types";
import { ArtistEditProfileFieldErrors } from "../types";
import { styles } from "../styles";

interface Props {
  estado: string;
  cidade: string;
  selectedEstado: IbgeEstado | null;
  loadingEstados: boolean;
  loadingCidades: boolean;
  onOpenEstadoPicker: () => void;
  onOpenCidadePicker: () => void;
  errors: ArtistEditProfileFieldErrors;
}

export default function ArtistEditProfileLocationSection({
  estado,
  cidade,
  selectedEstado,
  loadingEstados,
  loadingCidades,
  onOpenEstadoPicker,
  onOpenCidadePicker,
  errors,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Localização</Text>

      <Text style={styles.fieldLabel}>ESTADO</Text>
      <TouchableOpacity
        style={[styles.selector, errors.estado ? styles.inputError : null]}
        onPress={onOpenEstadoPicker}
        activeOpacity={0.75}
      >
        <Text style={estado ? styles.selectorText : styles.selectorPlaceholder}>
          {selectedEstado
            ? `${selectedEstado.nome} (${selectedEstado.sigla})`
            : "Selecione o estado"}
        </Text>
        {loadingEstados ? (
          <ActivityIndicator size="small" color="#7B61FF" />
        ) : (
          <MaterialCommunityIcons name="chevron-down" size={20} color="#8888AA" />
        )}
      </TouchableOpacity>
      <FieldError message={errors.estado} />

      <Text style={styles.fieldLabel}>CIDADE</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          !estado && styles.selectorDisabled,
          errors.cidade ? styles.inputError : null,
        ]}
        onPress={() => estado && onOpenCidadePicker()}
        activeOpacity={estado ? 0.75 : 1}
      >
        <Text style={cidade ? styles.selectorText : styles.selectorPlaceholder}>
          {!estado ? "Selecione o estado primeiro" : cidade || "Selecione a cidade"}
        </Text>
        {loadingCidades ? (
          <ActivityIndicator size="small" color="#7B61FF" />
        ) : (
          <MaterialCommunityIcons name="chevron-down" size={20} color="#8888AA" />
        )}
      </TouchableOpacity>
      <FieldError message={errors.cidade} />
    </>
  );
}
