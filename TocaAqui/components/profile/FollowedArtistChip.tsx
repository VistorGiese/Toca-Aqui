import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ArtistaPublico } from "@/http/artistaPublicoService";
import { colors, genreColorWithAlpha } from "@/utils/colors";

interface FollowedArtistChipProps {
  artist: ArtistaPublico;
  onPress: () => void;
}

export default function FollowedArtistChip({ artist, onPress }: FollowedArtistChipProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: genreColorWithAlpha(artist.generos?.[0] ?? "", "44"),
          },
        ]}
      >
        <FontAwesome5 name="microphone" size={16} color={colors.iconOnSurfaceMuted} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {artist.nome_artistico}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    width: 64,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: colors.accentBorderSoft,
  },
  name: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
