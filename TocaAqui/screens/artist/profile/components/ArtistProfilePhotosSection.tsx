import React from "react";
import { Image, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  fotosUrls: string[];
}

export default function ArtistProfilePhotosSection({ fotosUrls }: Props) {
  if (fotosUrls.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Press kit</Text>
      <View style={styles.photosGrid}>
        {fotosUrls.slice(0, 6).map((url, i) => (
          <Image key={`${url}-${i}`} source={{ uri: url }} style={styles.photoThumb} resizeMode="cover" />
        ))}
      </View>
    </View>
  );
}
