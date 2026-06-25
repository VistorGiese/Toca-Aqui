import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  photosUrls: string[];
}

export default function UserEstablishmentProfilePhotosSection({ photosUrls }: Props) {
  if (photosUrls.length <= 1) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fotos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
        {photosUrls.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photoThumb} />
        ))}
      </ScrollView>
    </View>
  );
}
