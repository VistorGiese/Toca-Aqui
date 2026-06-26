import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  urls: string[];
}

export default function UserArtistProfileGallerySection({ urls }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Galeria</Text>
      {urls.length === 0 ? (
        <Text style={styles.emptyHint}>Nenhuma foto adicionada no cadastro</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pressKitRow}
        >
          {urls.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.pressKitImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
