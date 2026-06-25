import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { IbgeEstado } from "../../onboarding/context/types";
import { EstEditProfileFieldErrors } from "../types";
import EstEditProfileFormField from "./EstEditProfileFormField";
import { styles } from "../styles";

interface Props {
  estado: string;
  cidade: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  selectedEstado: IbgeEstado | null;
  loadingEstados: boolean;
  loadingCidades: boolean;
  onOpenEstadoPicker: () => void;
  onOpenCidadePicker: () => void;
  onEnderecoChange: (value: string) => void;
  onNumeroChange: (value: string) => void;
  onBairroChange: (value: string) => void;
  onCepChange: (value: string) => void;
  errors: EstEditProfileFieldErrors;
}

export default function EstEditProfileAddressSection({
  estado,
  cidade,
  endereco,
  numero,
  bairro,
  cep,
  selectedEstado,
  loadingEstados,
  loadingCidades,
  onOpenEstadoPicker,
  onOpenCidadePicker,
  onEnderecoChange,
  onNumeroChange,
  onBairroChange,
  onCepChange,
  errors,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Endereço</Text>

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

      <View style={styles.row}>
        <View style={styles.flex}>
          <EstEditProfileFormField
            label="RUA / AVENIDA"
            labelVariant="field"
            value={endereco}
            onChangeText={onEnderecoChange}
            placeholder="Ex: Av. Paulista"
            error={errors.endereco}
          />
        </View>
        <View style={styles.numeroField}>
          <EstEditProfileFormField
            label="NÚMERO"
            labelVariant="field"
            value={numero}
            onChangeText={onNumeroChange}
            placeholder="1578"
            keyboardType="numeric"
            error={errors.numero}
          />
        </View>
      </View>

      <EstEditProfileFormField
        label="BAIRRO"
        labelVariant="field"
        value={bairro}
        onChangeText={onBairroChange}
        placeholder="Centro"
        error={errors.bairro}
      />

      <EstEditProfileFormField
        label="CEP"
        labelVariant="field"
        value={cep}
        onChangeText={onCepChange}
        placeholder="00000-000"
        keyboardType="number-pad"
        maxLength={9}
        error={errors.cep}
      />
    </>
  );
}
