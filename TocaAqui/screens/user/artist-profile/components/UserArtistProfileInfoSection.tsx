import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import { styles } from "../styles";

interface Props {
  profile: ArtistProfileSnapshot;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function UserArtistProfileInfoSection({ profile }: Props) {
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
        {profile.anos_experiencia != null ? (
          <InfoRow label="Anos de experiência" value={String(profile.anos_experiencia)} />
        ) : null}
        {profile.esta_disponivel != null ? (
          <InfoRow
            label="Disponível para shows"
            value={profile.esta_disponivel ? "Sim" : "Não"}
          />
        ) : null}
        {profile.tem_estrutura_som != null ? (
          <InfoRow
            label="Possui estrutura de som"
            value={profile.tem_estrutura_som ? "Sim" : "Não"}
          />
        ) : null}
        {profile.url_portfolio ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(profile.url_portfolio!).catch(() => {})}
            activeOpacity={0.8}
          >
            <InfoRow label="Portfólio" value={profile.url_portfolio} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
