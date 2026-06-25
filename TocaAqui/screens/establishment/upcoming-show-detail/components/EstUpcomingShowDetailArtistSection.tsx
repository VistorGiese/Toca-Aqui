import React from "react";
import { Image, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  nomeArtista: string;
  fotoUrl: string | null;
}

export default function EstUpcomingShowDetailArtistSection({ nomeArtista, fotoUrl }: Props) {
  return (
    <View style={styles.artistSection}>
      <View style={styles.avatarWrap}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <FontAwesome5 name="user" size={32} color={DS.accent} />
          </View>
        )}
      </View>
      {nomeArtista ? <Text style={styles.artistName}>{nomeArtista}</Text> : null}
    </View>
  );
}
