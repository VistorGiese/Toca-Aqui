import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import EstArtistProfileInfoRow from "./EstArtistProfileInfoRow";
import { styles } from "../styles";

interface Props {
  profile: ArtistProfileSnapshot;
}

export default function EstArtistProfileInfoSection({ profile }: Props) {
  const hasContent =
    profile.anos_experiencia != null ||
    profile.esta_disponivel != null ||
    profile.tem_estrutura_som != null ||
    Boolean(profile.url_portfolio);

  if (!hasContent) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.infoCard}>
        {profile.anos_experiencia != null && (
          <EstArtistProfileInfoRow
            label="Anos de experiência"
            value={String(profile.anos_experiencia)}
          />
        )}
        {profile.esta_disponivel != null && (
          <EstArtistProfileInfoRow
            label="Disponível para shows"
            value={profile.esta_disponivel ? "Sim" : "Não"}
          />
        )}
        {profile.tem_estrutura_som != null && (
          <EstArtistProfileInfoRow
            label="Possui estrutura de som"
            value={profile.tem_estrutura_som ? "Sim" : "Não"}
          />
        )}
        {profile.url_portfolio ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(profile.url_portfolio!).catch(() => {})}
            activeOpacity={0.8}
          >
            <EstArtistProfileInfoRow label="Portfólio" value={profile.url_portfolio} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
