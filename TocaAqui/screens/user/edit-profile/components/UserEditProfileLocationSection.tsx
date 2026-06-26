import React from "react";
import {
  ActivityIndicator,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { IbgeEstado } from "@/screens/establishment/onboarding/context/types";
import { USER_EDIT_PROFILE_VENUE_TYPES } from "../constants";
import { UserEditProfileFieldErrors } from "../types";
import { styles } from "../styles";

interface Props {
  estado: string;
  cidade: string;
  cidadeTexto: string;
  onCidadeTextoChange: (value: string) => void;
  selectedEstado: IbgeEstado | null;
  loadingEstados: boolean;
  loadingCidades: boolean;
  onOpenEstadoPicker: () => void;
  onOpenCidadePicker: () => void;
  raio: number;
  onRaioDecrease: () => void;
  onRaioIncrease: () => void;
  tiposLocal: string[];
  onToggleTipoLocal: (tipo: string) => void;
  notifNovosShows: boolean;
  onNotifNovosShowsChange: (value: boolean) => void;
  notifLembretes: boolean;
  onNotifLembretesChange: (value: boolean) => void;
  errors: UserEditProfileFieldErrors;
}

export default function UserEditProfileLocationSection({
  estado,
  cidade,
  cidadeTexto,
  onCidadeTextoChange,
  selectedEstado,
  loadingEstados,
  loadingCidades,
  onOpenEstadoPicker,
  onOpenCidadePicker,
  raio,
  onRaioDecrease,
  onRaioIncrease,
  tiposLocal,
  onToggleTipoLocal,
  notifNovosShows,
  onNotifNovosShowsChange,
  notifLembretes,
  onNotifLembretesChange,
  errors,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Localização e preferências</Text>

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

      <Text style={styles.orDivider}>ou digite sua cidade</Text>
      <View style={[styles.selector, errors.cidade ? styles.inputError : null, { paddingVertical: 0 }]}>
        <FontAwesome5 name="map-marker-alt" size={14} color="#A78BFA" style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.selectorText, { paddingVertical: 14 }]}
          placeholder="Busque sua cidade..."
          placeholderTextColor="#555577"
          value={cidadeTexto}
          onChangeText={onCidadeTextoChange}
        />
      </View>
      <FieldError message={errors.cidade} />

      <View style={styles.radiusCard}>
        <Text style={styles.radiusCardTitle}>RAIO DE BUSCA</Text>
        <Text style={styles.radiusValue}>{raio} KM</Text>
        <View style={styles.radiusControls}>
          <TouchableOpacity style={styles.radiusBtn} onPress={onRaioDecrease} activeOpacity={0.7}>
            <FontAwesome5 name="minus" size={14} color="#A78BFA" />
          </TouchableOpacity>
          <Text style={styles.radiusBtnLabel}>{raio} km</Text>
          <TouchableOpacity style={styles.radiusBtn} onPress={onRaioIncrease} activeOpacity={0.7}>
            <FontAwesome5 name="plus" size={14} color="#A78BFA" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.fieldLabel}>TIPOS DE LOCAL</Text>
      <View style={styles.venueGrid}>
        {USER_EDIT_PROFILE_VENUE_TYPES.map((tipo) => {
          const isSelected = tiposLocal.includes(tipo);
          return (
            <TouchableOpacity
              key={tipo}
              style={[styles.venueChip, isSelected && styles.venueChipSelected]}
              onPress={() => onToggleTipoLocal(tipo)}
              activeOpacity={0.7}
            >
              <Text style={[styles.venueChipText, isSelected && styles.venueChipTextSelected]}>
                {tipo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Notificar novos shows</Text>
        <Switch
          value={notifNovosShows}
          onValueChange={onNotifNovosShowsChange}
          trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
          thumbColor={notifNovosShows ? "#A78BFA" : "#555577"}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Lembretes de shows</Text>
        <Switch
          value={notifLembretes}
          onValueChange={onNotifLembretesChange}
          trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
          thumbColor={notifLembretes ? "#A78BFA" : "#555577"}
        />
      </View>
    </>
  );
}
