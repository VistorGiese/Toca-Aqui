import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  hasArtistProfile: boolean;
  hasEstablishment: boolean;
  onGoToArtistNavigator: () => void;
  onGoToArtistOnboarding: () => void;
  onGoToEstablishmentNavigator: () => void;
  onGoToVenueRegister: () => void;
};

export default function UserSettingsManageProfileSection({
  hasArtistProfile,
  hasEstablishment,
  onGoToArtistNavigator,
  onGoToArtistOnboarding,
  onGoToEstablishmentNavigator,
  onGoToVenueRegister,
}: Props) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionLabelRow}>
        <FontAwesome5 name="star" size={15} color={DS.accent} />
        <Text style={styles.sectionLabel}>GERENCIAR PERFIL</Text>
      </View>

      {hasArtistProfile ? (
        <TouchableOpacity
          style={styles.profileActionCard}
          onPress={onGoToArtistNavigator}
          activeOpacity={0.85}
        >
          <View style={[styles.profileActionIcon, { backgroundColor: "rgba(167,139,250,0.18)" }]}>
            <FontAwesome5 name="microphone" size={18} color={DS.accent} />
          </View>
          <View style={styles.profileActionInfo}>
            <Text style={styles.profileActionTitle}>Acessar Perfil de Artista</Text>
            <Text style={styles.profileActionSubtitle}>
              Gerencie seu perfil, shows e contratos
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.profileActionCard}
          onPress={onGoToArtistOnboarding}
          activeOpacity={0.85}
        >
          <View style={styles.profileActionIcon}>
            <FontAwesome5 name="microphone" size={18} color={DS.accent} />
          </View>
          <View style={styles.profileActionInfo}>
            <Text style={styles.profileActionTitle}>Criar Perfil de Artista</Text>
            <Text style={styles.profileActionSubtitle}>
              Mostre seu talento e apareça nos shows
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {hasEstablishment ? (
        <TouchableOpacity
          style={styles.profileActionCard}
          onPress={onGoToEstablishmentNavigator}
          activeOpacity={0.85}
        >
          <View style={[styles.profileActionIcon, { backgroundColor: "rgba(0,206,201,0.12)" }]}>
            <FontAwesome5 name="building" size={18} color={DS.accentTeal} />
          </View>
          <View style={styles.profileActionInfo}>
            <Text style={styles.profileActionTitle}>Acessar Estabelecimento</Text>
            <Text style={styles.profileActionSubtitle}>
              Gerencie vagas, contratos e agenda
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.profileActionCard}
          onPress={onGoToVenueRegister}
          activeOpacity={0.85}
        >
          <View style={styles.profileActionIcon}>
            <FontAwesome5 name="building" size={18} color={DS.accent} />
          </View>
          <View style={styles.profileActionInfo}>
            <Text style={styles.profileActionTitle}>Criar Perfil de Estabelecimento</Text>
            <Text style={styles.profileActionSubtitle}>
              Cadastre seu espaço e organize eventos
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
        </TouchableOpacity>
      )}
    </View>
  );
}
