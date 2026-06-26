import React from "react";
import { Text, View } from "react-native";
import { ArtistProfileSnapshot } from "@/utils/artistProfile";
import { styles } from "../styles";
import UserArtistProfileChipList from "./UserArtistProfileChipList";

interface Props {
  profile: ArtistProfileSnapshot;
}

export default function UserArtistProfileSoundSection({ profile }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Equipamentos / estrutura de som</Text>
      {profile.tem_estrutura_som === false ? (
        <Text style={styles.emptyHint}>Artista informou que não possui estrutura própria</Text>
      ) : profile.estrutura_som && profile.estrutura_som.length > 0 ? (
        <UserArtistProfileChipList items={profile.estrutura_som} icon="volume-up" color="#6DB885" />
      ) : (
        <Text style={styles.emptyHint}>
          {profile.tem_estrutura_som
            ? "Possui estrutura, mas ainda não detalhou os equipamentos"
            : "Não informado pelo artista"}
        </Text>
      )}
    </View>
  );
}
