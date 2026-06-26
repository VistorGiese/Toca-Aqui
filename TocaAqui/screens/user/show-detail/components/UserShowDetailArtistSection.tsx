import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ConfirmedBand } from "../types";
import { styles } from "../styles";

interface Props {
  artistId: number | null;
  artistName: string | null;
  confirmedBand: ConfirmedBand | null;
  onPressArtist: () => void;
}

export default function UserShowDetailArtistSection({
  artistId,
  artistName,
  confirmedBand,
  onPressArtist,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>O Artista</Text>
      {artistId ? (
        <TouchableOpacity
          style={styles.artistCard}
          onPress={onPressArtist}
          activeOpacity={0.85}
        >
          <View style={styles.artistAvatar}>
            <FontAwesome5 name="microphone" size={20} color={DS.accent} />
          </View>
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{artistName}</Text>
            {confirmedBand?.generos_musicais?.length ? (
              <Text style={styles.artistBio} numberOfLines={2}>
                {confirmedBand.generos_musicais.join(", ")}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.viewProfileBtn} onPress={onPressArtist}>
            <Text style={styles.viewProfileText}>ver perfil completo</Text>
            <FontAwesome5 name="chevron-right" size={10} color={DS.accent} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : artistName ? (
        <View style={styles.artistCard}>
          <View style={styles.artistAvatar}>
            <FontAwesome5 name="microphone" size={20} color={DS.accent} />
          </View>
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{artistName}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.artistCard}>
          <View style={[styles.artistAvatar, styles.artistAvatarMuted]}>
            <FontAwesome5 name="microphone" size={20} color={DS.textDis} />
          </View>
          <View style={styles.artistInfo}>
            <Text style={[styles.artistName, styles.artistNameMuted]}>
              Artista a ser confirmado
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
