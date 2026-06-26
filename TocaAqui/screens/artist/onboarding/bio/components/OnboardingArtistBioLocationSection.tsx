import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";
import { IbgeCidade, IbgeEstado } from "../types";

interface Props {
  estado: IbgeEstado | null;
  cidade: IbgeCidade | null;
  loadingEstados: boolean;
  loadingCidades: boolean;
  locationLabel: string;
  estadoError?: string;
  cidadeError?: string;
  onOpenEstadoPicker: () => void;
  onOpenCidadePicker: () => void;
}

export default function OnboardingArtistBioLocationSection({
  estado,
  cidade,
  loadingEstados,
  loadingCidades,
  locationLabel,
  estadoError,
  cidadeError,
  onOpenEstadoPicker,
  onOpenCidadePicker,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Onde a mágica acontece?</Text>
      <Text style={styles.sectionSubtitle}>
        Informe sua cidade base para aparecer nos resultados de busca da sua região.
      </Text>

      <Text style={styles.fieldLabel}>ESTADO</Text>
      <TouchableOpacity
        style={[styles.selector, !estado && styles.selectorEmpty, estadoError && styles.selectorError]}
        onPress={onOpenEstadoPicker}
        activeOpacity={0.75}
      >
        <Text style={estado ? styles.selectorText : styles.selectorPlaceholder}>
          {estado ? `${estado.nome} (${estado.sigla})` : "Selecione o estado"}
        </Text>
        {loadingEstados ? (
          <ActivityIndicator size="small" color={DS.accent} />
        ) : (
          <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
        )}
      </TouchableOpacity>
      <FieldError message={estadoError} />

      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>CIDADE</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          (!estado || !cidade) && styles.selectorEmpty,
          !estado && styles.selectorDisabled,
          cidadeError && styles.selectorError,
        ]}
        onPress={() => estado && onOpenCidadePicker()}
        activeOpacity={estado ? 0.75 : 1}
      >
        <Text style={cidade ? styles.selectorText : styles.selectorPlaceholder}>
          {!estado ? "Selecione o estado primeiro" : cidade ? cidade.nome : "Selecione a cidade"}
        </Text>
        {loadingCidades ? (
          <ActivityIndicator size="small" color={DS.accent} />
        ) : (
          <FontAwesome5 name="chevron-down" size={12} color={DS.textSec} />
        )}
      </TouchableOpacity>
      <FieldError message={cidadeError} />

      <View style={styles.mapCard}>
        <MaterialCommunityIcons name="map-marker" size={32} color={DS.accent} />
        <Text style={styles.mapLabel}>LOCALIZAÇÃO BASE</Text>
        <Text style={styles.mapSub}>{locationLabel}</Text>
      </View>
    </>
  );
}
