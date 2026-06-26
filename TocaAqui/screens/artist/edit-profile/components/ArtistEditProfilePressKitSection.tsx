import React from "react";
import { Text } from "react-native";
import PhotoGalleryEditor from "@/screens/establishment/onboarding/components/PhotoGalleryEditor";
import { styles } from "../styles";

interface Props {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

export default function ArtistEditProfilePressKitSection({ photos, onAdd, onRemove }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Press kit</Text>
      <PhotoGalleryEditor photos={photos} onAdd={onAdd} onRemove={onRemove} />
    </>
  );
}
