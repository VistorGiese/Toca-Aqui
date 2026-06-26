import React from "react";
import { Image, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { resolveImageUrl } from "@/utils/adapters";
import { DS } from "../constants";
import { styles } from "../styles";
import { BandDetailData } from "../types";

interface Props {
  band: BandDetailData;
}

export default function ArtistBandDetailHero({ band }: Props) {
  const imageUrl = resolveImageUrl(band.imagem);

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.heroImage} />;
  }

  return (
    <View style={styles.heroPlaceholder}>
      <FontAwesome5 name="users" size={52} color={DS.accent} />
    </View>
  );
}
